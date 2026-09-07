import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests', timeout: 90_000, workers: 1,
  use: { baseURL: 'http://127.0.0.1:3100', channel: 'chrome', viewport: { width: 1440, height: 900 }, screenshot: 'only-on-failure', trace: 'retain-on-failure', launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } },
  webServer: { command: 'node tests/serve.mjs', url: 'http://127.0.0.1:3100', reuseExistingServer: !process.env.CI },
});
