import { ProofPathError } from '../shared/errors';

export const LIMITS = Object.freeze({
  fileBytes: 2_000_000,
  extractedCodePoints: 30_000,
  pdfPages: 10,
  multipartBytes: 4_100_000,
  serializedResponseBytes: 1_000_000,
  providerOutputTokens: 4096,
  providerContextTokens: 32_768,
  providerTimeoutMs: 60_000,
});

export function serializeWithinBudget(value: unknown): string {
  const serialized = JSON.stringify(value);
  if (serialized === undefined || Buffer.byteLength(serialized, 'utf8') > LIMITS.serializedResponseBytes) {
    throw new ProofPathError('RESPONSE_TOO_LARGE', 'The analysis response exceeds the supported response budget. Nothing was truncated.', 413);
  }
  return serialized;
}
