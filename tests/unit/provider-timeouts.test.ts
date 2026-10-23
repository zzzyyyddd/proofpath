import test from 'node:test';
import assert from 'node:assert/strict';
import { generateCandidates } from '../../src/lib/server/ai/cloudflare';
import { makeDocument } from '../../src/lib/server/documents/canonical-text';
import { semanticFixtures } from '../fixtures/evaluation';
import { singleRequest } from '../../scripts/single-request';
import { ProofPathError } from '../../src/lib/shared/errors';
import { LIMITS } from '../../src/lib/server/limits';

const docs = {
  old: makeDocument('old', 'old.txt', semanticFixtures.removal.old),
  new: makeDocument('new', 'new.txt', semanticFixtures.removal.new),
};
async function configured(run: () => Promise<void>) {
  const keys = ['ANALYSIS_ENABLED', 'CLOUDFLARE_FREE_PLAN_CONFIRMED', 'CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID'] as const;
  const before = keys.map(key => process.env[key]);
  Object.assign(process.env, { ANALYSIS_ENABLED: 'true', CLOUDFLARE_FREE_PLAN_CONFIRMED: 'true', CLOUDFLARE_API_TOKEN: 'synthetic-offline-test-token', CLOUDFLARE_ACCOUNT_ID: 'a'.repeat(32) });
  try { await run(); }
  finally { keys.forEach((key, i) => { if (before[i] === undefined) delete process.env[key]; else process.env[key] = before[i]; }); }
}
const interrupted = (error: unknown) => error instanceof ProofPathError && error.code === 'ANALYSIS_INTERRUPTED';

test('unchanged production 60-second deadline aborts header wait; not a schema or semantic failure, no retry', async () => configured(async () => {
  const deadline = new AbortController();
  const original = AbortSignal.timeout;
  // Inject the signal, not a different production duration or a 60-second sleep.
  AbortSignal.timeout = delay => { assert.equal(delay, 60_000); assert.equal(delay, LIMITS.providerTimeoutMs); return deadline.signal; };
  const probe = singleRequest(async (_url, options) => {
    assert.equal(options?.redirect, 'error');
    const body = JSON.parse(String(options?.body));
    assert.deepEqual(Object.keys(body).sort(), ['max_tokens', 'messages', 'response_format', 'stream', 'temperature']);
    assert.equal(body.max_tokens, 4096); assert.equal(body.stream, false);
    return new Promise<Response>((_resolve, reject) => {
      options!.signal!.addEventListener('abort', () => reject(options!.signal!.reason), { once: true });
    });
  });
  try {
    const pending = generateCandidates(docs, { fetcher: probe.fetcher });
    deadline.abort(new DOMException('Synthetic deadline', 'TimeoutError'));
    await assert.rejects(pending, interrupted);
    assert.equal(probe.requests, 1); assert.equal(probe.httpStatus, null);
    assert.equal(probe.signalAborted, true); assert.equal(probe.abortReason, 'TimeoutError');
    await assert.rejects(probe.fetcher('https://offline.invalid'), /budget exhausted/);
  } finally { AbortSignal.timeout = original; }
}));

test('abort during response body is classified as interruption with observed HTTP status and no partial result', async () => configured(async () => {
  const cancellation = new AbortController();
  const probe = singleRequest(async () => new Response(new ReadableStream({
    pull(controller) {
      cancellation.abort(new DOMException('Synthetic cancellation', 'AbortError'));
      controller.error(cancellation.signal.reason);
    },
  }, { highWaterMark: 0 }), { status: 200 }));
  await assert.rejects(generateCandidates(docs, { signal: cancellation.signal, fetcher: probe.fetcher }), interrupted);
  assert.equal(probe.requests, 1); assert.equal(probe.httpStatus, 200);
  assert.equal(probe.abortReason, 'AbortError');
}));

test('caller cancellation before generation issues zero fetch invocations', async () => configured(async () => {
  const probe = singleRequest(async () => { throw new Error('must not fetch'); });
  await assert.rejects(generateCandidates(docs, { signal: AbortSignal.abort(), fetcher: probe.fetcher }), interrupted);
  assert.equal(probe.requests, 0);
}));

test('body transport failure without aborted signal stays provider unavailable and never becomes invalid schema', async () => configured(async () => {
  const probe = singleRequest(async () => new Response(new ReadableStream({
    pull(controller) { controller.error(new Error('Synthetic transport failure; not public')); },
  }, { highWaterMark: 0 })));
  await assert.rejects(generateCandidates(docs, { fetcher: probe.fetcher }), error => {
    assert.ok(error instanceof ProofPathError); assert.equal(error.code, 'PROVIDER_UNAVAILABLE');
    assert.equal(error.message.includes('not public'), false); return true;
  });
  assert.equal(probe.requests, 1);
}));

test('probe redacts arbitrary abort reasons rather than leaking upstream or private details', async () => {
  const controller = new AbortController();
  const probe = singleRequest(async () => { controller.abort({ name: 'private-document-content' }); throw new Error('synthetic'); });
  await assert.rejects(probe.fetcher('https://offline.invalid', { signal: controller.signal }));
  assert.equal(probe.abortReason, 'Other');
});
