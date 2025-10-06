import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,

  // Prevent accidental .only in CI
  forbidOnly: !!process.env.CI,

  // Retry failing tests in CI for stability
  retries: process.env.CI ? 2 : 0,

  // Use fewer workers in CI for resource limits
  workers: process.env.CI ? 1 : undefined,

  // Generate an HTML report after tests
  reporter: [['html', { open: 'never' }]],

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry', // capture trace for debugging flaky tests
    screenshot: 'only-on-failure', // good practice
    video: 'retain-on-failure',    // keep video if test fails
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--no-sandbox'], // CI friendly
        },
      },
    },
    // You can easily enable more browsers if needed:
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
    timeout: 120 * 1000, // wait up to 2 min for dev server to start
  },
});
