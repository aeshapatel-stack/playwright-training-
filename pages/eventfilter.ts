import { Page, expect } from '@playwright/test';

export class EventsFilterPage {
  constructor(private page: Page) {}

  async loginAndNavigate(email: string, password: string) {
    await this.page.goto('/login', { waitUntil: 'domcontentloaded' });
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Sign In' }).click();
    await expect(
      this.page.getByRole('heading', { name: 'Discover & Book Amazing Events' })
    ).toBeVisible({ timeout: 15000 });
    await this.page.goto('/events', { waitUntil: 'domcontentloaded' });
  }

  async filterByCategory(category: string) {
    await this.page.getByRole('combobox').first().selectOption(category);
    await this.page.waitForLoadState('networkidle');
  }

  async assertEventVisible(eventName: string) {
    await expect(
      this.page.getByText(eventName, { exact: false })
    ).toBeVisible({ timeout: 10000 });
  }

  async assertEventNotVisible(eventName: string) {
    await expect(
      this.page.getByText(eventName, { exact: false })
    ).not.toBeVisible({ timeout: 10000 });
  }

  async assertHeadingVisible() {
    await expect(
      this.page.getByRole('heading', { name: 'Upcoming Events' })
    ).toBeVisible({ timeout: 10000 });
  }
}
