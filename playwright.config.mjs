import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:3000', trace: 'retain-on-failure', channel: 'chrome',
    launchOptions: process.env.PLAYWRIGHT_CHROME_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROME_EXECUTABLE_PATH } : {} },
  projects: [
    { name: 'desktop-chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'npm run dev -- --hostname 127.0.0.1',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: false,
    timeout: 120_000,
    env: { ANALYSIS_ENABLED: 'false', CLOUDFLARE_FREE_PLAN_CONFIRMED: 'false', NEXT_TELEMETRY_DISABLED: '1' },
  },
});
