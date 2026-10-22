import type { Candidate } from '../../src/lib/shared/contracts';

export const oldRules = 'Submission deadline: November 10, 2026.\nTeams may have up to five members.\nThe repository must be public.';
export const newRules = 'Submission deadline: November 15, 2026.\nTeams may have up to three members.\nThe repository must be public.\nA demo video is required.';

export function candidate(overrides: Partial<Candidate> = {}): Candidate {
  return {
    kind: 'modified', title: 'Team size limit changed',
    change_description: 'The maximum team size changed from five to three.',
    old_quote: 'Teams may have up to five members.', new_quote: 'Teams may have up to three members.',
    interpretation: 'A larger team may need to review the new limit.', suggested_action: 'Review your team size.',
    uncertainty: 'Quotation matching does not establish eligibility or classification correctness.', ...overrides,
  };
}

export const mainCandidates = [
  candidate({ title: 'Deadline changed', old_quote: 'Submission deadline: November 10, 2026.', new_quote: 'Submission deadline: November 15, 2026.', change_description: 'The submission deadline changed.' }),
  candidate(),
  candidate({ kind: 'added', title: 'Demo video required', old_quote: null, new_quote: 'A demo video is required.', change_description: 'A mandatory video requirement was introduced.' }),
];
