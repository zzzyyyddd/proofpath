import type { Candidate, ExtractedDocument, VisibleFinding } from '../../shared/contracts';
import { locateExactQuote } from './locations';

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
  if (candidate.kind === 'modified' && candidate.old_quote === candidate.new_quote) return { status: 'unchanged' };
  return { status: 'accepted', finding: {
    id, kind: candidate.kind, title: candidate.title, changeDescription: candidate.change_description,
    oldEvidence, newEvidence, interpretation: candidate.interpretation,
    suggestedAction: candidate.suggested_action, uncertainty: candidate.uncertainty,
  } };
}
