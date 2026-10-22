import type { CandidateResponse } from '../src/lib/shared/contracts';

export interface ExpectedFinding { kind: string; oldQuote: string | null; newQuote: string | null }

// This oracle describes fixture semantics independently from schema/evidence checks.
// A real quotation and a valid enum can still fail the expected relationship.
export function matchesSemanticExpectation(response: CandidateResponse, expected: ExpectedFinding[]): boolean {
  if (!response.analysis_complete || response.candidates.length !== expected.length) return false;
  const actual = response.candidates.map(c => JSON.stringify([c.kind, c.old_quote, c.new_quote])).sort();
  const wanted = expected.map(c => JSON.stringify([c.kind, c.oldQuote, c.newQuote])).sort();
  return actual.every((entry, i) => entry === wanted[i]);
}
