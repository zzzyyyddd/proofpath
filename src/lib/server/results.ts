import { candidateResponseSchema, type ComparisonResult, type ExtractedDocument } from '../shared/contracts';
import { ProofPathError } from '../shared/errors';
import { verifyCandidate } from './evidence/verify';

export function buildResult(attemptId: string, documents: { old: ExtractedDocument; new: ExtractedDocument }, input?: unknown): ComparisonResult {
  const result: ComparisonResult = {
    attemptId, documents, classified: [], needsReview: [], withheldCount: 0, incomplete: false,
    incompleteReasons: [], counts: { added: 0, removed: 0, modified: 0, needsReview: 0 }, state: 'no_supported_changes',
  };
  if (documents.old.canonicalText === documents.new.canonicalText) return { ...result, state: 'identical' };
  const parsed = candidateResponseSchema.safeParse(input);
  if (!parsed.success) throw new ProofPathError('INVALID_MODEL_RESPONSE', 'The AI response did not match the required structure. No findings were presented as verified.', 502);
  const seen = new Set<string>();
  const visibleReviews = new Set<string>();
  for (const [index, candidate] of parsed.data.candidates.entries()) {
    const key = JSON.stringify([candidate.kind, candidate.old_quote, candidate.new_quote]);
    if (seen.has(key)) continue;
    seen.add(key);
    const checked = verifyCandidate(candidate, documents, `${attemptId}:${index}`);
    if (checked.status === 'withheld') { result.withheldCount!++; continue; }
    if (checked.status === 'unchanged') continue;
    if (checked.finding.kind === 'needs_review') {
      if (candidate.kind !== 'needs_review') {
        // Only merge safety-gate reroutes of the same whole-clause pair.
        const reviewKey = JSON.stringify([checked.finding.oldEvidence, checked.finding.newEvidence]);
        if (visibleReviews.has(reviewKey)) continue;
        visibleReviews.add(reviewKey);
      }
      result.needsReview.push(checked.finding); result.counts.needsReview++;
    } else {
      result.classified.push(checked.finding); result.counts[checked.finding.kind]++;
    }
  }
  if (result.withheldCount! > 0) result.incompleteReasons.push('Some candidate source quotations or locations could not be verified.');
  if (!parsed.data.analysis_complete) {
    result.incompleteReasons.push('The provider reported that analysis was incomplete; the number of unexamined candidates is unknown.');
    result.withheldCount = null;
  }
  result.incomplete = result.incompleteReasons.length > 0;
  const visible = result.classified.length + result.needsReview.length;
  result.state = result.incomplete
    ? visible ? 'incomplete' : parsed.data.candidates.length ? 'none_verified' : 'incomplete'
    : result.classified.length ? 'findings' : result.needsReview.length ? 'needs_review' : 'no_supported_changes';
  return result;
}
