import type { DocumentLabel, ExtractedDocument, PageRange } from '../../shared/contracts';
import { ProofPathError } from '../../shared/errors';
import { LIMITS } from '../limits';

export function canonicalize(text: string): string {
  return text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
}

export function makeDocument(
  id: DocumentLabel, filename: string, input: string,
  format: ExtractedDocument['format'] = 'txt', pages: PageRange[] = [],
  limitations: string[] = [],
): ExtractedDocument {
  const canonicalText = canonicalize(input);
  const codePointCount = Array.from(canonicalText).length;
  if (codePointCount > LIMITS.extractedCodePoints) {
    throw new ProofPathError('TEXT_TOO_LONG', 'Each document may contain at most 30,000 extracted characters. Upload a shorter document; no text was truncated.', 413);
  }
  if (!canonicalText.trim()) throw new ProofPathError('EMPTY_DOCUMENT', 'The document contains no usable text. Replace it with a readable English document.');
  if (/\u0000|[\u0001-\u0008\u000B\u000E-\u001F]/u.test(canonicalText)) {
    throw new ProofPathError('UNSUPPORTED_TEXT', 'The document contains unsupported binary or control characters. Upload a clean UTF-8 text file.');
  }
  if (!filename || Array.from(filename).length > 200) {
    throw new ProofPathError('INVALID_FILENAME', 'Use a filename containing between 1 and 200 characters.');
  }
  const lineStarts = [0];
  for (let i = 0; i < canonicalText.length; i++) if (canonicalText[i] === '\n') lineStarts.push(i + 1);
  return { id, filename, format, canonicalText, codePointCount, lineStarts, pages, limitations };
}

export function extractTextFile(bytes: Uint8Array, id: DocumentLabel, filename: string): ExtractedDocument {
  if (bytes.byteLength > LIMITS.fileBytes) throw new ProofPathError('FILE_TOO_LARGE', 'Each file must be 2 MB or smaller.', 413);
  const extension = filename.toLowerCase().match(/\.(txt|md)$/)?.[1];
  if (!extension || new TextDecoder().decode(bytes.subarray(0, 5)) === '%PDF-') {
    throw new ProofPathError('UNSUPPORTED_FORMAT', 'Upload TXT, Markdown, or a supported text-based PDF with the correct extension.', 415);
  }
  let text: string;
  try { text = new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
  catch { throw new ProofPathError('INVALID_ENCODING', 'The text file is not valid UTF-8. Export it as UTF-8 and try again.'); }
  return makeDocument(id, filename, text, extension as 'txt' | 'md');
}
