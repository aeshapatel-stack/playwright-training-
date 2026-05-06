import { Page, Locator } from '@playwright/test';

// ── Core class ────────────────────────────────────────────────────────────────

interface Strategy {
  name: string;
  selector: string;
  priority: number;
}

export class SelfHealingLocator {
  private strategies: Strategy[];

  constructor(private page: Page, strategies: Strategy[]) {
    this.strategies = [...strategies].sort((a, b) => a.priority - b.priority);
  }

  async find(timeout = 5000): Promise<Locator> {
    for (const s of this.strategies) {
      try {
        const loc = this.page.locator(s.selector);
        await loc.waitFor({ state: 'visible', timeout });
        if (s.priority > 1) {
          console.warn(
            `[SelfHealing] Primary selector failed — fell back to '${s.name}': ${s.selector}`
          );
        }
        return loc;
      } catch {
        // strategy failed, try next
      }
    }
    const tried = this.strategies.map(s => `  ${s.name}: ${s.selector}`).join('\n');
    throw new Error(`[SelfHealing] All strategies failed. Tried:\n${tried}`);
  }
}

// ── EventHub Login page ───────────────────────────────────────────────────────

export const LoginLocators = {
  emailInput: (page: Page) =>
    new SelfHealingLocator(page, [
      { name: 'type',        selector: 'input[type="email"]',                 priority: 1 },
      { name: 'placeholder', selector: 'input[placeholder*="email" i]',       priority: 2 },
      { name: 'name-attr',   selector: 'input[name="email"]',                 priority: 3 },
    ]),

  passwordInput: (page: Page) =>
    new SelfHealingLocator(page, [
      { name: 'type',        selector: 'input[type="password"]',              priority: 1 },
      { name: 'aria-label',  selector: '[aria-label="Password"]',             priority: 2 },
      { name: 'name-attr',   selector: 'input[name="password"]',              priority: 3 },
    ]),

  signInButton: (page: Page) =>
    new SelfHealingLocator(page, [
      { name: 'type-submit', selector: 'button[type="submit"]',               priority: 1 },
      { name: 'has-text',    selector: 'button:has-text("Sign In")',           priority: 2 },
      { name: 'role-text',   selector: '[role="button"]:has-text("Sign In")', priority: 3 },
    ]),

  logoutButton: (page: Page) =>
    new SelfHealingLocator(page, [
      { name: 'has-text',    selector: 'button:has-text("Logout")',            priority: 1 },
      { name: 'aria-label',  selector: '[aria-label="Logout"]',               priority: 2 },
      { name: 'nav-last',    selector: 'nav button:last-of-type',              priority: 3 },
    ]),
};

// ── EventHub Registration page ────────────────────────────────────────────────

export const RegisterLocators = {
  emailInput: (page: Page) =>
    new SelfHealingLocator(page, [
      { name: 'placeholder', selector: 'input[placeholder="you@email.com"]',     priority: 1 },
      { name: 'type',        selector: 'input[type="email"]',                    priority: 2 },
      { name: 'name-attr',   selector: 'input[name="email"]',                   priority: 3 },
    ]),

  passwordInput: (page: Page) =>
    new SelfHealingLocator(page, [
      { name: 'placeholder', selector: 'input[placeholder*="8 chars" i]',        priority: 1 },
      { name: 'type-first',  selector: 'input[type="password"]:first-of-type',  priority: 2 },
      { name: 'name-attr',   selector: 'input[name="password"]',                priority: 3 },
    ]),

  confirmPasswordInput: (page: Page) =>
    new SelfHealingLocator(page, [
      { name: 'placeholder', selector: 'input[placeholder*="Repeat" i]',         priority: 1 },
      { name: 'type-last',   selector: 'input[type="password"]:last-of-type',   priority: 2 },
      { name: 'name-attr',   selector: 'input[name="confirmPassword"]',         priority: 3 },
    ]),

  createAccountButton: (page: Page) =>
    new SelfHealingLocator(page, [
      { name: 'type-submit', selector: 'button[type="submit"]',                  priority: 1 },
      { name: 'has-text',    selector: 'button:has-text("Create Account")',      priority: 2 },
    ]),
};

// ── EventHub Admin — Event Creation form ─────────────────────────────────────

export const AdminEventLocators = {
  titleInput: (page: Page) =>
    new SelfHealingLocator(page, [
      { name: 'aria-label',  selector: '[aria-label="Title*"]',                  priority: 1 },
      { name: 'placeholder', selector: 'input[placeholder*="title" i]',          priority: 2 },
      { name: 'name-attr',   selector: 'input[name="title"]',                   priority: 3 },
    ]),

  cityInput: (page: Page) =>
    new SelfHealingLocator(page, [
      { name: 'aria-label',  selector: '[aria-label="City*"]',                   priority: 1 },
      { name: 'placeholder', selector: 'input[placeholder*="city" i]',           priority: 2 },
      { name: 'name-attr',   selector: 'input[name="city"]',                    priority: 3 },
    ]),

  addEventButton: (page: Page) =>
    new SelfHealingLocator(page, [
      { name: 'has-text',    selector: 'button:has-text("+ Add Event")',          priority: 1 },
      { name: 'type-submit', selector: 'form button[type="submit"]',             priority: 2 },
      { name: 'role-text',   selector: '[role="button"]:has-text("Add Event")',  priority: 3 },
    ]),
};
