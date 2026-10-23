import test from 'node:test';
import assert from 'node:assert/strict';
import { POST } from '../../src/app/api/compare/route';
import { consumeComparisonStream } from '../../src/lib/client/requests';
import { semanticFixtures } from '../fixtures/evaluation';
import { candidate } from '../fixtures/rules';
import { MODEL } from '../../src/lib/server/ai/cloudflare';
import { matchesSemanticExpectation } from '../../scripts/semantic-expectations';

test('real route and client parser deliver source-verified Needs Review rather than the false Removed classification', async () => {
  const keys = ['ANALYSIS_ENABLED', 'CLOUDFLARE_FREE_PLAN_CONFIRMED', 'CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID'] as const;
  const before = keys.map(key => process.env[key]), originalFetch = globalThis.fetch;
  Object.assign(process.env, { ANALYSIS_ENABLED: 'true', CLOUDFLARE_FREE_PLAN_CONFIRMED: 'true', CLOUDFLARE_API_TOKEN: 'synthetic-offline-test-token', CLOUDFLARE_ACCOUNT_ID: 'a'.repeat(32) });
  const fixture = semanticFixtures.equivalent;
  const raw = { analysis_complete: true, candidates: [candidate({
    kind: 'removed', old_quote: fixture.old, new_quote: null,
    title: 'Unsupported definitive removal title', interpretation: 'Unsupported definitive impact text',
  })] };
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return Response.json({ success: true, result: { model: MODEL, choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(raw) } }] } });
  };
  try {
    const form = new FormData();
    form.append('old', new File([fixture.old], 'old.txt')); form.append('new', new File([fixture.new], 'new.txt'));
    form.append('attemptId', 'semantic-safety-route');
    const response = await POST(new Request('http://localhost/api/compare', { method: 'POST', body: form }));
    const result = await consumeComparisonStream(response, 'semantic-safety-route', { isCurrent: () => true, onStage: () => undefined });
    assert.ok(result); assert.equal(result.state, 'needs_review');
    assert.deepEqual(result.counts, { added: 0, removed: 0, modified: 0, needsReview: 1 });
    assert.equal(result.classified.length, 0); assert.equal(calls, 1);
    for (const evidence of [result.needsReview[0].oldEvidence, result.needsReview[0].newEvidence]) {
      assert.ok(evidence);
      assert.equal(result.documents[evidence.documentId].canonicalText.slice(evidence.start, evidence.end), evidence.quote);
    }
    assert.equal(JSON.stringify(result).includes('Unsupported definitive'), false);
    assert.equal(matchesSemanticExpectation(raw, []), false, 'Routing safety must not turn a model failure into a semantic pass');
  } finally {
    globalThis.fetch = originalFetch;
    keys.forEach((key, i) => { if (before[i] === undefined) delete process.env[key]; else process.env[key] = before[i]; });
  }
});
