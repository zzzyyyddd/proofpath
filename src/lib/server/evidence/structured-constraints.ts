// A deliberately bounded grammar, not a general semantic-equivalence detector.
// Recognize ONLY a complete, unqualified, single-clause document. No fuzzy
// matching, synonym inference, clause skipping, track/exception removal or LLM.
export interface StructuredConstraint {
  subject: string;
  operator: 'maximum' | 'minimum' | 'optional' | 'required';
  quantity?: number;
}
const words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
function quantity(value: string): number | null {
  if (words.includes(value)) return words.indexOf(value);
  if (!/^(0|[1-9]\d*)$/.test(value)) return null;
  const number = Number(value);
  return Number.isSafeInteger(number) ? number : null;
}
export function parseStructuredConstraint(text: string): StructuredConstraint | null {
  const clause = text.trim().toLowerCase();
  // Internal line breaks and extra clauses/qualifiers deliberately fail closed.
  if (/[\r\n]/.test(clause)) return null;
  const plural = /^(teams|groups) may have (no more than|up to) ([a-z]+|\d+) members\.$/.exec(clause);
  const limit = /^the (maximum|minimum) (team|group) size is ([a-z]+|\d+) members\.$/.exec(clause);
  const minimum = /^(teams|groups) must have at least ([a-z]+|\d+) members\.$/.exec(clause);
  if (plural || limit || minimum) {
    const value = quantity(plural?.[3] ?? limit?.[3] ?? minimum![2]);
    if (value === null) return null;
    const subject = limit?.[2] ?? (plural?.[1] ?? minimum![1]).slice(0, -1);
    return { subject: `${subject}:members`, operator: limit ? limit[1] as 'maximum' | 'minimum' : minimum ? 'minimum' : 'maximum', quantity: value };
  }
  const obligation = /^a ([a-z]+(?: [a-z]+){0,4}) is (optional|required)\.$/.exec(clause);
  return obligation ? { subject: `artifact:${obligation[1]}`, operator: obligation[2] as 'optional' | 'required' } : null;
}

export function structuredRelationship(oldText: string, newText: string): 'same_constraint' | 'different_constraint' | null {
  const old = parseStructuredConstraint(oldText), next = parseStructuredConstraint(newText);
  if (!old || !next || old.subject !== next.subject) return null;
  return old.operator === next.operator && old.quantity === next.quantity ? 'same_constraint' : 'different_constraint';
}
