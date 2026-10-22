import { providerReadiness, generateCandidates } from '../src/lib/server/ai/cloudflare';
import { makeDocument } from '../src/lib/server/documents/canonical-text';
import { buildResult } from '../src/lib/server/results';
import { semanticFixtures, type SemanticFixtureName } from '../tests/fixtures/evaluation';
import { matchesSemanticExpectation } from './semantic-expectations';
import assert from 'node:assert/strict';

async function main() {
  if (!process.argv.includes('--confirm-free-plan') || !process.argv.includes('--max-calls=1')) {
    throw new Error('No inference performed. This probe requires --confirm-free-plan --max-calls=1, server-side credentials, ANALYSIS_ENABLED=true and CLOUDFLARE_FREE_PLAN_CONFIRMED=true. Confirm actual account plan first.');
  }
  const fixtureName = process.argv.find(arg => arg.startsWith('--fixture='))?.slice('--fixture='.length) ?? 'main';
  if (!Object.hasOwn(semanticFixtures, fixtureName)) throw new Error('Unknown controlled fixture. No inference performed.');
  const fixture = semanticFixtures[fixtureName as SemanticFixtureName];
  const readiness = providerReadiness();
  if (!readiness.ready) throw new Error(readiness.message);
  const docs = { old: makeDocument('old', 'old-rules.txt', fixture.old), new: makeDocument('new', 'new-rules.txt', fixture.new) };
  const response = await generateCandidates(docs);
  const result = buildResult('live-bounded-probe', docs, response);
  assert.equal(result.incomplete, false, 'Evidence or analysis verification failed.');
  assert.equal(matchesSemanticExpectation(response, fixture.expected.map(c => ({ kind: c.kind, oldQuote: c.old_quote, newQuote: c.new_quote }))), true, 'Controlled semantic classifications or exact expected quotations differ.');
  console.log(JSON.stringify({ fixture: fixtureName, networkCalls: 1, result: 'passed single probe only', repeatabilityGate: 'NOT COMPLETE', maximumContextGate: 'NOT RUN' }, null, 2));
}
main().catch(() => { console.error('Evaluation failed or was not authorized/configured. No retry or fallback was made. Inspect configuration and offline tests; raw provider content and credentials are not logged.'); process.exitCode = 1; });
