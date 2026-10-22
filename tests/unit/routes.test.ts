import test from 'node:test';
import assert from 'node:assert/strict';
import { POST as validate } from '../../src/app/api/documents/validate/route';
import { POST as compare } from '../../src/app/api/compare/route';
import { comparisonResultSchema } from '../../src/lib/shared/contracts';
import { mainCandidates, newRules, oldRules } from '../fixtures/rules';
import { MODEL } from '../../src/lib/server/ai/cloudflare';

function uploadRequest(text: string, filename = 'rules.txt') {
  const form = new FormData(); form.append('file', new File([text], filename)); form.append('label', 'old');
  return new Request('http://localhost/api/documents/validate', { method: 'POST', body: form });
}
test('validation route returns extracted documents and rejects unsupported requests without AI calls', async () => {
  const originalFetch = globalThis.fetch; let calls = 0;
  globalThis.fetch = async () => { calls++; throw new Error('No inference allowed'); };
  try {
    const ok = await validate(uploadRequest('The repository must be public.'));
    assert.equal(ok.status, 200); assert.equal((await ok.json()).document.canonicalText, 'The repository must be public.');
    const invalid = await validate(uploadRequest(' ', 'blank.txt')); assert.equal(invalid.status, 422);
    const tooLong = await validate(uploadRequest('a'.repeat(30_001))); assert.equal(tooLong.status, 413);
    assert.equal(calls, 0);
  } finally { globalThis.fetch = originalFetch; }
});
test('identical uploaded originals stream real stages and a valid no-inference terminal result', async () => {
  const previous = process.env.ANALYSIS_ENABLED; process.env.ANALYSIS_ENABLED = 'false';
  try {
    const form = new FormData(); form.append('old', new File(['The repository must be public.'], 'old.txt')); form.append('new', new File(['The repository must be public.'], 'new.txt')); form.append('attemptId', 'identical-route');
    const response = await compare(new Request('http://localhost/api/compare', { method: 'POST', body: form }));
    assert.equal(response.headers.get('content-type'), 'application/x-ndjson');
    const events = (await response.text()).trim().split('\n').map(line => JSON.parse(line));
    assert.equal(events.filter(event => event.type === 'stage').length, 8);
    const terminal = events.at(-1); assert.equal(terminal.type, 'result');
    const result = comparisonResultSchema.parse(terminal.result); assert.equal(result.state, 'identical');
    assert.equal(result.documents.old.filename, 'old.txt'); assert.equal(result.documents.new.filename, 'new.txt');
  } finally { if (previous === undefined) delete process.env.ANALYSIS_ENABLED; else process.env.ANALYSIS_ENABLED = previous; }
});
test('revalidation failure stops before comparison stage and never returns completed results', async () => {
  const form = new FormData(); form.append('old', new File([' '], 'old.txt')); form.append('new', new File(['The repository must be public.'], 'new.txt')); form.append('attemptId', 'invalid-route');
  const response = await compare(new Request('http://localhost/api/compare', { method: 'POST', body: form }));
  const events = (await response.text()).trim().split('\n').map(line => JSON.parse(line));
  assert.equal(events.at(-1).type, 'error');
  assert.equal(events.some(event => event.type === 'result' || event.name === 'Comparing requirements'), false);
});
test('disabled live provider produces an explicit error, never canned results or an empty success', async () => {
  const previous = process.env.ANALYSIS_ENABLED; process.env.ANALYSIS_ENABLED = 'false';
  try {
    const form = new FormData(); form.append('old', new File(['Teams may have up to five members.'], 'old.txt')); form.append('new', new File(['Teams may have up to three members.'], 'new.txt')); form.append('attemptId', 'disabled-provider');
    const response = await compare(new Request('http://localhost/api/compare', { method: 'POST', body: form }));
    const events = (await response.text()).trim().split('\n').map(line => JSON.parse(line));
    assert.equal(events.at(-1).error.code, 'PROVIDER_NOT_CONFIGURED');
    assert.equal(events.some(event => event.type === 'result'), false);
  } finally { if (previous === undefined) delete process.env.ANALYSIS_ENABLED; else process.env.ANALYSIS_ENABLED = previous; }
});

test('full non-identical route verifies the production contract against the exact re-extracted originals (offline provider injection)', async () => {
  const keys = ['ANALYSIS_ENABLED', 'CLOUDFLARE_FREE_PLAN_CONFIRMED', 'CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID'] as const;
  const previous = keys.map(key => process.env[key]);
  const originalFetch = globalThis.fetch; let calls = 0;
  Object.assign(process.env, { ANALYSIS_ENABLED: 'true', CLOUDFLARE_FREE_PLAN_CONFIRMED: 'true', CLOUDFLARE_API_TOKEN: 'synthetic-offline-test-token', CLOUDFLARE_ACCOUNT_ID: 'a'.repeat(32) });
  globalThis.fetch = async (_url, options) => {
    calls++;
    const body = JSON.parse(String(options?.body));
    const sentDocuments = JSON.parse(body.messages[1].content);
    assert.equal(sentDocuments.old_document, oldRules); assert.equal(sentDocuments.new_document, newRules);
    return Response.json({ success: true, result: { model: MODEL, choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ candidates: mainCandidates, analysis_complete: true }) } }] } });
  };
  try {
    const form = new FormData(); form.append('old', new File([oldRules], 'old.txt')); form.append('new', new File([newRules], 'new.txt')); form.append('attemptId', 'offline-provider-injected');
    const response = await compare(new Request('http://localhost/api/compare', { method: 'POST', body: form }));
    const events = (await response.text()).trim().split('\n').map(line => JSON.parse(line));
    const terminal = events.at(-1); assert.equal(terminal.type, 'result');
    const result = comparisonResultSchema.parse(terminal.result);
    assert.deepEqual(result.counts, { added: 1, removed: 0, modified: 2, needsReview: 0 });
    for (const finding of result.classified) for (const e of [finding.oldEvidence, finding.newEvidence]) if (e) assert.equal(result.documents[e.documentId].canonicalText.slice(e.start, e.end), e.quote);
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = originalFetch;
    keys.forEach((key, i) => { if (previous[i] === undefined) delete process.env[key]; else process.env[key] = previous[i]; });
  }
});

test('full compare stream with maximum approved Unicode inputs remains within actual 1 MB response budget', async () => {
  const text = '😀'.repeat(29_990) + ' English. '; // 30,000 Unicode code points.
  assert.equal(Array.from(text).length, 30_000);
  const form = new FormData(); form.append('old', new File([text], 'old.txt')); form.append('new', new File([text], 'new.txt')); form.append('attemptId', 'unicode-stream');
  const response = await compare(new Request('http://localhost/api/compare', { method: 'POST', body: form }));
  const raw = await response.text(); assert.ok(Buffer.byteLength(raw, 'utf8') <= 1_000_000);
  const terminal = JSON.parse(raw.trim().split('\n').at(-1)!);
  assert.equal(terminal.type, 'result'); assert.equal(terminal.result.documents.old.canonicalText, text);
});

test('browser-origin identical uploads pass the real route and client parser when Next uses its bind hostname internally', async () => {
  const { consumeComparisonStream, STAGES } = await import('../../src/lib/client/requests');
  const { readFileSync } = await import('node:fs');
  const source = readFileSync('public/samples/old-rules.txt');
  const originalFetch = globalThis.fetch; let calls = 0;
  globalThis.fetch = async () => { calls++; throw new Error('Identical uploads must not call Cloudflare'); };
  try {
    for (const attemptId of ['browser-identical-first', 'browser-identical-retry']) {
      const form = new FormData();
      for (const label of ['old', 'new']) form.append(label, new File([source], 'old-rules.txt'));
      form.append('attemptId', attemptId);
      // The public Host/Origin agree; the dev server may reconstruct URL using its bind host.
      const response = await compare(new Request('http://0.0.0.0:3000/api/compare', {
        method: 'POST', headers: { host: 'localhost:3000', origin: 'http://localhost:3000' }, body: form,
      }));
      assert.equal(response.status, 200, 'A same-origin browser request must reach the comparison stream');
      const seen: string[] = [];
      const result = await consumeComparisonStream(response, attemptId, {
        isCurrent: () => true, onStage: (name, status) => seen.push(`${name}:${status}`),
      });
      assert.equal(result?.state, 'identical'); assert.equal(result?.incomplete, false);
      assert.deepEqual(result?.counts, { added: 0, removed: 0, modified: 0, needsReview: 0 });
      assert.equal(result?.documents.old.canonicalText, source.toString());
      assert.equal(result?.documents.new.canonicalText, source.toString());
      assert.equal(result?.classified.length, 0); assert.equal(result?.needsReview.length, 0);
      assert.deepEqual(seen, STAGES.flatMap(name => [`${name}:started`, `${name}:done`]));
    }
    assert.equal(calls, 0);
  } finally { globalThis.fetch = originalFetch; }
});

test('comparison origin guard rejects foreign, opaque and malformed browser origins without inference', async () => {
  for (const origin of ['https://unrelated.example', 'null', 'http://localhost:3000/path', 'http://localhost:3000.evil.example']) {
    const form = new FormData();
    form.append('old', new File([oldRules], 'old.txt')); form.append('new', new File([oldRules], 'new.txt'));
    form.append('attemptId', 'blocked-origin');
    const response = await compare(new Request('http://0.0.0.0:3000/api/compare', {
      method: 'POST', headers: { host: 'localhost:3000', origin, 'x-forwarded-host': 'unrelated.example' }, body: form,
    }));
    assert.equal(response.status, 403);
    assert.equal((await response.json()).error.code, 'INVALID_ORIGIN');
  }
});
