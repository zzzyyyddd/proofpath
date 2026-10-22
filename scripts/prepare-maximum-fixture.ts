import { mkdirSync, writeFileSync } from 'node:fs';
import { maximumFixture } from '../tests/fixtures/maximum-context';

mkdirSync('tests/fixtures/maximum', { recursive: true });
for (const id of ['old', 'new'] as const) {
  writeFileSync(`tests/fixtures/maximum/${id}-rules.txt`, maximumFixture[id]);
}
console.log('Prepared two original synthetic English TXT fixtures, exactly 30,000 code points each. No inference performed.');
