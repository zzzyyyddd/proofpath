import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

for (const route of ['compare', 'documents/validate']) {
  const trace = `.next/server/app/api/${route}/route.js.nft.json`;
  const files = (JSON.parse(readFileSync(trace, 'utf8')) as { files: string[] }).files;
  for (const required of ['pdf.mjs', 'pdf.worker.mjs']) {
    assert.ok(files.some(file => file.endsWith(`/pdfjs-dist/legacy/build/${required}`)), `${route}: missing PDF.js runtime dependency ${required}`);
  }
  let tracedBytes = 0;
  for (const file of new Set(files)) tracedBytes += statSync(resolve(dirname(trace), file)).size;
  console.log(JSON.stringify({ route, pdfjsMainAndWorkerTraced: true, tracedBytes,
    deployedRuntime: 'NOT VERIFIED; trace is local packaging evidence only' }));
}
