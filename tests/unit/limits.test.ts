import test from 'node:test';
import assert from 'node:assert/strict';
import { makeDocument, extractTextFile } from '../../src/lib/server/documents/canonical-text';
import { LIMITS, serializeWithinBudget } from '../../src/lib/server/limits';
import { buildResult } from '../../src/lib/server/results';

test('30,000 Unicode code points are accepted without truncation; 30,001 rejected', () => {
  const text = '😀'.repeat(30_000);
  const d = makeDocument('old', 'emoji.txt', text);
  assert.equal(d.codePointCount, 30_000); assert.equal(d.canonicalText.length, 60_000);
  assert.throws(() => makeDocument('old', 'too-long.txt', text + 'a'), /30,000/);
});
test('text decoding is fatal for invalid UTF-8; empty and binary inputs rejected', () => {
  assert.throws(() => extractTextFile(new Uint8Array([0xff]), 'old', 'invalid.txt'), /UTF-8/);
  assert.throws(() => makeDocument('old', 'blank.txt', '  \n'), /no usable text/);
  assert.throws(() => makeDocument('old', 'binary.txt', 'abc\0def'), /binary/);
  assert.throws(() => extractTextFile(new TextEncoder().encode('%PDF-1.7'), 'old', 'disguised.txt'), /correct extension/);
});
test('byte budget measured on actual bytes rather than browser metadata', () => {
  assert.throws(() => extractTextFile(new Uint8Array(2_000_001), 'old', 'large.txt'), /2 MB/);
});
test('canonical BOM and newline processing occurs before counting and evidence matching', () => {
  assert.equal(makeDocument('old', 'newlines.md', '\uFEFFa\r\nb\rc', 'md').canonicalText, 'a\nb\nc');
});
test('1 MB budget includes Unicode source text, line maps and actual terminal-event JSON', () => {
  for (const text of ['😀'.repeat(30_000), '"\\'.repeat(15_000), 'a\n'.repeat(15_000), 'é\t'.repeat(15_000)]) {
    const old = makeDocument('old', '😀'.repeat(200), text);
    const next = makeDocument('new', '新'.repeat(200), text.slice(0, -2) + 'b');
    const result = buildResult('unicode-budget', { old, new: next }, { candidates: [], analysis_complete: true });
    const json = serializeWithinBudget({ type: 'result', attemptId: 'unicode-budget', result });
    assert.ok(Buffer.byteLength(json + '\n', 'utf8') < LIMITS.serializedResponseBytes);
    assert.equal(JSON.parse(json).result.documents.old.canonicalText, text);
  }
});
test('response budget fails explicitly, without clipping content', () => {
  assert.throws(() => serializeWithinBudget({ text: 'x'.repeat(1_000_000) }), /Nothing was truncated/);
});
