import { defineConfig, devices } from '@playwright/test';

/**
 * Browser tests run against an already running app (`npm run docker:up` or the
 * dev servers). Set BASE_URL to test another environment, e.g. the live demo.
 */
export default defineConfig({
  testDir: './e2e',
  // One worker: tests share a database and the per-account login rate limit.
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    locale: 'tr-TR',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
