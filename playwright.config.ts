import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [['html'], ['list']],

  use: {
    baseURL: 'https://eventhub.rahulshettyacademy.com/',
    trace: 'on-first-retry',
    screenshot: 'on',
    ignoreHTTPSErrors: true,
  },

  projects: [
    {
      name: 'day1',
      testMatch: '**/Day1/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    {
      name: 'api',
      testMatch: '**/api/**/*.spec.ts',
    },

    {
      name: 'ui-chromium',
      testMatch: '**/Day3_AI_generated/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    {
      name: 'ui-firefox',
      testMatch: '**/Day3_AI_generated/**/*.spec.ts',
      use: {
        ...devices['Desktop Firefox'],
      },
    },

    {
      name: 'day2',
      testMatch: '**/Day2/**/*.spec.ts',
    },

    {
      name: 'day4',
      testMatch: '**/Day4/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    {
      name: 'day5',
      testMatch: '**/Day5/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});