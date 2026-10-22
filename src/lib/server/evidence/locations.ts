import type { Evidence, ExtractedDocument } from '../../shared/contracts';

function lineAt(starts: number[], offset: number): number {
  let low = 0, high = starts.length;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (starts[middle] <= offset) low = middle + 1;
    else high = middle;
  }
  return low;
}

export function locateExactQuote(document: ExtractedDocument, quote: string | null): Evidence | null {
  if (!quote?.trim()) return null;
  const start = document.canonicalText.indexOf(quote);
  if (start < 0 || document.canonicalText.indexOf(quote, start + 1) !== -1) return null;
  const end = start + quote.length;
  const page = document.pages.find(p => start >= p.start && end <= p.end);
  return {
    documentId: document.id, quote, start, end,
    startLine: lineAt(document.lineStarts, start),
    endLine: lineAt(document.lineStarts, end - 1),
    ...(page ? { page: page.page } : {}),
  };
}
