import { test as base, expect, Page } from '@playwright/test';

export const test = base.extend<{ appPage: Page }>({
  appPage: async ({ page }, use) => {
    await page.goto('/');
    await use(page);
  },
});

export { expect };
