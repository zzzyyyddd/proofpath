import test from 'node:test';
import assert from 'node:assert/strict';
import { parseStructuredConstraint, structuredRelationship } from '../../src/lib/server/evidence/structured-constraints';
import { makeDocument } from '../../src/lib/server/documents/canonical-text';
import { buildResult } from '../../src/lib/server/results';
import { candidate } from '../fixtures/rules';
import { semanticFixtures } from '../fixtures/evaluation';

function analyze(old: string, next: string, candidates = [candidate({ kind: 'removed', old_quote: old, new_quote: null })]) {
  return buildResult('semantic-safety', { old: makeDocument('old', 'old.txt', old), new: makeDocument('new', 'new.txt', next) }, { candidates, analysis_complete: true });
}
test('false Removed on the reported equivalent pair becomes Needs Review with exact both-side evidence', () => {
  const { old, new: next } = semanticFixtures.equivalent;
  for (const quote of [old, 'three members']) {
    const result = analyze(old, next, [candidate({ kind: 'removed', old_quote: quote, new_quote: null })]);
    assert.deepEqual(result.counts, { added: 0, removed: 0, modified: 0, needsReview: 1 });
    assert.equal(result.state, 'needs_review'); assert.equal(result.withheldCount, 0); assert.equal(result.incomplete, false);
    assert.equal(result.needsReview[0].oldEvidence?.quote, old);
    assert.equal(result.needsReview[0].newEvidence?.quote, next);
    assert.equal(result.needsReview[0].changeDescription.includes('five to three'), false);
  }
});
test('structured grammar generalizes across quantities, units-of-membership subjects, digits and word numbers', () => {
  for (const subject of ['team', 'group']) for (const [digits, word] of [['3', 'three'], ['5', 'five'], ['12', 'twelve'], ['20', 'twenty']]) {
    const old = `${subject[0].toUpperCase() + subject.slice(1)}s may have up to ${digits} members.`;
    const next = `The maximum ${subject} size is ${word} members.`;
    assert.equal(structuredRelationship(old, next), 'same_constraint');
    assert.equal(analyze(old, next).counts.needsReview, 1);
  }
});
test('genuine 3-to-5 or minimum-to-maximum modifications remain classified; wrong absence claims stay visible for review', () => {
  for (const fixture of [semanticFixtures.teamchange, semanticFixtures.boundchange, semanticFixtures.optional]) {
    const result = analyze(fixture.old, fixture.new, fixture.expected);
    assert.equal(result.counts.modified, 1); assert.equal(result.needsReview.length, 0);
    const split = analyze(fixture.old, fixture.new, [
      candidate({ kind: 'removed', old_quote: fixture.old, new_quote: null }),
      candidate({ kind: 'added', old_quote: null, new_quote: fixture.new }),
    ]);
    assert.equal(split.classified.length, 0); assert.equal(split.counts.needsReview, 1);
    assert.equal(split.needsReview[0].oldEvidence?.quote, fixture.old);
    assert.equal(split.needsReview[0].newEvidence?.quote, fixture.new);
    const common = fixture === semanticFixtures.optional ? 'A demo video' : 'three members';
    if (fixture.old.includes(common) && fixture.new.includes(common)) {
      const shortQuotes = analyze(fixture.old, fixture.new, [candidate({ old_quote: common, new_quote: common })]);
      assert.equal(shortQuotes.needsReview.length, 1, 'Same short quotes must not hide changed whole-clause constraints');
    }
  }
});
test('genuine new video obligation and slide-deck removal are not hidden by blanket suppression', () => {
  for (const fixture of [semanticFixtures.main, semanticFixtures.removal]) {
    const result = analyze(fixture.old, fixture.new, fixture.expected);
    assert.equal(result.classified.length, fixture.expected.length);
    assert.equal(result.needsReview.length, 0);
  }
});
test('scope, exceptions, unknown syntax, multiline context and unequal subjects do not get guessed away', () => {
  for (const text of [
    'Student track: teams may have up to three members.',
    'Teams may have up to three members, except mentors.',
    'Teams may have up to three members. This excludes mentors.',
    'Teams may have up to three members.\nExceptions apply.',
    'Teams may have up to twenty-one members.',
    'Teams may have up to 3.5 members.',
    'Teams may have up to 9007199254740992 members.',
  ]) assert.equal(parseStructuredConstraint(text), null);
  assert.equal(structuredRelationship('Teams may have up to three members.', 'The maximum group size is three members.'), null);
  const fixture = semanticFixtures.equivalentrepository;
  assert.equal(analyze(fixture.old, fixture.new).counts.removed, 1, 'Unsupported paraphrases remain an explicit release blocker, not a claimed semantic fix');
});
test('missing or invented evidence stays withheld before any semantic safety rerouting', () => {
  const fixture = semanticFixtures.equivalent;
  const result = analyze(fixture.old, fixture.new, [candidate({ kind: 'removed', old_quote: 'Invented passage', new_quote: null })]);
  assert.equal(result.withheldCount, 1); assert.equal(result.incomplete, true);
  assert.equal(result.needsReview.length, 0);
});
