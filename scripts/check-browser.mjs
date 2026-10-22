import { chromium } from '@playwright/test';

// Explicit override only: never install a browser or silently change engines.
const executablePath = process.env.PLAYWRIGHT_CHROME_EXECUTABLE_PATH;
let browser;
try {
  browser = await chromium.launch({
    channel: 'chrome',
    ...(executablePath ? { executablePath } : {}),
    headless: true,
    timeout: 15_000,
  });
  const page = await browser.newPage();
  await page.setContent('<title>ProofPath browser check</title><h1>Chrome ready</h1>');
  if (await page.title() !== 'ProofPath browser check') throw new Error('Browser page check failed');
  console.log('PASS: existing Chrome launched and rendered the isolated check page.');
} catch (error) {
  console.error('FAIL: existing Chrome could not complete the browser check. No browser was downloaded.');
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  await browser?.close();
}
