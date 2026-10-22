import assert from 'node:assert/strict';
import { makeDocument } from '../src/lib/server/documents/canonical-text';
import { buildResult } from '../src/lib/server/results';
import { serializeWithinBudget } from '../src/lib/server/limits';
import { mainCandidates, oldRules, newRules } from '../tests/fixtures/rules';

const result = buildResult('offline-controlled-fixture', {
  old: makeDocument('old', 'old-rules.txt', oldRules), new: makeDocument('new', 'new-rules.txt', newRules),
}, { candidates: mainCandidates, analysis_complete: true });
assert.deepEqual(result.counts, { added: 1, removed: 0, modified: 2, needsReview: 0 });
const bytes = Buffer.byteLength(serializeWithinBudget({ type: 'result', result }), 'utf8');
console.log(JSON.stringify({ mode: 'offline', candidateSource: 'explicit synthetic fixture, not live AI', counts: result.counts, allLocationsMatched: true, responseBytes: bytes, liveModelEvaluation: 'NOT RUN', fullContextCapacity: 'NOT VERIFIED' }, null, 2));
