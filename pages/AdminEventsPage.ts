import { Page, expect } from '@playwright/test';

export interface EventFormData {
  title?:       string;
  category?:    string;
  city?:        string;
  venue?:       string;
  date?:        string;
  price?:       number;
  seats?:       number;
  description?: string;
  imageUrl?:    string;
}

export class AdminEventsPage {
  constructor(private page: Page) {}

  // ── Navigation ──────────────────────────────────────────────────────────────

  /** Login as the given user then navigate to Admin → Manage Events. */
  async navigateAsAdmin(email: string, password: string) {
    await this.page.goto('/login', { waitUntil: 'domcontentloaded' });
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Sign In' }).click();
    await this.page.getByRole('button', { name: 'Admin' }).click();
    await this.page.getByRole('navigation').getByRole('link', { name: 'Manage Events' }).click();
    await expect(this.page.getByRole('heading', { name: '+ New Event' })).toBeVisible();
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  async fillForm(data: EventFormData) {
    if (data.title)       await this.page.getByRole('textbox',    { name: 'Title*' }).fill(data.title);
    if (data.category)    await this.page.getByRole('combobox',   { name: 'Category*' }).selectOption(data.category);
    if (data.city)        await this.page.getByRole('textbox',    { name: 'City*' }).fill(data.city);
    if (data.venue)       await this.page.getByRole('textbox',    { name: 'Venue*' }).fill(data.venue);
    if (data.date)        await this.page.getByRole('textbox',    { name: 'Event Date & Time*' }).fill(data.date);
    if (data.price  !== undefined)
      await this.page.getByRole('spinbutton', { name: 'Price ($)*' }).fill(String(data.price));
    if (data.seats  !== undefined)
      await this.page.getByRole('spinbutton', { name: 'Total Seats*' }).fill(String(data.seats));
    if (data.description)
      await this.page.getByRole('textbox', { name: /describe the event/i }).fill(data.description);
    if (data.imageUrl)
      await this.page.getByRole('textbox', { name: 'Image URL (optional)' }).fill(data.imageUrl);
  }

  async submitForm() {
    await this.page.getByRole('button', { name: '+ Add Event' }).click();
  }

  // ── Assertions ──────────────────────────────────────────────────────────────

  async assertEventInTable(title: string) {
    await expect(
      this.page.getByRole('cell', { name: title, exact: true })
    ).toBeVisible();
  }

  async assertCategoryInRow(title: string, category: string) {
    const row = this.page.getByRole('row', { name: new RegExp(title) });
    await expect(row).toBeVisible();
    await expect(row.getByRole('cell', { name: category, exact: true })).toBeVisible();
  }

  async assertAllRequiredFieldErrors() {
    await expect(this.page.getByText('Title is required')).toBeVisible();
    await expect(this.page.getByText('City is required')).toBeVisible();
    await expect(this.page.getByText('Venue is required')).toBeVisible();
    await expect(this.page.getByText('Event date is required')).toBeVisible();
    await expect(this.page.getByText('Enter a valid price (≥ 0)')).toBeVisible();
    await expect(this.page.getByText('Must have at least 1 seat')).toBeVisible();
  }

  async assertOnlyTitleError() {
    await expect(this.page.getByText('Title is required')).toBeVisible();
    await expect(this.page.getByText('City is required')).not.toBeVisible();
    await expect(this.page.getByText('Venue is required')).not.toBeVisible();
  }
}
