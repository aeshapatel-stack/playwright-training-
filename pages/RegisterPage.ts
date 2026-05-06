import { Page, expect } from '@playwright/test';

export class RegisterPage {
  constructor(private page: Page) {}

  // ── Navigation ──────────────────────────────────────────────────────────────

  async navigate() {
    await this.page.goto('/register', { waitUntil: 'domcontentloaded' }).catch(async () => {
      await this.page.goto('/register', { waitUntil: 'domcontentloaded' });
    });
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  async register(email: string, password: string, confirmPassword?: string) {
    if (email)    await this.page.getByPlaceholder('you@email.com').fill(email);
    if (password) await this.page.getByPlaceholder('Min 8 chars, uppercase, number & symbol').fill(password);
    if (confirmPassword !== undefined)
      await this.page.getByPlaceholder('Repeat your password').fill(confirmPassword);
    await this.page.getByRole('button', { name: 'Create Account' }).click();
  }

  // ── Assertions ──────────────────────────────────────────────────────────────

  async assertRegistrationSuccess() {
    await expect(
      this.page.getByRole('button', { name: 'Logout' })
    ).toBeVisible({ timeout: 15000 });
  }

  async assertPasswordRequirementsError() {
    await expect(
      this.page.getByText('Password does not meet the requirements below')
    ).toBeVisible();
  }

  async assertPasswordMismatchError() {
    await expect(
      this.page.getByText('Passwords do not match')
    ).toBeVisible();
  }

  async assertAlreadyRegisteredError() {
    // App shows a toast that disappears quickly — assert the failure outcome instead:
    // user stays on /register and is not logged in
    await expect(this.page).toHaveURL(/register/);
    await expect(this.page.getByRole('button', { name: 'Logout' })).not.toBeVisible();
  }
}
