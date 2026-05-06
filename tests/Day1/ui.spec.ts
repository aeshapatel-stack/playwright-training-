import { test, expect } from '@playwright/test';

// ── 1. Role locator (already exists — highest priority) ───────────────────────
test('Locator 1 — Role: verify radio buttons and suggestion box', async ({ page }) => {
    await page.goto('https://rahulshettyacademy.com/AutomationPractice/', {
        waitUntil: 'domcontentloaded'
    });

    const radio1 = page.locator('input[value="radio1"]');
    const radio2 = page.locator('input[value="radio2"]');

    await radio1.check();
    await expect(radio1).toBeChecked();
    await expect(radio2).not.toBeChecked();

    await radio2.check();
    await expect(radio2).toBeChecked();
    await expect(radio1).not.toBeChecked();

    const allRadios = page.locator('input[name="radioButton"]');
    await expect(allRadios).toHaveCount(3);

    // getByRole — tied to accessibility, preferred selector
    const suggestionBox = page.getByRole('textbox', { name: 'Type to Select Countries' });
    await suggestionBox.fill('India');
    await expect(suggestionBox).toHaveValue('India');
});

// ── 2. Label locator ──────────────────────────────────────────────────────────
// getByLabel() finds an input by the text of its associated <label> element.
// Works when the label is linked via `for`/`id` or wraps the input directly.
test('Locator 2 — Label: fill login form fields by their labels', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    // "Email" and "Password" are <label> texts associated with the inputs
    const emailField    = page.getByLabel('Email');
    const passwordField = page.getByLabel('Password');

    await emailField.fill('label_demo@example.com');
    await passwordField.fill('Password123!');

    await expect(emailField).toHaveValue('label_demo@example.com');
    await expect(passwordField).toHaveValue('Password123!');
});

// ── 3. Placeholder locator ────────────────────────────────────────────────────
// getByPlaceholder() targets inputs by their placeholder attribute text.
// Useful when inputs have no associated label in the HTML (e.g. register form).
test('Locator 3 — Placeholder: fill register form fields by placeholder text', async ({ page }) => {
    await page.goto('/register', { waitUntil: 'domcontentloaded' });

    const emailField    = page.getByPlaceholder('you@email.com');
    const passwordField = page.getByPlaceholder('Min 8 chars, uppercase, number & symbol');
    const confirmField  = page.getByPlaceholder('Repeat your password');

    await emailField.fill('placeholder_demo@example.com');
    await passwordField.fill('Password123!');
    await confirmField.fill('Password123!');

    await expect(emailField).toHaveValue('placeholder_demo@example.com');
    await expect(passwordField).toHaveValue('Password123!');
    await expect(confirmField).toHaveValue('Password123!');
});

// ── 4. Test ID locator ────────────────────────────────────────────────────────
// getByTestId() looks for a `data-testid` attribute on the element.
// Most stable locator — unaffected by text, layout, or style changes.
// Requires developers to add data-testid attributes to the HTML.
test('Locator 4 — TestID: locate element by data-testid attribute', async ({ page }) => {
    await page.goto('https://rahulshettyacademy.com/AutomationPractice/', {
        waitUntil: 'domcontentloaded'
    });

    // data-testid is set by developers — shown here as a pattern demo.
    // If the app has no data-testid, fall back to the next priority locator.
    // Example usage (works when data-testid="suggestion-box" exists in DOM):
    //   const input = page.getByTestId('suggestion-box');
    //   await input.fill('India');

    // Demonstrating with a known attribute selector as equivalent pattern:
    const suggestionBox = page.locator('[placeholder="Type to Select Countries"]');
    await suggestionBox.fill('Canada');
    await expect(suggestionBox).toHaveValue('Canada');
});

// ── 5. Text locator ───────────────────────────────────────────────────────────
// getByText() finds elements by their visible text content.
// Best for asserting static labels, headings, and links — not for form inputs.
test('Locator 5 — Text: assert visible text on the login page', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    // Assert heading text
    await expect(page.getByText('Sign in to EventHub')).toBeVisible();

    // Assert label texts visible on the form
    await expect(page.getByText('Email')).toBeVisible();
    await expect(page.getByText('Password')).toBeVisible();

    // exact: true prevents matching "Sign in to EventHub" heading as well
    await expect(page.getByText('Sign In', { exact: true })).toBeVisible();
});

// ── 6. CSS locator (last resort) ──────────────────────────────────────────────
// page.locator('css selector') — use only when no semantic locator works.
// Brittle: breaks when class names or element structure changes.
test('Locator 6 — CSS: locate form inputs by type attribute (last resort)', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    // CSS selectors target element attributes directly — no semantic meaning
    const emailInput    = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton  = page.locator('button[type="submit"]');

    await emailInput.fill('css_demo@example.com');
    await passwordInput.fill('Password123!');

    await expect(emailInput).toHaveValue('css_demo@example.com');
    await expect(passwordInput).toHaveValue('Password123!');
    await expect(submitButton).toBeVisible();
});