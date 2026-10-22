import test from 'node:test';
import assert from 'node:assert/strict';
import { semanticFixtures } from '../fixtures/evaluation';
import { makeDocument } from '../../src/lib/server/documents/canonical-text';
import { buildResult } from '../../src/lib/server/results';
import { matchesSemanticExpectation } from '../../scripts/semantic-expectations';

for (const [name, fixture] of Object.entries(semanticFixtures)) {
  test(`offline evaluation oracle and source mappings: ${name} (synthetic, no model call)`, () => {
    const response = { candidates: fixture.expected, analysis_complete: true };
    const expected = fixture.expected.map(c => ({ kind: c.kind, oldQuote: c.old_quote, newQuote: c.new_quote }));
    assert.equal(matchesSemanticExpectation(response, expected), true);
    assert.equal(matchesSemanticExpectation({ ...response, analysis_complete: false }, expected), false);
    const docs = { old: makeDocument('old', 'old.txt', fixture.old), new: makeDocument('new', 'new.txt', fixture.new) };
    const result = buildResult(name, docs, response);
    assert.equal(result.incomplete, false);
    assert.equal(result.classified.length + result.needsReview.length, fixture.expected.length);
    for (const finding of [...result.classified, ...result.needsReview]) {
      for (const evidence of [finding.oldEvidence, finding.newEvidence]) {
        if (evidence) assert.equal(docs[evidence.documentId].canonicalText.slice(evidence.start, evidence.end), evidence.quote);
      }
    }
    if (fixture.expected.length) {
      const wrong = { ...response, candidates: fixture.expected.map(c => ({ ...c, kind: c.kind === 'added' ? 'removed' as const : 'added' as const })) };
      assert.equal(matchesSemanticExpectation(wrong, expected), false, 'Valid JSON with the wrong classification must fail the semantic gate');
    }
  });
}
