import test from 'node:test';
import assert from 'node:assert/strict';
import { validateFile } from '../../src/lib/server/documents/validate';
import { assessLanguage } from '../../src/lib/server/documents/language';
import { textPdf } from '../fixtures/pdf';
import { locateExactQuote } from '../../src/lib/server/evidence/locations';

test('TXT/Markdown validation preserves actual text and does not use inference', async () => {
  const d = await validateFile(new File(['The public repository must include the project. Teams may have up to five members.'], 'rules.md'), 'old');
  assert.equal(d.format, 'md'); assert.equal(d.id, 'old'); assert.ok(d.canonicalText.includes('five members'));
});
test('conservative language policy accepts foreign names and warns on uncertain short text', () => {
  assert.equal(assessLanguage('The project must include a public repository and the required video. Teams may include François and Nguyễn.'), 'english');
  assert.equal(assessLanguage('Demo video required.'), 'uncertain');
});
test('predominantly non-English input blocks before inference; mixed uncertain input gets notice', async () => {
  await assert.rejects(validateFile(new File(['参加するチームには必ず公開されたリポジトリが必要です。提出する作品には説明資料と動画が必要です。参加するチームには必ず公開されたリポジトリが必要です。 提出 作品 資料 動画 参加 条件 必須 確認'], 'rules.txt'), 'old'), /predominantly non-English/);
  const mixed = await validateFile(new File(['An invitational exception: チーム制限. Check it.'], 'mixed.txt'), 'new');
  assert.ok(mixed.limitations.some(note => note.includes('Only English')));
});
test('real PDF.js extraction provides exact per-page source mappings', async () => {
  const d = await validateFile(new File([textPdf(['The repository must be public.', 'A demo video is required.'])], 'rules.pdf'), 'old');
  assert.equal(d.pages.length, 2); assert.equal(d.format, 'pdf');
  assert.equal(locateExactQuote(d, 'A demo video is required.')?.page, 2);
  assert.equal(locateExactQuote(d, 'The repository must be public.')?.page, 1);
  assert.ok(d.limitations.some(note => note.includes('not the original layout')));
});
test('PDF page limits and parsing failures are explicit, never partial comparisons', async () => {
  await assert.rejects(validateFile(new File([textPdf(Array.from({ length: 11 }, () => 'The repository must be public.'))], 'long.pdf'), 'old'), /10 pages/);
  await assert.rejects(validateFile(new File(['%PDF-broken'], 'broken.pdf'), 'old'), /parsing or extraction failed/);
  await assert.rejects(validateFile(new File(['pretend pdf'], 'spoof.pdf'), 'old'), /valid PDF signature/);
});
