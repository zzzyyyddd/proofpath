import { providerReadiness, generateCandidates } from '../src/lib/server/ai/cloudflare';
import { makeDocument } from '../src/lib/server/documents/canonical-text';
import { buildResult } from '../src/lib/server/results';
import { newRules, oldRules } from '../tests/fixtures/rules';
import assert from 'node:assert/strict';

async function main() {
  if (!process.argv.includes('--confirm-free-plan') || !process.argv.includes('--max-calls=1')) {
    throw new Error('No inference performed. This probe requires --confirm-free-plan --max-calls=1, server-side credentials, ANALYSIS_ENABLED=true and CLOUDFLARE_FREE_PLAN_CONFIRMED=true. Confirm actual account plan first.');
  }
  const readiness = providerReadiness();
  if (!readiness.ready) throw new Error(readiness.message);
  const docs = { old: makeDocument('old', 'old-rules.txt', oldRules), new: makeDocument('new', 'new-rules.txt', newRules) };
  const response = await generateCandidates(docs);
  const result = buildResult('live-bounded-probe', docs, response);
  assert.equal(result.incomplete, false, 'Evidence or analysis verification failed.');
  assert.deepEqual(result.counts, { added: 1, removed: 0, modified: 2, needsReview: 0 }, 'Controlled semantic categories differ.');
  assert.equal(result.classified.some(f => f.oldEvidence?.quote.includes('repository') || f.newEvidence?.quote.includes('repository')), false, 'Unchanged requirement incorrectly reported.');
  console.log(JSON.stringify({ fixture: 'main', networkCalls: 1, result: 'passed single probe only', repeatabilityGate: 'NOT COMPLETE', maximumContextGate: 'NOT RUN' }, null, 2));
}
main().catch(() => { console.error('Evaluation failed or was not authorized/configured. No retry or fallback was made. Inspect configuration and offline tests; raw provider content and credentials are not logged.'); process.exitCode = 1; });
