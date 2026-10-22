import { ProofPathError } from '../shared/errors';
import { LIMITS } from './limits';

export async function boundedMultipart(request: Request): Promise<FormData> {
  if (!request.headers.get('content-type')?.startsWith('multipart/form-data;')) throw new ProofPathError('INVALID_REQUEST', 'Upload documents using the comparison form.', 400);
  const length = request.headers.get('content-length');
  if (length && Number(length) > LIMITS.multipartBytes) throw new ProofPathError('REQUEST_TOO_LARGE', 'The upload request exceeds the supported size.', 413);
  const reader = request.body?.getReader();
  if (!reader) throw new ProofPathError('INVALID_REQUEST', 'The upload request is empty.', 400);
  const chunks: Uint8Array[] = []; let total = 0;
  try {
    while (true) {
      request.signal.throwIfAborted();
      const next = await reader.read();
      if (next.done) break;
      total += next.value.byteLength;
      if (total > LIMITS.multipartBytes) throw new ProofPathError('REQUEST_TOO_LARGE', 'The upload request exceeds the supported size. No content was truncated.', 413);
      chunks.push(next.value);
    }
  } finally { await reader.cancel().catch(() => undefined); }
  try {
    return await new Request('http://localhost/form', { method: 'POST', headers: { 'content-type': request.headers.get('content-type')! }, body: Buffer.concat(chunks) }).formData();
  } catch { throw new ProofPathError('INVALID_REQUEST', 'The document upload could not be read. Choose the files again.', 400); }
}

export function requireFile(form: FormData, key: string): File {
  const entries = form.getAll(key);
  if (entries.length !== 1 || !(entries[0] instanceof File)) throw new ProofPathError('INVALID_REQUEST', `Select exactly one document for ${key}.`, 400);
  return entries[0];
}
export function safeError(error: unknown) {
  return error instanceof ProofPathError ? { code: error.code, message: error.message, status: error.status } : { code: 'ANALYSIS_FAILED', message: 'The request could not be completed. No results were fabricated. Please try again or replace the document.', status: 500 };
}
export function errorResponse(error: unknown) {
  const e = safeError(error);
  return Response.json({ error: { code: e.code, message: e.message } }, { status: e.status, headers: { 'Cache-Control': 'no-store' } });
}
