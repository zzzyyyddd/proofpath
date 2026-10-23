import test from 'node:test';
import assert from 'node:assert/strict';
import { semanticFixtures } from '../fixtures/evaluation';
import { candidate } from '../fixtures/rules';
import { matchesSemanticExpectation } from '../../scripts/semantic-expectations';
import { candidateResponseSchema } from '../../src/lib/shared/contracts';
import { makeDocument } from '../../src/lib/server/documents/canonical-text';
import { buildResult } from '../../src/lib/server/results';

for (const name of ['equivalent', 'equivalentrepository'] as const) {
  test(`semantic oracle rejects a synthetic false Added/Removed split despite matching quotations: ${name}`, () => {
    const fixture = semanticFixtures[name];
    // Reproduces the reported failure shape; not a captured raw model response.
    const split = candidateResponseSchema.parse({ analysis_complete: true, candidates: [
      candidate({ kind: 'removed', old_quote: fixture.old, new_quote: null }),
      candidate({ kind: 'added', old_quote: null, new_quote: fixture.new }),
    ] });
    assert.equal(matchesSemanticExpectation(split, []), false);
    assert.equal(matchesSemanticExpectation({ candidates: [], analysis_complete: true }, []), true);
    const docs = { old: makeDocument('old', 'old.txt', fixture.old), new: makeDocument('new', 'new.txt', fixture.new) };
    const result = buildResult('known-semantic-limit', docs, split);
    // The limited grammar reroutes recognized counterparts, not arbitrary prose.
    assert.deepEqual(result.counts, name === 'equivalent'
      ? { added: 0, removed: 0, modified: 0, needsReview: 1 }
      : { added: 1, removed: 1, modified: 0, needsReview: 0 });
    for (const finding of result.classified) for (const evidence of [finding.oldEvidence, finding.newEvidence]) {
      if (evidence) assert.equal(docs[evidence.documentId].canonicalText.slice(evidence.start, evidence.end), evidence.quote);
    }
  });
}

for (const name of ['teamchange', 'boundchange', 'optional'] as const) {
  test(`nearby non-equivalent constraints must remain Modified, never suppressed: ${name}`, () => {
    const fixture = semanticFixtures[name];
    const expected = fixture.expected.map(c => ({ kind: c.kind, oldQuote: c.old_quote, newQuote: c.new_quote }));
    const valid = { candidates: fixture.expected, analysis_complete: true };
    assert.equal(matchesSemanticExpectation(valid, expected), true);
    assert.equal(matchesSemanticExpectation({ candidates: [], analysis_complete: true }, expected), false);
    assert.equal(matchesSemanticExpectation({ ...valid, candidates: [
      candidate({ kind: 'removed', old_quote: fixture.old, new_quote: null }),
      candidate({ kind: 'added', old_quote: null, new_quote: fixture.new }),
    ] }, expected), false);
    const result = buildResult(name, {
      old: makeDocument('old', 'old.txt', fixture.old), new: makeDocument('new', 'new.txt', fixture.new),
    }, valid);
    assert.equal(result.counts.modified, 1); assert.equal(result.withheldCount, 0);
  });
}

test('genuine added video and removed slide-deck obligations remain accepted by the controlled oracle', () => {
  for (const fixture of [semanticFixtures.main, semanticFixtures.removal]) {
    const expected = fixture.expected.map(c => ({ kind: c.kind, oldQuote: c.old_quote, newQuote: c.new_quote }));
    assert.equal(matchesSemanticExpectation({ candidates: fixture.expected, analysis_complete: true }, expected), true);
    const modified = fixture.expected.map(c => c.kind === 'added' || c.kind === 'removed' ? { ...c, kind: 'needs_review' as const } : c);
    assert.equal(matchesSemanticExpectation({ candidates: modified, analysis_complete: true }, expected), false);
  }
});
