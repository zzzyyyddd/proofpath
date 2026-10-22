import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { consumeComparisonStream, STAGES } from '../../src/lib/client/requests';

const sample = JSON.parse(readFileSync('public/samples/analysis.json', 'utf8'));
const attemptId = sample.attemptId;
const stages = STAGES.flatMap(name => [{ type: 'stage', attemptId, name, status: 'started' }, { type: 'stage', attemptId, name, status: 'done' }]);
const terminal = { type: 'result', attemptId, result: sample };
function response(events: unknown[], byteChunks = false) {
  const text = events.map(event => JSON.stringify(event) + '\n').join('');
  if (!byteChunks) return new Response(text);
  const bytes = new TextEncoder().encode(text);
  return new Response(new ReadableStream({ start(controller) { for (let i = 0; i < bytes.length; i += 7) controller.enqueue(bytes.slice(i, i + 7)); controller.close(); } }));
}
const current = { isCurrent: () => true, onStage: () => undefined };
test('client parser consumes real stages and validates full terminal result across byte chunks', async () => {
  const seen: string[] = [];
  const result = await consumeComparisonStream(response([...stages, terminal], true), attemptId, { ...current, onStage: (name, status) => seen.push(name + status) });
  assert.equal(result?.classified.length, 3); assert.equal(seen.length, 8);
});
test('interrupted, wrong-attempt, premature and trailing-garbage streams never return completed analysis', async () => {
  for (const events of [stages, [{ ...stages[0], attemptId: 'stale' }], [terminal], [...stages, terminal, { bad: true }]]) {
    await assert.rejects(consumeComparisonStream(response(events), attemptId, current));
  }
});
test('superseded response is ignored without calling stage callbacks or exposing old findings', async () => {
  let updates = 0;
  const result = await consumeComparisonStream(response([...stages, terminal]), attemptId, { isCurrent: () => false, onStage: () => updates++ });
  assert.equal(result, null); assert.equal(updates, 0);
});
test('terminal server failure stays an error rather than a no-changes result', async () => {
  await assert.rejects(consumeComparisonStream(response([{ type: 'error', attemptId, error: { message: 'Quota exhausted.' } }]), attemptId, current), /Quota exhausted/);
});
test('stage completion cannot precede its actual start', async () => {
  await assert.rejects(consumeComparisonStream(response([{ ...stages[0], status: 'done' }]), attemptId, current), /stages were inconsistent/);
});
