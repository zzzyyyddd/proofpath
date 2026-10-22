import { z } from 'zod';

export const candidateSchema = z.strictObject({
  kind: z.enum(['added', 'removed', 'modified', 'needs_review']),
  title: z.string().min(1),
  change_description: z.string().min(1),
  old_quote: z.string().nullable(),
  new_quote: z.string().nullable(),
  interpretation: z.string(),
  suggested_action: z.string(),
  uncertainty: z.string(),
});

export const candidateResponseSchema = z.strictObject({
  candidates: z.array(candidateSchema),
  analysis_complete: z.boolean(),
});

export type Candidate = z.infer<typeof candidateSchema>;
export type CandidateResponse = z.infer<typeof candidateResponseSchema>;
export type DocumentLabel = 'old' | 'new';
export interface PageRange { page: number; start: number; end: number }
export interface ExtractedDocument {
  id: DocumentLabel;
  filename: string;
  format: 'txt' | 'md' | 'pdf';
  canonicalText: string;
  codePointCount: number;
  lineStarts: number[];
  pages: PageRange[];
  limitations: string[];
}
export interface Evidence {
  documentId: DocumentLabel;
  quote: string;
  start: number;
  end: number;
  startLine: number;
  endLine: number;
  page?: number;
}
export interface VisibleFinding {
  id: string;
  kind: Candidate['kind'];
  title: string;
  changeDescription: string;
  oldEvidence: Evidence | null;
  newEvidence: Evidence | null;
  interpretation: string;
  suggestedAction: string;
  uncertainty: string;
}
export type ResultState = 'identical' | 'no_supported_changes' | 'findings' | 'needs_review' | 'incomplete' | 'none_verified';
export interface ComparisonResult {
  attemptId: string;
  documents: { old: ExtractedDocument; new: ExtractedDocument };
  classified: VisibleFinding[];
  needsReview: VisibleFinding[];
  withheldCount: number | null;
  incomplete: boolean;
  incompleteReasons: string[];
  counts: { added: number; removed: number; modified: number; needsReview: number };
  state: ResultState;
}

export const OVERVIEW_EXPLANATION = 'AI-assisted analysis of the supplied documents. Source passages are checked against extracted text; change classifications and interpretations may still be incorrect.';
export const RESULT_MESSAGES: Record<ResultState, string> = {
  identical: 'The supplied document texts are identical. No textual differences were detected.',
  no_supported_changes: 'No supported requirement changes were identified.',
  findings: 'Inspect the source passages behind each classified finding.',
  needs_review: 'No requirement changes were classified. Some verified passages require manual review.',
  incomplete: 'Analysis incomplete — some candidate findings could not be verified or the analysis did not finish fully.',
  none_verified: 'No findings could be verified.',
};

const documentSchema = z.object({
  id: z.enum(['old', 'new']), filename: z.string(), format: z.enum(['txt', 'md', 'pdf']),
  canonicalText: z.string(), codePointCount: z.number().int().nonnegative(),
  lineStarts: z.array(z.number().int().nonnegative()),
  pages: z.array(z.object({ page: z.number().int().positive(), start: z.number().int().nonnegative(), end: z.number().int().nonnegative() })),
  limitations: z.array(z.string()),
});
const evidenceSchema = z.object({
  documentId: z.enum(['old', 'new']), quote: z.string().min(1), start: z.number().int().nonnegative(), end: z.number().int().positive(),
  startLine: z.number().int().positive(), endLine: z.number().int().positive(), page: z.number().int().positive().optional(),
});
const findingSchema = z.object({
  id: z.string(), kind: candidateSchema.shape.kind, title: z.string(), changeDescription: z.string(),
  oldEvidence: evidenceSchema.nullable(), newEvidence: evidenceSchema.nullable(),
  interpretation: z.string(), suggestedAction: z.string(), uncertainty: z.string(),
});
export const comparisonResultSchema = z.object({
  attemptId: z.string(), documents: z.object({ old: documentSchema, new: documentSchema }),
  classified: z.array(findingSchema), needsReview: z.array(findingSchema), withheldCount: z.number().int().nonnegative().nullable(),
  incomplete: z.boolean(), incompleteReasons: z.array(z.string()),
  counts: z.object({ added: z.number().int().nonnegative(), removed: z.number().int().nonnegative(), modified: z.number().int().nonnegative(), needsReview: z.number().int().nonnegative() }),
  state: z.enum(['identical', 'no_supported_changes', 'findings', 'needs_review', 'incomplete', 'none_verified']),
});
export const documentResponseSchema = z.object({ document: documentSchema });
