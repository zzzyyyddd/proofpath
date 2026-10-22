import type { DocumentLabel, ExtractedDocument, PageRange } from '../../shared/contracts';
import { ProofPathError } from '../../shared/errors';
import { LIMITS } from '../limits';
import { canonicalize, makeDocument } from './canonical-text';

export async function extractPdf(bytes: Uint8Array, id: DocumentLabel, filename: string): Promise<ExtractedDocument> {
  const { getDocument, OPS } = await import('pdfjs-dist/legacy/build/pdf.mjs');
  // PDF.js 6 removed isEvalSupported. We use its parsing APIs only: no viewer,
  // scripting manager, embedded actions, remote resources, or XFA execution.
  const task = getDocument({ data: new Uint8Array(bytes), enableXfa: false, useSystemFonts: false, disableFontFace: true, verbosity: 0, stopAtErrors: true });
  const deadline = setTimeout(() => { void task.destroy(); }, 15_000);
  try {
    const pdf = await task.promise;
    if (pdf.numPages > LIMITS.pdfPages) throw new ProofPathError('TOO_MANY_PAGES', 'PDF files may contain at most 10 pages. No pages were skipped.', 413);
    const parts: string[] = [], pages: PageRange[] = [];
    let offset = 0;
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const [content, operators] = await Promise.all([page.getTextContent(), page.getOperatorList()]);
      const imageOps = new Set([OPS.paintImageXObject, OPS.paintInlineImageXObject, OPS.paintImageMaskXObject]);
      const hasImage = operators.fnArray.some(op => imageOps.has(op));
      const items = content.items.filter((item): item is typeof item & { str: string; transform: number[]; hasEOL: boolean } => 'str' in item);
      const nativeText = items.map(item => item.str).join('');
      if (hasImage && !nativeText.trim()) throw new ProofPathError('UNSUPPORTED_SCANNED_PDF', `Page ${pageNumber} appears image-only or scanned. Upload a clean text-based PDF, TXT, or Markdown version.`);
      if (hasImage) throw new ProofPathError('INCOMPLETE_EXTRACTION', `Page ${pageNumber} contains images alongside text. ProofPath cannot establish that all relevant content is extractable. Upload a clean text-only source.`);
      if (!nativeText.trim() && operators.fnArray.length > 0) throw new ProofPathError('INCOMPLETE_EXTRACTION', `Page ${pageNumber} has visible-content instructions but no usable extracted text. Comparison could be misleading; replace this document.`);
      if (nativeText.includes('\uFFFD')) throw new ProofPathError('INCOMPLETE_EXTRACTION', `Page ${pageNumber} contains unreadable extracted characters. Replace this document with a clean text source.`);
      let text = '', previous: { x: number; y: number } | null = null;
      for (const item of items) {
        if (item.str.trim() && (Math.abs(item.transform[1]) > 0.01 || Math.abs(item.transform[2]) > 0.01)) {
          throw new ProofPathError('INCOMPLETE_EXTRACTION', `Page ${pageNumber} contains rotated or complex text whose reading order cannot be established reliably.`);
        }
        const x = item.transform[4], y = item.transform[5];
        if (previous && Math.abs(previous.y - y) < 2 && x < previous.x - 20 && item.str.trim()) {
          throw new ProofPathError('INCOMPLETE_EXTRACTION', `Page ${pageNumber} has a suspicious text order. Upload a simple text source rather than comparing potentially reordered clauses.`);
        }
        if (text && !text.endsWith('\n') && previous && Math.abs(previous.y - y) > 2) text += '\n';
        else if (text && !/\s$/.test(text) && item.str && !/^\s/.test(item.str)) text += ' ';
        text += item.str;
        if (item.hasEOL) text += '\n';
        previous = { x, y };
      }
      text = canonicalize(text);
      pages.push({ page: pageNumber, start: offset, end: offset + text.length });
      parts.push(text); offset += text.length + 1;
      if (Array.from(parts.join('\n')).length > LIMITS.extractedCodePoints) throw new ProofPathError('TEXT_TOO_LONG', 'PDF extracted text exceeds 30,000 characters. No text was truncated.', 413);
      page.cleanup();
    }
    return makeDocument(id, filename, parts.join('\n'), 'pdf', pages, ['PDF source context displays extracted text, not the original layout. Extraction may miss or reorder content; source matching cannot establish complete extraction.']);
  } catch (error) {
    if (error instanceof ProofPathError) throw error;
    const password = error instanceof Error && error.name === 'PasswordException';
    throw new ProofPathError('EXTRACTION_FAILED', password ? 'Password-protected PDFs are unsupported. Upload an unprotected English text source.' : 'PDF parsing or extraction failed. Replace it with a clean text-based PDF, TXT, or Markdown document.');
  } finally { clearTimeout(deadline); await task.destroy().catch(() => undefined); }
}
