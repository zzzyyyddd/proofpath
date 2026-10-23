import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { maximumFixture } from '../fixtures/maximum-context';
import { validateFile } from '../../src/lib/server/documents/validate';
import { buildResult } from '../../src/lib/server/results';
import { serializeWithinBudget, LIMITS } from '../../src/lib/server/limits';
import { STAGES, consumeComparisonStream } from '../../src/lib/client/requests';

test('maximum English TXT pair preserves all 60,000 characters and exact start/middle/end evidence through the client stream', async () => {
  const docs = {
    old: await validateFile(new File([readFileSync('tests/fixtures/maximum/old-rules.txt')], 'old.txt'), 'old'),
    new: await validateFile(new File([readFileSync('tests/fixtures/maximum/new-rules.txt')], 'new.txt'), 'new'),
  };
  for (const id of ['old', 'new'] as const) {
    assert.equal(docs[id].codePointCount, 30_000);
    assert.equal(docs[id].canonicalText, maximumFixture[id]);
    assert.doesNotMatch(docs[id].canonicalText, /[\t ]+$/m, 'Generated source must not have trailing whitespace');
    assert.doesNotMatch(docs[id].canonicalText, /\n\n$/, 'Generated source must not have blank lines at EOF');
    assert.ok(Buffer.byteLength(docs[id].canonicalText) <= LIMITS.fileBytes);
  }
  const result = buildResult('offline-maximum', docs, { candidates: maximumFixture.expected, analysis_complete: true });
  assert.deepEqual(result.counts, { added: 1, removed: 0, modified: 2, needsReview: 0 });
  assert.equal(result.incomplete, false);
  assert.deepEqual(result.classified.map(f => f.newEvidence?.start), [0, 15_000, 29_900]);
  assert.deepEqual(result.classified.map(f => f.oldEvidence?.start ?? null), [0, 15_000, null]);
  const events = STAGES.flatMap(name => ['started', 'done'].map(status => ({ type: 'stage', attemptId: result.attemptId, name, status })));
  const stream = events.map(event => JSON.stringify(event) + '\n').join('')
    + serializeWithinBudget({ type: 'result', attemptId: result.attemptId, result }) + '\n';
  assert.ok(Buffer.byteLength(stream) < LIMITS.serializedResponseBytes - 2048);
  const received = await consumeComparisonStream(new Response(stream), result.attemptId, { isCurrent: () => true, onStage: () => undefined });
  assert.deepEqual(received, result);
});
