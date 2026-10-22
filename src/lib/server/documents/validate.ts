import type { DocumentLabel, ExtractedDocument } from '../../shared/contracts';
import { ProofPathError } from '../../shared/errors';
import { LIMITS } from '../limits';
import { extractTextFile } from './canonical-text';
import { extractPdf } from './extract-pdf';
import { assessLanguage, LANGUAGE_LIMITATION } from './language';

export async function validateFile(file: File, id: DocumentLabel): Promise<ExtractedDocument> {
  if (file.size > LIMITS.fileBytes) throw new ProofPathError('FILE_TOO_LARGE', 'Each file must be at most 2 MB.', 413);
  if (!file.name || Array.from(file.name).length > 200) throw new ProofPathError('INVALID_FILENAME', 'Use a filename of at most 200 characters.');
  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdfSignature = new TextDecoder().decode(bytes.subarray(0, 5)) === '%PDF-';
  let document: ExtractedDocument;
  if (/\.pdf$/i.test(file.name)) {
    if (!pdfSignature) throw new ProofPathError('UNSUPPORTED_FORMAT', 'The selected PDF does not contain a valid PDF signature. Replace the file.', 415);
    document = await extractPdf(bytes, id, file.name);
  } else document = extractTextFile(bytes, id, file.name);
  const language = assessLanguage(document.canonicalText);
  if (language === 'unsupported') throw new ProofPathError('UNSUPPORTED_LANGUAGE', 'This document appears predominantly non-English. Only English is officially supported. Upload an English version; no AI request was made.');
  if (language === 'uncertain') document.limitations.push(LANGUAGE_LIMITATION);
  return document;
}
