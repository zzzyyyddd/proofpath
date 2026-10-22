import test from 'node:test';
import assert from 'node:assert/strict';
import { makeDocument } from '../../src/lib/server/documents/canonical-text';
import { locateExactQuote } from '../../src/lib/server/evidence/locations';
import { buildResult } from '../../src/lib/server/results';
import { candidateResponseSchema } from '../../src/lib/shared/contracts';
import { candidate, mainCandidates, newRules, oldRules } from '../fixtures/rules';
import { matchesSemanticExpectation } from '../../scripts/semantic-expectations';

const docs = { old: makeDocument('old', 'old.txt', oldRules), new: makeDocument('new', 'new.md', newRules, 'md') };
const analyze = (candidates = [candidate()], analysis_complete = true) => buildResult('attempt-1', docs, { candidates, analysis_complete });

test('full contract rejects unknown keys, missing fields, invalid enum and alternate structures', () => {
  for (const payload of [
    { changes: [] }, { candidates: [], analysis_complete: true, confidence: 1 },
    { candidates: [{ ...candidate(), kind: 'conflict' }], analysis_complete: true },
    { candidates: [{ kind: 'added' }], analysis_complete: true },
  ]) assert.equal(candidateResponseSchema.safeParse(payload).success, false);
});
test('controlled three changes yield exact category counts and independently mapped quotations', () => {
  const r = analyze(mainCandidates);
  assert.deepEqual(r.counts, { added: 1, removed: 0, modified: 2, needsReview: 0 });
  assert.equal(r.incomplete, false);
  for (const f of r.classified) for (const e of [f.oldEvidence, f.newEvidence]) if (e) {
    assert.equal(docs[e.documentId].canonicalText.slice(e.start, e.end), e.quote);
  }
});
test('modified evidence has correct one-based lines and UTF-16 offsets', () => {
  const r = analyze();
  assert.equal(r.classified[0].oldEvidence?.startLine, 2);
  assert.equal(r.classified[0].oldEvidence?.start, oldRules.indexOf('Teams'));
});
test('identical documents bypass malformed/absent model output without inferred changes', () => {
  const same = { old: docs.old, new: makeDocument('new', 'same.txt', oldRules) };
  assert.equal(buildResult('identical', same).state, 'identical');
});
test('different prose with no supported changes has a distinct state', () => {
  assert.equal(analyze([]).state, 'no_supported_changes');
});
test('fabricated quotations and cross-source quotations are withheld without leaking candidate text', () => {
  for (const broken of [candidate({ new_quote: 'INVENTED SECRET CLAIM' }), candidate({ new_quote: candidate().old_quote })]) {
    const r = analyze([broken]);
    assert.equal(r.state, 'none_verified'); assert.equal(r.withheldCount, 1);
    assert.equal(r.classified.length, 0); assert.equal(r.incomplete, true);
    assert.equal(JSON.stringify(r).includes('INVENTED SECRET CLAIM'), false);
  }
});
test('missing required evidence and fabricated absent sides fail verification', () => {
  for (const c of [candidate({ old_quote: null }), candidate({ new_quote: '' }), candidate({ kind: 'added' }), candidate({ kind: 'removed' })]) {
    assert.equal(analyze([c]).withheldCount, 1);
  }
});
test('removal uses only real Old evidence, never a fabricated New quote', () => {
  const r = analyze([candidate({ kind: 'removed', new_quote: null })]);
  assert.equal(r.counts.removed, 1); assert.equal(r.classified[0].newEvidence, null);
});
test('unresolved paired evidence stays separate from classified totals', () => {
  const r = analyze([candidate({ kind: 'needs_review' })]);
  assert.equal(r.state, 'needs_review'); assert.equal(r.classified.length, 0);
  assert.equal(r.counts.needsReview, 1); assert.equal(r.counts.modified, 0);
});
test('mixed candidates retain checked results and mark Analysis Incomplete', () => {
  const r = analyze([candidate(), candidate({ old_quote: 'missing' })]);
  assert.equal(r.state, 'incomplete'); assert.equal(r.classified.length, 1); assert.equal(r.withheldCount, 1);
});
test('provider-reported incompleteness yields Unknown, never a misleading zero count', () => {
  const r = analyze([], false);
  assert.equal(r.withheldCount, null); assert.equal(r.incomplete, true); assert.equal(r.state, 'incomplete');
});
test('identical paired text is not reported as Modified and duplicates do not inflate counts', () => {
  assert.equal(analyze([candidate({ old_quote: 'The repository must be public.', new_quote: 'The repository must be public.' })]).classified.length, 0);
  assert.equal(analyze([candidate(), candidate()]).counts.modified, 1);
});
test('ambiguous repeated occurrences are not assigned an arbitrary source location', () => {
  assert.equal(locateExactQuote(makeDocument('old', 'repeat.txt', 'Rule.\nRule.'), 'Rule.'), null);
});
test('PDF page references require a reliable containing page range', () => {
  const d = makeDocument('old', 'rules.pdf', 'First rule.\nSecond rule.', 'pdf', [{ page: 1, start: 0, end: 11 }, { page: 2, start: 12, end: 24 }]);
  assert.equal(locateExactQuote(d, 'First rule.')?.page, 1);
  assert.equal(locateExactQuote(d, 'rule.\nSecond')?.page, undefined);
});
test('source matching preserves Unicode and does not normalize model quotations', () => {
  const d = makeDocument('old', 'unicode.md', '😀\r\nCafé requires proof.');
  const e = locateExactQuote(d, 'Café');
  assert.equal(e?.start, 3); assert.equal(e?.startLine, 2);
  assert.equal(locateExactQuote(d, 'Cafe'), null);
});
test('valid schema and actual quotations do not prove classification correctness', () => {
  const semanticallyWrong = candidate({ kind: 'removed', new_quote: null });
  assert.equal(candidateResponseSchema.safeParse({ candidates: [semanticallyWrong], analysis_complete: true }).success, true);
  assert.equal(matchesSemanticExpectation({ candidates: [semanticallyWrong], analysis_complete: true }, [
    { kind: 'modified', oldQuote: 'Teams may have up to five members.', newQuote: 'Teams may have up to three members.' },
  ]), false);
});
