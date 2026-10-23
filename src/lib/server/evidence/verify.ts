import type { Candidate, ExtractedDocument, VisibleFinding } from '../../shared/contracts';
import { locateExactQuote } from './locations';
import { structuredRelationship } from './structured-constraints';

export type Verification = { status: 'accepted'; finding: VisibleFinding } | { status: 'withheld' } | { status: 'unchanged' };

export function verifyCandidate(candidate: Candidate, documents: { old: ExtractedDocument; new: ExtractedDocument }, id: string): Verification {
  const oldEvidence = locateExactQuote(documents.old, candidate.old_quote);
  const newEvidence = locateExactQuote(documents.new, candidate.new_quote);
  const valid = candidate.kind === 'added'
    ? candidate.old_quote === null && newEvidence !== null
    : candidate.kind === 'removed'
      ? candidate.new_quote === null && oldEvidence !== null
      : oldEvidence !== null && newEvidence !== null;
  if (!valid) return { status: 'withheld' };
  const relationship = structuredRelationship(documents.old.canonicalText, documents.new.canonicalText);
  const reviewOneSided = relationship !== null && (candidate.kind === 'added' || candidate.kind === 'removed');
  const reviewEquivalentModification = relationship !== null && candidate.kind === 'modified'
    && (relationship === 'same_constraint' || candidate.old_quote === candidate.new_quote);
  if (reviewOneSided || reviewEquivalentModification) {
    // Preserve actual text and uncertainty. A recognized counterpart is reason
    // to reject a definitive classification, not proof of semantic equivalence.
    const oldContext = locateExactQuote(documents.old, documents.old.canonicalText);
    const newContext = locateExactQuote(documents.new, documents.new.canonicalText);
    if (oldContext && newContext) return { status: 'accepted', finding: {
      id, kind: 'needs_review', title: 'Constraint relationship needs review',
      changeDescription: 'Both documents contain a recognized constraint for the same subject. The proposed change classification was not retained.',
      oldEvidence: oldContext, newEvidence: newContext,
      interpretation: 'The relationship between these passages requires review. The original AI classification is not presented as an established change.',
      suggestedAction: 'Compare the values, bounds, obligations and surrounding context before deciding whether the requirement changed.',
      uncertainty: 'A limited structural check located a possible counterpart; it does not verify semantic equivalence, a change, or document authority.',
    } };
  }
  if (candidate.kind === 'modified' && candidate.old_quote === candidate.new_quote) return { status: 'unchanged' };
  return { status: 'accepted', finding: {
    id, kind: candidate.kind, title: candidate.title, changeDescription: candidate.change_description,
    oldEvidence, newEvidence, interpretation: candidate.interpretation,
    suggestedAction: candidate.suggested_action, uncertainty: candidate.uncertainty,
  } };
}
