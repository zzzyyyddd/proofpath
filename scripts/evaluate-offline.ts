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


// Additional synthetic fixtures check the oracle and output budget, never Qwen.
import { semanticFixtures } from '../tests/fixtures/evaluation';
import { matchesSemanticExpectation } from './semantic-expectations';
import { STAGES } from '../src/lib/client/requests';
for (const [name, fixture] of Object.entries(semanticFixtures)) {
  const response = { candidates: fixture.expected, analysis_complete: true };
  assert.equal(matchesSemanticExpectation(response, fixture.expected.map(c => ({ kind: c.kind, oldQuote: c.old_quote, newQuote: c.new_quote }))), true);
  const checked = buildResult(`offline-${name}`, {
    old: makeDocument('old', 'old.txt', fixture.old), new: makeDocument('new', 'new.txt', fixture.new),
  }, response);
  assert.equal(checked.incomplete, false);
  const stages = STAGES.flatMap(stage => ['started', 'done'].map(status => JSON.stringify({ type: 'stage', attemptId: checked.attemptId, name: stage, status }) + '\n')).join('');
  const terminal = serializeWithinBudget({ type: 'result', attemptId: checked.attemptId, result: checked }) + '\n';
  const streamBytes = Buffer.byteLength(stages + terminal);
  assert.ok(streamBytes < 1_000_000 - 2048);
  console.log(JSON.stringify({ fixture: name, mode: 'synthetic offline; no model call', counts: checked.counts,
    characters: [checked.documents.old.codePointCount, checked.documents.new.codePointCount], streamBytes,
    modelSemantics: 'NOT EVALUATED', tokenContextHeadroom: 'NOT VERIFIED' }));
}
