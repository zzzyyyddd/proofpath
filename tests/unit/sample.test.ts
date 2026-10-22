import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { comparisonResultSchema } from '../../src/lib/shared/contracts';
import { locateExactQuote } from '../../src/lib/server/evidence/locations';
import { mainCandidates } from '../fixtures/rules';

test('static sample data matches its exact bundled source documents and every location', () => {
  const sample = comparisonResultSchema.parse(JSON.parse(readFileSync('public/samples/analysis.json', 'utf8')));
  for (const id of ['old', 'new'] as const) assert.equal(sample.documents[id].canonicalText, readFileSync(`public/samples/${id}-rules.txt`, 'utf8'));
  assert.deepEqual(sample.counts, { added: 1, removed: 0, modified: 2, needsReview: 0 });
  for (const finding of sample.classified) for (const e of [finding.oldEvidence, finding.newEvidence]) if (e) assert.deepEqual(locateExactQuote(sample.documents[e.documentId], e.quote), e);
  assert.equal(sample.attemptId, 'static-controlled-sample');
});

test('all three sample findings have subject-appropriate interpretations and review actions', () => {
  const sample = comparisonResultSchema.parse(JSON.parse(readFileSync('public/samples/analysis.json', 'utf8')));
  const subjects = [
    { title: 'Deadline changed', required: /deadline/i, unrelated: /team|video/i },
    { title: 'Team size limit changed', required: /team/i, unrelated: /deadline|video/i },
    { title: 'Demo video required', required: /video/i, unrelated: /team|deadline/i },
  ];
  for (const subject of subjects) {
    const finding = sample.classified.find(f => f.title === subject.title);
    assert.ok(finding, `Missing sample finding: ${subject.title}`);
    for (const text of [finding.interpretation, finding.suggestedAction]) {
      assert.match(text, subject.required);
      assert.doesNotMatch(text, subject.unrelated);
      assert.doesNotMatch(text, /you are eligible|you are compliant|guaranteed/i);
    }
    const fixture = mainCandidates.find(c => c.title === subject.title)!;
    assert.equal(finding.interpretation, fixture.interpretation, 'Controlled fixture must not reintroduce stale sample copy');
    assert.equal(finding.suggestedAction, fixture.suggested_action);
  }
});
