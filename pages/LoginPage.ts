import { Page, expect } from '@playwright/test';
import { SelfHealingLocator, LoginLocators } from '../Utils/self-healing-locators';

export class LoginPage {
  // ── Self-healing locators ───────────────────────────────────────────────────
  private emailInput:    SelfHealingLocator;
  private passwordInput: SelfHealingLocator;
  private signInButton:  SelfHealingLocator;
  private logoutButton:  SelfHealingLocator;

  constructor(private page: Page) {
    this.emailInput    = LoginLocators.emailInput(page);
    this.passwordInput = LoginLocators.passwordInput(page);
    this.signInButton  = LoginLocators.signInButton(page);
    this.logoutButton  = LoginLocators.logoutButton(page);
  }

  // ── Navigation ──────────────────────────────────────────────────────────────

  async navigate() {
    await this.page.goto('/login', { waitUntil: 'domcontentloaded' }).catch(async () => {
      await this.page.goto('/login', { waitUntil: 'domcontentloaded' });
    });
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  async fillEmail(email: string) {
    await (await this.emailInput.find()).fill(email);
  }

  async fillPassword(password: string) {
    await (await this.passwordInput.find()).fill(password);
  }

  async clickSignIn() {
    await (await this.signInButton.find()).click();
  }

  /** Fill both fields and submit — the most common login action. */
  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickSignIn();
  }

  // ── Assertions ──────────────────────────────────────────────────────────────

  /** After successful login the home heading should appear. */
  async assertLoginSuccess() {
    await expect(
      this.page.getByRole('heading', { name: 'Discover & Book Amazing Events' })
    ).toBeVisible({ timeout: 15000 });
  }

  /** Logout button in the nav bar confirms the user is authenticated. */
  async assertLogoutVisible() {
    await expect(await this.logoutButton.find()).toBeVisible({ timeout: 15000 });
  }

  /** Invalid credentials show an inline error message. */
  async assertInvalidCredentialsError() {
    await expect(
      this.page.getByText('Invalid email or password')
    ).toBeVisible({ timeout: 10000 });
  }

  /** Empty form submit should keep the user on the login page. */
  async assertStillOnLoginPage() {
    await expect(this.page).toHaveURL(/\/login/);
    await expect(await this.signInButton.find()).toBeVisible();
  }
}
