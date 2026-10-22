import type { CandidateResponse } from '../../src/lib/shared/contracts';
import { candidate, mainCandidates, oldRules, newRules } from './rules';

export const semanticFixtures = {
  main: { old: oldRules, new: newRules, expected: mainCandidates },
  removal: {
    old: 'The repository must be public.\nA presentation slide deck is required.',
    new: 'The repository must be public.',
    expected: [candidate({ kind: 'removed', old_quote: 'A presentation slide deck is required.', new_quote: null })],
  },
  equivalent: {
    old: 'Teams may have no more than three members.',
    new: 'The maximum team size is three members.', expected: [],
  },
  ambiguous: {
    old: 'Student track: teams may include five members.',
    new: 'Open track: teams may include three members. The relationship to other tracks is not specified.',
    expected: [candidate({ kind: 'needs_review', old_quote: 'Student track: teams may include five members.', new_quote: 'Open track: teams may include three members.' })],
  },
  optional: {
    old: 'A demo video is optional.', new: 'A demo video is required.',
    expected: [candidate({ kind: 'modified', old_quote: 'A demo video is optional.', new_quote: 'A demo video is required.' })],
  },
} satisfies Record<string, { old: string; new: string; expected: CandidateResponse['candidates'] }>;

export type SemanticFixtureName = keyof typeof semanticFixtures;
