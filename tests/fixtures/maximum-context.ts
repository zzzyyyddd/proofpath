import { mainCandidates } from './rules';

// Original synthetic English background, not copied rules or user documents.
// Pad fixture construction only; uploaded inputs are never clipped by the app.
function background(length: number): string {
  const sentence = 'Research notes describe the project background and provide general context.\n';
  return sentence.repeat(Math.floor(length / sentence.length)).padEnd(length, ' ');
}
function section(quote: string, offset: number): string {
  return background(offset) + quote + '\n' + background(10_000 - offset - quote.length - 1);
}

export const maximumFixture = {
  old: section('Submission deadline: November 10, 2026.', 0)
    + section('Teams may have up to five members.', 5_000)
    + background(10_000),
  new: section('Submission deadline: November 15, 2026.', 0)
    + section('Teams may have up to three members.', 5_000)
    + section('A demo video is required.', 9_900),
  expected: mainCandidates,
};
