import { test, expect } from '@playwright/test';

const upload = (name, text) => ({ name, mimeType: 'text/plain', buffer: Buffer.from(text) });
const choose = (page, label, file) => page.getByLabel(`Choose ${label} document`, { exact: true }).setInputFiles(file);

test('real uploads support identical-text comparison, truthful completion and full reset without inference', async ({ page }) => {
  await page.goto('/');
  const action = page.getByRole('button', { name: 'Compare Documents', exact: false });
  await expect(action).toBeDisabled();
  await choose(page, 'Old Version', upload('old.txt', 'The repository must be public.'));
  await choose(page, 'New Version', upload('new.txt', 'The repository must be public.'));
  await expect(action).toBeEnabled(); await action.click();
  await expect(page.getByText('The supplied document texts are identical. No textual differences were detected.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'New Comparison' }).click();
  await expect(page.getByRole('heading', { name: 'Comparison Overview' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Compare Documents', exact: false })).toBeDisabled();
});

test('static sample exposes exact source context without API calls and restores uploads', async ({ page }) => {
  await page.goto('/');
  await choose(page, 'Old Version', upload('preserved.txt', 'The repository must be public.'));
  await expect(page.getByText('Ready', { exact: true })).toHaveCount(1);
  const apiRequests = [];
  page.on('request', request => { if (request.url().includes('/api/')) apiRequests.push(request.url()); });
  await page.getByRole('button', { name: 'Explore Sample Analysis' }).click();
  await expect(page.getByText('Static sample — controlled fixtures. Not a live AI result.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Team size limit changed/ }).click();
  const inspector = page.getByRole('heading', { name: 'Evidence Inspector' }).locator('..').locator('..');
  await expect(inspector.getByText('Teams may have up to five members.', { exact: true })).toBeVisible();
  await inspector.getByRole('button', { name: 'View Source Context' }).first().click();
  const viewer = page.getByRole('region', { name: 'Source Context Viewer' });
  await expect(viewer).toBeVisible();
  await expect(viewer.locator('mark')).toHaveText('Teams may have up to five members.');
  await expect(viewer).toContainText('The repository must be public.');
  await viewer.getByRole('button', { name: 'Back to Finding' }).click();
  await expect(viewer).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Team size limit changed/ })).toHaveAttribute('aria-pressed', 'true');
  expect(apiRequests).toHaveLength(0);
  await page.screenshot({ path: `test-results/sample-${test.info().project.name}.png`, fullPage: true });
  await page.getByRole('button', { name: 'Back to Live Workspace' }).click();
  await expect(page.getByText('preserved.txt', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('preserved.txt', { exact: true })).toHaveCount(0);
});

test('sample copy follows the selected finding and columns remain aligned with expanded context', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Explore Sample Analysis' }).click();
  const inspector = page.locator('.inspector');
  const findings = page.locator('.findings-panel');
  const assertLayout = async () => {
    // Document coordinates remain meaningful when context focus scrolls the page.
    const bounds = await page.locator('.results-grid').evaluate(grid => {
      const list = grid.querySelector('.findings-panel').getBoundingClientRect();
      const detail = grid.querySelector('.inspector').getBoundingClientRect();
      return { listTop: list.top, listBottom: list.bottom, detailTop: detail.top, listLeft: list.left, detailLeft: detail.left, detailRight: detail.right, width: innerWidth };
    });
    if (bounds.width > 800) {
      expect(Math.abs(bounds.listTop - bounds.detailTop)).toBeLessThanOrEqual(1);
      expect(bounds.detailLeft).toBeGreaterThan(bounds.listLeft);
    } else {
      expect(bounds.detailTop).toBeGreaterThanOrEqual(bounds.listBottom);
      expect(Math.abs(bounds.listLeft - bounds.detailLeft)).toBeLessThanOrEqual(1);
    }
    expect(bounds.detailRight).toBeLessThanOrEqual(bounds.width);
  };
  for (const [title, subject] of [['Deadline changed', /deadline/i], ['Team size limit changed', /team/i], ['Demo video required', /video/i]]) {
    await findings.getByRole('button', { name: new RegExp(title) }).click();
    await expect(inspector.locator('.interpretation > p').first()).toContainText(subject);
    await expect(inspector.locator('.interpretation h3 + p')).toContainText(subject);
    await assertLayout();
    await inspector.getByRole('button', { name: 'View Source Context' }).first().click();
    const viewer = page.getByRole('region', { name: 'Source Context Viewer' });
    await expect(viewer).toBeVisible();
    await assertLayout();
    await expect(page.getByText('Static sample — controlled fixtures. Not a live AI result.', { exact: true })).toBeAttached();
    await viewer.getByRole('button', { name: 'Back to Finding' }).click();
    await expect(viewer).toHaveCount(0);
    await assertLayout();
  }
});

test('invalid replacement preserves the other valid file and never starts analysis automatically', async ({ page }) => {
  const calls = []; page.on('request', request => { if (request.url().includes('/api/compare')) calls.push(request.url()); });
  await page.goto('/');
  await choose(page, 'Old Version', upload('old.txt', 'The repository must be public.'));
  await choose(page, 'New Version', upload('new.txt', 'The repository must be public.'));
  await expect(page.getByRole('button', { name: 'Compare Documents', exact: false })).toBeEnabled();
  await choose(page, 'Old Version', upload('blank.txt', ' '));
  await expect(page.getByRole('alert')).toContainText('no usable text');
  await expect(page.getByText('new.txt', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Compare Documents', exact: false })).toBeDisabled();
  expect(calls).toHaveLength(0);
});

test('disabled live provider retains documents and exposes a separate sample action without fabricated findings', async ({ page }) => {
  await page.goto('/');
  await choose(page, 'Old Version', upload('old.txt', 'Teams may have up to five members.'));
  await choose(page, 'New Version', upload('new.txt', 'Teams may have up to three members.'));
  await page.getByRole('button', { name: 'Compare Documents', exact: false }).click();
  await expect(page.getByRole('alert')).toContainText('not enabled');
  await expect(page.getByRole('heading', { name: 'Comparison Overview' })).toHaveCount(0);
  await expect(page.getByText('old.txt', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retry Comparison', exact: false })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Explore Sample Analysis' })).toBeEnabled();
});

test('an interrupted stream does not expose completed results', async ({ page }) => {
  await page.route('**/api/compare', async route => {
    const body = route.request().postDataBuffer().toString();
    const attemptId = body.match(/name="attemptId"\r\n\r\n([^\r]+)/)?.[1];
    await route.fulfill({ status: 200, contentType: 'application/x-ndjson', body: JSON.stringify({ type: 'stage', attemptId, name: 'Validating and extracting document text', status: 'started' }) + '\n' });
  });
  await page.goto('/');
  await choose(page, 'Old Version', upload('old.txt', 'The repository must be public.'));
  await choose(page, 'New Version', upload('new.txt', 'A demo video is required.'));
  await page.getByRole('button', { name: 'Compare Documents', exact: false }).click();
  await expect(page.getByRole('alert')).toContainText('stream was interrupted');
  await expect(page.getByRole('heading', { name: 'Comparison Overview' })).toHaveCount(0);
});

test('provider-result stream populates Overview and Inspector without opening the curated sample (offline synthetic)', async ({ page }) => {
  // This is explicitly a synthetic UI transport test, never a live-provider claim.
  const { buildResult } = await import('../../src/lib/server/results.ts');
  const { STAGES } = await import('../../src/lib/client/requests.ts');
  const { makeDocument } = await import('../../src/lib/server/documents/canonical-text.ts');
  const { mainCandidates, oldRules, newRules } = await import('../fixtures/rules.ts');
  let comparisons = 0;
  await page.route('**/api/compare', async route => {
    comparisons++;
    const form = await new Response(route.request().postDataBuffer(), {
      headers: { 'content-type': route.request().headers()['content-type'] },
    }).formData();
    const attemptId = String(form.get('attemptId'));
    const result = buildResult(attemptId, {
      old: makeDocument('old', 'uploaded-old.txt', oldRules),
      new: makeDocument('new', 'uploaded-new.txt', newRules),
    }, { candidates: mainCandidates.map(c => ({ ...c, title: 'Provider path: ' + c.title })), analysis_complete: true });
    const stages = STAGES.flatMap(name => ['started', 'done'].map(status => ({ type: 'stage', attemptId, name, status })));
    const body = [...stages, { type: 'result', attemptId, result }].map(event => JSON.stringify(event)).join('\n') + '\n';
    await route.fulfill({ status: 200, contentType: 'application/x-ndjson', body });
  });
  await page.goto('/');
  await choose(page, 'Old Version', upload('uploaded-old.txt', oldRules));
  await choose(page, 'New Version', upload('uploaded-new.txt', newRules));
  const compare = page.getByRole('button', { name: 'Compare Documents', exact: false });
  await expect(compare).toBeEnabled(); await compare.click();
  await expect(page.getByRole('heading', { name: 'Comparison Overview' })).toBeVisible();
  await expect(page.locator('.sample-banner')).toHaveCount(0);
  await page.getByRole('button', { name: /Provider path: Team size limit changed/ }).click();
  const inspector = page.locator('.inspector');
  await expect(inspector.getByText('Teams may have up to five members.', { exact: true })).toBeVisible();
  await expect(inspector.getByText('Teams may have up to three members.', { exact: true })).toBeVisible();
  await inspector.getByRole('button', { name: 'View Source Context' }).first().click();
  await expect(page.getByRole('region', { name: 'Source Context Viewer' }).locator('mark')).toHaveText('Teams may have up to five members.');
  expect(comparisons).toBe(1);
});
