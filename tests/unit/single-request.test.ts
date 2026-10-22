import test from 'node:test';
import assert from 'node:assert/strict';
import { singleRequest, validateProbeArgs } from '../../scripts/single-request';

test('probe CLI rejects missing, conflicting, duplicate and unrecognized budget arguments before inference', () => {
  assert.equal(validateProbeArgs(['--confirm-free-plan', '--max-calls=1', '--fixture=maximum']), 'maximum');
  for (const args of [[], ['--confirm-free-plan'], ['--confirm-free-plan', '--max-calls=1', '--max-calls=2'],
    ['--confirm-free-plan', '--max-calls=1', '--fixture=main', '--fixture=maximum'],
    ['--confirm-free-plan', '--max-calls=1', '--max-calls=1'], ['--confirm-free-plan', '--max-calls=1', '--retry']]) {
    assert.throws(() => validateProbeArgs(args), /No inference performed/);
  }
});

test('live probe fetch guard permits at most one request, forces no redirects, and records HTTP status', async () => {
  let calls = 0;
  const probe = singleRequest(async (_url, options) => {
    calls++; assert.equal(options?.redirect, 'error');
    return new Response('', { status: 429 });
  });
  const response = await probe.fetcher('https://offline.invalid', { redirect: 'follow' });
  assert.equal(response.status, 429); assert.equal(probe.httpStatus, 429);
  await assert.rejects(probe.fetcher('https://offline.invalid'), /budget exhausted/);
  assert.equal(calls, 1); assert.equal(probe.requests, 1);
});

test('failed network requests still consume the one-request probe budget without retry', async () => {
  let calls = 0;
  const probe = singleRequest(async () => { calls++; throw new Error('Synthetic connection failure'); });
  await assert.rejects(probe.fetcher('https://offline.invalid'), /Synthetic/);
  await assert.rejects(probe.fetcher('https://offline.invalid'), /budget exhausted/);
  assert.equal(probe.httpStatus, null); assert.equal(calls, 1); assert.equal(probe.requests, 1);
});
