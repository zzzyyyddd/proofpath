import { randomUUID } from 'node:crypto';
import { boundedMultipart, requireFile, errorResponse, safeError } from '@/lib/server/http';
import { validateFile } from '@/lib/server/documents/validate';
import { generateCandidates } from '@/lib/server/ai/cloudflare';
import { buildResult } from '@/lib/server/results';
import { LIMITS, serializeWithinBudget } from '@/lib/server/limits';
import { ProofPathError } from '@/lib/shared/errors';

export const runtime = 'nodejs';
export const maxDuration = 120;
export async function POST(request: Request) {
  let form: FormData;
  try {
    const origin = request.headers.get('origin');
    const requestUrl = new URL(request.url);
    // Next may reconstruct request.url with its bind hostname (0.0.0.0),
    // while the browser addresses localhost. Host is the request authority;
    // never substitute an arbitrary X-Forwarded-Host for this browser check.
    let sameOrigin = !origin;
    if (origin) {
      try {
        const originUrl = new URL(origin);
        const authority = request.headers.get('host') ?? requestUrl.host;
        const publicUrl = new URL(`${requestUrl.protocol}//${authority}`);
        sameOrigin = origin === originUrl.origin && !publicUrl.username && !publicUrl.password
          && publicUrl.pathname === '/' && !publicUrl.search && !publicUrl.hash
          && publicUrl.origin === originUrl.origin;
      } catch { sameOrigin = false; }
    }
    if (!sameOrigin) throw new ProofPathError('INVALID_ORIGIN', 'Use the comparison form on this site.', 403);
    form = await boundedMultipart(request);
    if ([...form.keys()].some(key => !['old', 'new', 'attemptId'].includes(key))) throw new ProofPathError('INVALID_REQUEST', 'Unexpected comparison fields.', 400);
    requireFile(form, 'old'); requireFile(form, 'new');
    if (typeof form.get('attemptId') !== 'string' || String(form.get('attemptId')).length > 100) throw new ProofPathError('INVALID_REQUEST', 'The comparison attempt is invalid.', 400);
  } catch (error) { return errorResponse(error); }
  const attemptId = String(form.get('attemptId')) || randomUUID();
  const cancellation = new AbortController();
  const deadline = AbortSignal.any([request.signal, cancellation.signal, AbortSignal.timeout(100_000)]);
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false, transmittedBytes = 0;
      const send = (value: unknown) => {
        deadline.throwIfAborted();
        const data = encoder.encode(serializeWithinBudget(value) + '\n');
        if (transmittedBytes + data.byteLength > LIMITS.serializedResponseBytes - 2048) throw new ProofPathError('RESPONSE_TOO_LARGE', 'The complete comparison stream exceeds its response budget. No source content was truncated.', 413);
        if (!closed) { controller.enqueue(data); transmittedBytes += data.byteLength; }
      };
      const stage = (name: string, status: 'started' | 'done') => send({ type: 'stage', attemptId, name, status });
      try {
        stage('Validating and extracting document text', 'started');
        const old = await validateFile(requireFile(form, 'old'), 'old');
        const next = await validateFile(requireFile(form, 'new'), 'new');
        const documents = { old, new: next };
        stage('Validating and extracting document text', 'done');
        stage('Comparing requirements', 'started');
        const identical = old.canonicalText === next.canonicalText;
        const candidates = identical ? undefined : await generateCandidates(documents, { signal: deadline });
        stage('Comparing requirements', 'done');
        stage('Checking source evidence', 'started');
        const result = buildResult(attemptId, documents, candidates);
        stage('Checking source evidence', 'done');
        stage('Preparing findings', 'started');
        const terminal = { type: 'result', attemptId, result };
        serializeWithinBudget(terminal);
        stage('Preparing findings', 'done'); send(terminal);
      } catch (error) {
        if (!request.signal.aborted) {
          try { controller.enqueue(encoder.encode(JSON.stringify({ type: 'error', attemptId, error: deadline.aborted ? { code: 'ANALYSIS_INTERRUPTED', message: 'Analysis timed out or was interrupted. No partial result was presented.' } : safeError(error) }) + '\n')); } catch { /* disconnected consumer */ }
        }
      } finally { closed = true; try { controller.close(); } catch { /* already cancelled */ } }
    },
    cancel() { cancellation.abort(); },
  });
  return new Response(stream, { headers: { 'Content-Type': 'application/x-ndjson', 'Cache-Control': 'no-store, no-transform', 'X-Content-Type-Options': 'nosniff' } });
}
