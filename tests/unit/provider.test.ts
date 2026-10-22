import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCloudflareResponse, generateCandidates } from '../../src/lib/server/ai/cloudflare';
import { candidateJsonSchema } from '../../src/lib/server/ai/candidate-schema';
import { makeDocument } from '../../src/lib/server/documents/canonical-text';
import { candidate } from '../fixtures/rules';

const payload = { candidates: [candidate()], analysis_complete: true };
function envelope(content: unknown = JSON.stringify(payload), finish_reason = 'stop') {
  return { success: true, result: { choices: [{ message: { content, reasoning_content: 'not public' }, finish_reason }] } };
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
  ]) assert.throws(() => parseCloudflareResponse(invalid));
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
