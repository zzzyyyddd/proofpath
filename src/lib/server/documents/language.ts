export type LanguageAssessment = 'english' | 'uncertain' | 'unsupported';
export const LANGUAGE_LIMITATION = 'Only English is officially supported. This document may contain mixed or uncertain language; the analysis may require additional review.';

// Deliberately conservative, transparent hints rather than an AI certainty score.
// Foreign names, code and short text are not enough to reject a document.
export function assessLanguage(text: string): LanguageAssessment {
  const words = text.toLowerCase().match(/\p{L}+/gu) ?? [];
  if (words.length < 8) return 'uncertain';
  const english = new Set(['the', 'and', 'must', 'required', 'submission', 'deadline', 'teams', 'members', 'may', 'have', 'public', 'project', 'rules', 'video', 'before', 'with', 'should', 'requirements']);
  const englishHits = words.filter(w => english.has(w)).length;
  const letters = text.match(/\p{L}/gu) ?? [];
  const latin = letters.filter(c => /\p{Script=Latin}/u.test(c)).length;
  const otherScriptDominates = letters.length >= 40 && latin / letters.length < 0.35;
  const foreignMarkers = new Set(['debe', 'deben', 'obligatorio', 'requisitos', 'fecha', 'entrega', 'equipos', 'miembros', 'doivent', 'obligatoire', 'équipe', 'soumission', 'müssen', 'anforderungen', 'einreichung']);
  const foreignHits = words.filter(w => foreignMarkers.has(w)).length;
  if ((otherScriptDominates && englishHits < 2) || (foreignHits >= 4 && foreignHits > englishHits * 3)) return 'unsupported';
  if (englishHits >= 3 && foreignHits === 0 && latin / Math.max(1, letters.length) >= 0.8) return 'english';
  return 'uncertain';
}
