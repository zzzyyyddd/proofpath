import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCloudflareResponse, generateCandidates, MODEL } from '../../src/lib/server/ai/cloudflare';
import { candidateJsonSchema } from '../../src/lib/server/ai/candidate-schema';
import { makeDocument } from '../../src/lib/server/documents/canonical-text';
import { candidate } from '../fixtures/rules';

const payload = { candidates: [candidate()], analysis_complete: true };
function envelope(content: unknown = JSON.stringify(payload), finish_reason = 'stop') {
  return { success: true, result: { model: MODEL, choices: [{ message: { content, reasoning_content: 'not public' }, finish_reason }] } };
}
test('native REST envelope parses only content, not auxiliary response/reasoning fields', () => {
  assert.deepEqual(parseCloudflareResponse(envelope()), payload);
  assert.deepEqual(parseCloudflareResponse(envelope(payload)), payload);
  assert.equal(JSON.stringify(parseCloudflareResponse(envelope())).includes('not public'), false);
});
test('HTTP-success-shaped envelopes do not bypass API status, finish or strict schema checks', () => {
  for (const invalid of [
    { success: false, result: payload }, { success: true, result: payload },
    envelope('```json\n' + JSON.stringify(payload) + '\n```'),
    envelope({ changes: [] }), envelope(JSON.stringify(payload), 'length'),
    envelope(JSON.stringify(payload).slice(0, -1)),
    envelope({ ...payload, confidence: 100 }),
    { ...envelope(), result: { ...envelope().result, model: 'unapproved-model' } },
  ]) assert.throws(() => parseCloudflareResponse(invalid));
});

test('HTTP errors and quota failure never retry or switch provider', async () => {
  const keys = ['ANALYSIS_ENABLED', 'CLOUDFLARE_FREE_PLAN_CONFIRMED', 'CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID'] as const;
  const previous = keys.map(key => process.env[key]);
  Object.assign(process.env, { ANALYSIS_ENABLED: 'true', CLOUDFLARE_FREE_PLAN_CONFIRMED: 'true', CLOUDFLARE_API_TOKEN: 'synthetic-offline-test-token', CLOUDFLARE_ACCOUNT_ID: 'a'.repeat(32) });
  try {
    const docs = { old: makeDocument('old', 'old.txt', 'Old rule.'), new: makeDocument('new', 'new.txt', 'New rule.') };
    for (const status of [401, 403, 429, 500, 503]) {
      let calls = 0;
      await assert.rejects(generateCandidates(docs, { fetcher: async (url, options) => {
        calls++;
        assert.ok(String(url).endsWith('/' + MODEL));
        const body = JSON.parse(String(options?.body));
        assert.equal(body.stream, false); assert.equal(body.response_format.type, 'json_schema');
        assert.deepEqual(body.response_format.json_schema, candidateJsonSchema);
        return new Response('not forwarded', { status });
      } }), status === 429 ? /quota or rate limit/ : /could not complete/);
      assert.equal(calls, 1);
    }
  } finally { keys.forEach((key, i) => { if (previous[i] === undefined) delete process.env[key]; else process.env[key] = previous[i]; }); }
});

test('pre-aborted inference is a safe explicit failure without returning raw network errors', async () => {
  const keys = ['ANALYSIS_ENABLED', 'CLOUDFLARE_FREE_PLAN_CONFIRMED', 'CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID'] as const;
  const previous = keys.map(key => process.env[key]);
  Object.assign(process.env, { ANALYSIS_ENABLED: 'true', CLOUDFLARE_FREE_PLAN_CONFIRMED: 'true', CLOUDFLARE_API_TOKEN: 'synthetic-offline-test-token', CLOUDFLARE_ACCOUNT_ID: 'a'.repeat(32) });
  try {
    await assert.rejects(generateCandidates({ old: makeDocument('old', 'old.txt', 'Old.'), new: makeDocument('new', 'new.txt', 'New.') }, {
      signal: AbortSignal.abort(), fetcher: async (_url, options) => { options?.signal?.throwIfAborted(); throw new Error('sensitive upstream details'); },
    }), /cancelled or timed out/);
  } finally { keys.forEach((key, i) => { if (previous[i] === undefined) delete process.env[key]; else process.env[key] = previous[i]; }); }
});
test('production JSON schema is closed and includes every candidate property and review state', () => {
  const s = JSON.stringify(candidateJsonSchema);
  for (const key of ['analysis_complete', 'needs_review', 'old_quote', 'new_quote', 'interpretation', 'suggested_action', 'additionalProperties']) assert.ok(s.includes(key));
});
test('provider call fails closed without configuration; does not attempt network', async () => {
  const previous = process.env.ANALYSIS_ENABLED;
  process.env.ANALYSIS_ENABLED = 'false'; let calls = 0;
  try {
    await assert.rejects(generateCandidates({ old: makeDocument('old', 'old.txt', 'Old rule.'), new: makeDocument('new', 'new.txt', 'New rule.') }, {
      fetcher: async () => { calls++; throw new Error('must not run'); },
    }), /not enabled/);
    assert.equal(calls, 0);
  } finally { if (previous === undefined) delete process.env.ANALYSIS_ENABLED; else process.env.ANALYSIS_ENABLED = previous; }
});
