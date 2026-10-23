import test from 'node:test';
import assert from 'node:assert/strict';
import { enforceComparisonRateLimit, COMPARISON_RATE_LIMIT_ID } from '../../src/lib/server/compare-protection';
import { POST as compare } from '../../src/app/api/compare/route';
import { consumeComparisonStream } from '../../src/lib/client/requests';
import { mainCandidates, oldRules, newRules } from '../fixtures/rules';
import { MODEL } from '../../src/lib/server/ai/cloudflare';

async function production(run: () => Promise<void>) {
  const values = { NODE_ENV: 'production', VERCEL: '1', VERCEL_PROJECT_PRODUCTION_URL: 'proofpath-ten.vercel.app',
    ANALYSIS_ENABLED: 'true', CLOUDFLARE_FREE_PLAN_CONFIRMED: 'true',
    CLOUDFLARE_ACCOUNT_ID: 'a'.repeat(32), CLOUDFLARE_API_TOKEN: 'synthetic-offline-test-token' };
  const previous = Object.keys(values).map(key => process.env[key]);
  const fetcher = globalThis.fetch;
  Object.assign(process.env, values);
  try { await run(); }
  finally {
    Object.keys(values).forEach((key, i) => { if (previous[i] === undefined) delete process.env[key]; else process.env[key] = previous[i]; });
    globalThis.fetch = fetcher;
  }
}
function request() {
  const form = new FormData();
  form.set('old', new File([oldRules], 'old.txt')); form.set('new', new File([newRules], 'new.txt'));
  form.set('attemptId', 'protected-offline-attempt');
  return new Request('https://proofpath-ten.vercel.app/api/compare', {
    method: 'POST', body: form, headers: { host: 'proofpath-ten.vercel.app', origin: 'https://proofpath-ten.vercel.app', 'x-real-ip': '192.0.2.10' },
  });
}

test('public rate-limit check uses configured host and platform IP without forwarding caller credentials', () => production(async () => {
  const incoming = new Request('https://untrusted.example/api/compare', {
    headers: { host: 'untrusted.example', 'x-real-ip': '2001:db8::1', cookie: 'private-cookie', authorization: 'private-header', 'x-forwarded-for': 'spoofed' },
  });
  let checks = 0;
  await enforceComparisonRateLimit(incoming, async (id, options) => {
    checks++;
    assert.equal(id, 'rule_proofpath_compare_B67HTY');
    assert.equal(id, COMPARISON_RATE_LIMIT_ID); assert.equal(options?.timeout, 2_000);
    assert.equal(new URL(options!.request!.url).host, 'proofpath-ten.vercel.app');
    assert.deepEqual([...options!.request!.headers.keys()].sort(), ['host', 'x-forwarded-for', 'x-real-ip']);
    assert.equal(options!.request!.headers.get('x-forwarded-for'), '2001:db8::1');
    return { rateLimited: false };
  });
  assert.equal(checks, 1);
}));

test('public live protection fails closed without platform configuration or a valid platform client IP', () => production(async () => {
  let checks = 0;
  const checker = async () => { checks++; return { rateLimited: false }; };
  for (const [key, bad] of [['VERCEL', ''], ['NODE_ENV', 'development'], ['VERCEL_PROJECT_PRODUCTION_URL', 'evil.example/path'], ['VERCEL_PROJECT_PRODUCTION_URL', '']]) {
    const previous = process.env[key]; process.env[key] = bad;
    await assert.rejects(enforceComparisonRateLimit(request(), checker), /protection could not be verified/);
    process.env[key] = previous;
  }
  for (const ip of ['', 'spoofed, 192.0.2.1']) {
    const incoming = request(); incoming.headers.set('x-real-ip', ip);
    await assert.rejects(enforceComparisonRateLimit(incoming, checker), /protection could not be verified/);
  }
  assert.equal(checks, 0);
}));

test('disabled analysis bypasses firewall service without enabling inference', () => production(async () => {
  process.env.ANALYSIS_ENABLED = 'false';
  let checks = 0;
  await enforceComparisonRateLimit(request(), async () => { checks++; throw new Error('Must not check'); });
  assert.equal(checks, 0);
}));

test('missing, blocked, unexpected or failed firewall checks stop before extraction and model inference', () => production(async () => {
  for (const status of [404, 403, 500, 302, 'timeout'] as const) {
    let checks = 0, inference = 0;
    globalThis.fetch = async url => {
      if (String(url).includes('/.well-known/vercel/rate-limit-api/')) {
        checks++;
        if (status === 'timeout') throw new DOMException('Synthetic private upstream details', 'TimeoutError');
        return new Response(null, { status });
      }
      inference++; throw new Error('Inference must not run');
    };
    const response = await compare(request());
    assert.equal(response.status, 503);
    const body = JSON.stringify(await response.json());
    assert.match(body, /COMPARISON_PROTECTION_UNAVAILABLE/);
    assert.doesNotMatch(body, /private upstream|synthetic-offline-test-token/);
    assert.equal(checks, 1); assert.equal(inference, 0);
  }
}));

test('rate-limited comparison returns 429 and Retry-After without inference', () => production(async () => {
  let inference = 0;
  globalThis.fetch = async url => {
    if (String(url).includes('/.well-known/vercel/rate-limit-api/')) return new Response(null, { status: 429 });
    inference++; throw new Error('Must not run');
  };
  const response = await compare(request());
  assert.equal(response.status, 429); assert.equal(response.headers.get('retry-after'), '60');
  assert.equal((await response.json()).error.code, 'COMPARISON_RATE_LIMITED'); assert.equal(inference, 0);
}));

test('protected route and real client parser deliver source-checked provider findings after exactly one model request', () => production(async () => {
  let checks = 0, inference = 0;
  globalThis.fetch = async (url, options) => {
    if (String(url).includes('/.well-known/vercel/rate-limit-api/')) {
      checks++;
      assert.equal(String(url), 'https://proofpath-ten.vercel.app/.well-known/vercel/rate-limit-api/rule_proofpath_compare_B67HTY');
      assert.equal(options?.method, 'GET');
      assert.equal(new Headers(options?.headers).get('x-vercel-rate-limit-api'), 'rule_proofpath_compare_B67HTY');
      return new Response(null, { status: 204 });
    }
    inference++;
    assert.ok(String(url).startsWith('https://api.cloudflare.com/'));
    assert.ok(String(url).endsWith('/' + MODEL)); assert.equal(options?.redirect, 'error');
    const messages = JSON.parse(String(options?.body)).messages;
    const documents = JSON.parse(messages[1].content);
    assert.equal(documents.old_document, oldRules); assert.equal(documents.new_document, newRules);
    return Response.json({ success: true, result: { model: MODEL, choices: [{ finish_reason: 'stop', message: {
      content: JSON.stringify({ candidates: mainCandidates.map(c => ({ ...c, title: 'Provider path: ' + c.title })), analysis_complete: true }),
    } }] } });
  };
  const response = await compare(request());
  const result = await consumeComparisonStream(response, 'protected-offline-attempt', { isCurrent: () => true, onStage: () => undefined });
  assert.ok(result); assert.deepEqual(result.counts, { added: 1, removed: 0, modified: 2, needsReview: 0 });
  assert.equal(result.attemptId, 'protected-offline-attempt'); assert.equal(result.incomplete, false);
  for (const finding of result.classified) {
    assert.ok(finding.title.startsWith('Provider path: '));
    for (const e of [finding.oldEvidence, finding.newEvidence]) if (e) assert.equal(result.documents[e.documentId].canonicalText.slice(e.start, e.end), e.quote);
  }
  assert.equal(checks, 1); assert.equal(inference, 1);
}));

test('provider quota, service failure and interruption remain honest stream errors without retry', () => production(async () => {
  for (const status of [429, 500, 'interrupted'] as const) {
    let inference = 0;
    globalThis.fetch = async url => {
      if (String(url).includes('/.well-known/vercel/rate-limit-api/')) return new Response(null, { status: 204 });
      inference++;
      if (status === 'interrupted') throw new DOMException('Synthetic interruption', 'AbortError');
      return new Response('private upstream body', { status });
    };
    const response = await compare(request());
    await assert.rejects(consumeComparisonStream(response, 'protected-offline-attempt', { isCurrent: () => true, onStage: () => undefined }), status === 429 ? /quota or rate limit/ : /unavailable|could not complete/);
    assert.equal(inference, 1);
  }
}));
