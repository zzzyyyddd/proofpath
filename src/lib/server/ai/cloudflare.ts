import { env } from 'node:process';
import { candidateResponseSchema, type CandidateResponse, type ExtractedDocument } from '../../shared/contracts';
import { ProofPathError } from '../../shared/errors';
import { LIMITS } from '../limits';
import { candidateJsonSchema } from './candidate-schema';
import { makeMessages } from './prompt';

export const MODEL = '@cf/qwen/qwen3-30b-a3b-fp8';

export function parseCloudflareResponse(envelope: unknown): CandidateResponse {
  if (!envelope || typeof envelope !== 'object' || !('success' in envelope) || envelope.success !== true || !('result' in envelope)) {
    throw new ProofPathError('PROVIDER_RESPONSE_INVALID', 'The AI service did not return a successful analysis response.', 502);
  }
  const result = envelope.result;
  if (!result || typeof result !== 'object' || !('choices' in result) || !Array.isArray(result.choices) || result.choices.length !== 1) {
    throw new ProofPathError('PROVIDER_RESPONSE_INVALID', 'The AI service response envelope was not supported.', 502);
  }
  const choice: unknown = result.choices[0];
  if (!choice || typeof choice !== 'object' || !('finish_reason' in choice) || choice.finish_reason !== 'stop' || !('message' in choice)) {
    throw new ProofPathError('PROVIDER_RESPONSE_INCOMPLETE', 'AI generation did not finish normally. No partial output was presented.', 502);
  }
  const message = choice.message;
  if (!message || typeof message !== 'object' || !('content' in message) || ('refusal' in message && message.refusal != null)) {
    throw new ProofPathError('PROVIDER_RESPONSE_INVALID', 'The AI service did not return usable analysis content.', 502);
  }
  let content: unknown = message.content;
  if (typeof content === 'string') {
    try { content = JSON.parse(content); }
    catch { throw new ProofPathError('INVALID_MODEL_RESPONSE', 'AI output was not a complete JSON document. No output was repaired or presented as verified.', 502); }
  }
  const parsed = candidateResponseSchema.safeParse(content);
  if (!parsed.success) throw new ProofPathError('INVALID_MODEL_RESPONSE', 'AI output did not satisfy the required comparison schema.', 502);
  // Auxiliary reasoning/response fields are deliberately ignored, never displayed or logged.
  return parsed.data;
}

export function providerReadiness(): { ready: boolean; message: string } {
  if (env.ANALYSIS_ENABLED !== 'true') return { ready: false, message: 'Live analysis is not enabled. No inference request will be made.' };
  if (env.CLOUDFLARE_FREE_PLAN_CONFIRMED !== 'true') return { ready: false, message: 'Cloudflare Workers Free configuration has not been confirmed for this deployment.' };
  if (!env.CLOUDFLARE_API_TOKEN || !/^[a-f\d]{32}$/i.test(env.CLOUDFLARE_ACCOUNT_ID ?? '')) {
    return { ready: false, message: 'Server-side Cloudflare credentials are not configured.' };
  }
  return { ready: true, message: 'Configured for a deliberate bounded request. Live model quality and quota availability are not guaranteed.' };
}

export async function generateCandidates(
  documents: { old: ExtractedDocument; new: ExtractedDocument },
  options: { fetcher?: typeof fetch; signal?: AbortSignal } = {},
): Promise<CandidateResponse> {
  const readiness = providerReadiness();
  if (!readiness.ready) throw new ProofPathError('PROVIDER_NOT_CONFIGURED', readiness.message, 503);
  const signal = options.signal ? AbortSignal.any([options.signal, AbortSignal.timeout(LIMITS.providerTimeoutMs)]) : AbortSignal.timeout(LIMITS.providerTimeoutMs);
  let response: Response;
  try {
    response = await (options.fetcher ?? fetch)(
      `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/ai/run/${MODEL}`,
      {
        method: 'POST', cache: 'no-store', signal,
        headers: { Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: makeMessages(documents), stream: false, temperature: 0, max_tokens: LIMITS.providerOutputTokens,
          response_format: { type: 'json_schema', json_schema: candidateJsonSchema } }),
      },
    );
  } catch {
    throw new ProofPathError(signal.aborted ? 'ANALYSIS_INTERRUPTED' : 'PROVIDER_UNAVAILABLE', signal.aborted ? 'Analysis was cancelled or timed out. No partial output was presented.' : 'The AI service is temporarily unavailable. Try again later; no automatic retry was made.', 503);
  }
  if (!response.ok) {
    await response.body?.cancel();
    if (response.status === 429) throw new ProofPathError('PROVIDER_QUOTA', 'Live analysis is temporarily unavailable because the AI service quota or rate limit was reached. Try again later. No automatic retry or paid fallback was used.', 503);
    throw new ProofPathError('PROVIDER_UNAVAILABLE', 'The AI service could not complete the request. No fallback or automatic retry was made.', 503);
  }
  const reader = response.body?.getReader();
  if (!reader) throw new ProofPathError('PROVIDER_RESPONSE_INVALID', 'The AI service returned an empty response.', 502);
  const chunks: Uint8Array[] = []; let bytes = 0;
  try {
    while (true) {
      signal.throwIfAborted();
      const next = await reader.read();
      if (next.done) break;
      bytes += next.value.byteLength;
      if (bytes > LIMITS.serializedResponseBytes) throw new ProofPathError('PROVIDER_RESPONSE_TOO_LARGE', 'The AI service response exceeded its safe response budget. It was not truncated or displayed.', 502);
      chunks.push(next.value);
    }
    const joined = Buffer.concat(chunks);
    let envelope: unknown;
    try { envelope = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(joined)); }
    catch { throw new ProofPathError('PROVIDER_RESPONSE_INVALID', 'The AI service returned an unreadable response.', 502); }
    return parseCloudflareResponse(envelope);
  } finally { await reader.cancel().catch(() => undefined); }
}
