import { mkdirSync, writeFileSync } from 'node:fs';
import { maximumFixture } from '../tests/fixtures/maximum-context';
import assert from 'node:assert/strict';

mkdirSync('tests/fixtures/maximum', { recursive: true });
for (const id of ['old', 'new'] as const) {
  assert.equal(Array.from(maximumFixture[id]).length, 30_000);
  assert.doesNotMatch(maximumFixture[id], /[\t ]+$/m, 'Fixture must not contain trailing whitespace');
  writeFileSync(`tests/fixtures/maximum/${id}-rules.txt`, maximumFixture[id]);
}
console.log('Prepared two original synthetic English TXT fixtures, exactly 30,000 code points each. No inference performed.');
