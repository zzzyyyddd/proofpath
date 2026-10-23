import type { CandidateResponse } from '../../src/lib/shared/contracts';
import { candidate, mainCandidates, oldRules, newRules } from './rules';
import { maximumFixture } from './maximum-context';

export const semanticFixtures = {
  maximum: maximumFixture,
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
  equivalentrepository: {
    old: 'Source code must be publicly accessible.',
    new: 'The source code must be available to the public.', expected: [],
  },
  teamchange: {
    old: 'Teams may have no more than three members.',
    new: 'The maximum team size is five members.',
    expected: [candidate({ kind: 'modified', old_quote: 'Teams may have no more than three members.', new_quote: 'The maximum team size is five members.' })],
  },
  boundchange: {
    old: 'Teams must have at least three members.',
    new: 'Teams may have no more than three members.',
    expected: [candidate({ kind: 'modified', old_quote: 'Teams must have at least three members.', new_quote: 'Teams may have no more than three members.' })],
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
