import { Page, expect } from '@playwright/test';

export class HomePage {
  constructor(private page: Page) {}

  async assertHeadingVisible() {
    await expect(
      this.page.getByRole('heading', { name: 'Discover & Book Amazing Events' })
    ).toBeVisible({ timeout: 15000 });
  }

  async assertLogoutVisible() {
    await expect(
      this.page.getByRole('button', { name: 'Logout' })
    ).toBeVisible({ timeout: 15000 });
  }
}
