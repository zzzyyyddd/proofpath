import { providerReadiness, generateCandidates } from '../src/lib/server/ai/cloudflare';
import { makeDocument } from '../src/lib/server/documents/canonical-text';
import { buildResult } from '../src/lib/server/results';
import { semanticFixtures, type SemanticFixtureName } from '../tests/fixtures/evaluation';
import { matchesSemanticExpectation } from './semantic-expectations';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateFile } from '../src/lib/server/documents/validate';
import { singleRequest, validateProbeArgs } from './single-request';
import { ProofPathError } from '../src/lib/shared/errors';
import { createHash } from 'node:crypto';
import { SYSTEM_PROMPT, makeMessages } from '../src/lib/server/ai/prompt';
import { candidateJsonSchema } from '../src/lib/server/ai/candidate-schema';
import { LIMITS, serializeWithinBudget } from '../src/lib/server/limits';

const request = singleRequest();
const report = {
  fixture: 'not selected', model: '@cf/qwen/qwen3-30b-a3b-fp8',
  httpStatus: null as number | null, networkCalls: 0, maximumRequests: 1,
  neuronsConsumed: null, neuronUsageNote: 'Unavailable in this probe; check actual Workers AI usage before/after. No estimate is substituted.',
  schemaValidity: 'not evaluated', quoteVerification: 'not evaluated', semanticClassification: 'not evaluated',
  counts: null as unknown, result: 'failed or not run', failureCode: null as string | null,
  repeatabilityGate: 'NOT COMPLETE', maximumContextGate: 'NOT RUN',
  fingerprints: null as unknown, extractedCharacters: null as unknown,
  responseBytes: null as number | null, durationMs: null as number | null,
  settings: { temperature: 0, maxOutputTokens: LIMITS.providerOutputTokens, stream: false },
};
const sha256 = (text: string) => createHash('sha256').update(text).digest('hex');
const started = performance.now();

async function main() {
  const fixtureName = validateProbeArgs(process.argv.slice(2));
  report.fixture = fixtureName;
  if (!Object.hasOwn(semanticFixtures, fixtureName)) throw new Error('Unknown controlled fixture. No inference performed.');
  const fixture = semanticFixtures[fixtureName as SemanticFixtureName];
  const readiness = providerReadiness();
  if (!readiness.ready) throw new Error(readiness.message);
  const fileDirectory = fixtureName === 'main' ? 'public/samples' : fixtureName === 'maximum' ? 'tests/fixtures/maximum' : null;
  const docs = fileDirectory ? {
    old: await validateFile(new File([await readFile(`${fileDirectory}/old-rules.txt`)], 'old-rules.txt'), 'old'),
    new: await validateFile(new File([await readFile(`${fileDirectory}/new-rules.txt`)], 'new-rules.txt'), 'new'),
  } : { old: makeDocument('old', 'old-rules.txt', fixture.old), new: makeDocument('new', 'new-rules.txt', fixture.new) };
  assert.equal(docs.old.canonicalText, fixture.old, 'Old fixture differs. No inference performed.');
  assert.equal(docs.new.canonicalText, fixture.new, 'New fixture differs. No inference performed.');
  report.extractedCharacters = { old: docs.old.codePointCount, new: docs.new.codePointCount };
  report.fingerprints = { prompt: sha256(SYSTEM_PROMPT), schema: sha256(JSON.stringify(candidateJsonSchema)),
    oldText: sha256(docs.old.canonicalText), newText: sha256(docs.new.canonicalText), messages: sha256(JSON.stringify(makeMessages(docs))) };
  const response = await generateCandidates(docs, { fetcher: request.fetcher });
  report.schemaValidity = 'passed';
  const result = buildResult('live-bounded-probe', docs, response);
  report.quoteVerification = result.incomplete ? 'failed or incomplete' : 'passed for all returned findings';
  report.counts = result.counts;
  report.responseBytes = Buffer.byteLength(serializeWithinBudget({ type: 'result', attemptId: result.attemptId, result }) + '\n');
  assert.equal(result.incomplete, false, 'Evidence or analysis verification failed.');
  const semanticMatch = matchesSemanticExpectation(response, fixture.expected.map(c => ({ kind: c.kind, oldQuote: c.old_quote, newQuote: c.new_quote })));
  report.semanticClassification = semanticMatch ? 'passed controlled fixture only' : 'failed expected classifications or exact quote selection';
  assert.equal(semanticMatch, true, 'Controlled semantic classifications or exact expected quotations differ.');
  report.result = 'passed single probe only';
}
main().catch(error => {
  report.failureCode = error instanceof ProofPathError ? error.code : error instanceof assert.AssertionError ? 'FIXTURE_ASSERTION_FAILED' : 'PREFLIGHT_OR_REQUEST_FAILED';
  if (report.failureCode === 'INVALID_MODEL_RESPONSE') report.schemaValidity = 'failed';
  process.exitCode = 1;
}).finally(() => {
  report.networkCalls = request.requests; report.httpStatus = request.httpStatus;
  report.durationMs = Math.round(performance.now() - started);
  console.log(JSON.stringify(report, null, 2));
});
