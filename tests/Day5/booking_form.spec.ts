/* AI-GENERATED — Review required | Engineer: | Date: 2026-05-05 */

/**
 * Booking Form Tests — /events/3 (Dilli Diwali Mela)
 *
 * ─── Recommended data-testid Attributes ──────────────────────────────────────
 *
 * Add these to the HTML to make selectors more resilient and explicit:
 *
 *  • [Ticket Decrement Button]   →  data-testid="ticket-decrement"
 *  • [Ticket Count Display]      →  data-testid="ticket-count"
 *  • [Ticket Increment Button]   →  data-testid="ticket-increment"
 *  • [Full Name Input]           →  data-testid="customer-name"
 *  • [Email Input]               →  data-testid="customer-email"   ← ALREADY EXISTS
 *  • [Phone Number Input]        →  data-testid="customer-phone"
 *  • [Price Breakdown Line]      →  data-testid="price-breakdown"
 *  • [Total Price Display]       →  data-testid="total-price"
 *  • [Confirm Booking Button]    →  data-testid="confirm-booking-btn"
 *  • [Booking Confirmed Heading] →  data-testid="booking-confirmed-heading"
 *  • [Booking Reference Value]   →  data-testid="booking-ref"
 *  • [View My Bookings Button]   →  data-testid="view-bookings-btn"
 *  • [Browse More Events Button] →  data-testid="browse-events-btn"
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { test, expect } from '@playwright/test';

const userEmail    = `booker_${Date.now()}@example.com`;
const userPassword = 'Password123!';
const EVENT_PATH   = '/events/3';
const API_BASE     = 'https://api.eventhub.rahulshettyacademy.com';

/** Registers the test user once via API before tests begin. */
async function registerUser(request: Parameters<Parameters<typeof test.beforeAll>[0]>[0]['request']) {
  await request.post(`${API_BASE}/api/auth/register`, {
    data: { email: userEmail, password: userPassword },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 1 — End-to-End Test
// Covers: login → navigate to event → adjust ticket quantity → fill form →
//         confirm booking → verify confirmation panel details
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Booking Form — End-to-End', () => {

  test.describe.configure({ mode: 'serial' });

  test.beforeAll(async ({ request }) => {
    await registerUser(request);
  });

  test.beforeEach(async ({ page }) => {
    // Log in via UI then navigate to the target event page
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByLabel('Email').fill(userEmail);
    await page.getByLabel('Password').fill(userPassword);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(
      page.getByRole('heading', { name: 'Discover & Book Amazing Events' })
    ).toBeVisible({ timeout: 10000 });
    await page.goto(EVENT_PATH, { waitUntil: 'domcontentloaded' });
  });

  test('should complete booking for 2 tickets and display confirmation panel', async ({ page }) => {
    // ── Arrange ───────────────────────────────────────────────────────────────

    // Verify initial state: 1 ticket, decrement disabled, price $300
    await expect(page.getByRole('button', { name: '−' })).toBeDisabled();
    await expect(page.getByText('$300 × 1 ticket')).toBeVisible();

    // Increase ticket quantity to 2 and verify live price recalculation
    await page.getByRole('button', { name: '+' }).click();
    await expect(page.getByText('$300 × 2 tickets')).toBeVisible();
    await expect(page.getByText('$600').first()).toBeVisible();

    // ── Act ───────────────────────────────────────────────────────────────────

    // Fill all required fields
    await page.getByRole('textbox', { name: 'Full Name*' }).fill('Aesha Patel');
    await page.getByRole('textbox', { name: 'Email*' }).fill(userEmail);
    await page.getByRole('textbox', { name: 'Phone Number*' }).fill('9876543210');

    // Submit the booking
    await page.getByRole('button', { name: 'Confirm Booking' }).click();

    // ── Assert ────────────────────────────────────────────────────────────────

    // Confirmation panel replaces the form in-place (URL stays on /events/3)
    await expect(
      page.getByRole('heading', { name: 'Booking Confirmed! 🎉' })
    ).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Your tickets are reserved.')).toBeVisible();

    // Booking summary shows correct customer, quantity and total
    await expect(page.getByText('Aesha Patel')).toBeVisible();
    await expect(page.getByText('2', { exact: true })).toBeVisible();
    await expect(page.getByText('$600')).toBeVisible();

    // Post-booking navigation buttons are both accessible
    await expect(page.getByRole('button', { name: 'View My Bookings' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Browse More Events' })).toBeVisible();
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Section 2 — Edge-Case Validation Tests
// Three rules tested:
//   Rule 1 — All required fields empty   → all three errors shown at once
//   Rule 2 — Invalid email format        → only email error shown
//   Rule 3 — Phone fewer than 10 digits  → only phone error shown
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Booking Form — Form Validation', () => {

  test.describe.configure({ mode: 'serial' });

  test.beforeAll(async ({ request }) => {
    // User is already registered from the E2E suite; re-register is harmless
    await request.post(`${API_BASE}/api/auth/register`, {
      data: { email: userEmail, password: userPassword },
    }).catch(() => { /* user already exists — continue */ });
  });

  test.beforeEach(async ({ page }) => {
    // Log in and land on the event booking page before each validation test
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByLabel('Email').fill(userEmail);
    await page.getByLabel('Password').fill(userPassword);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(
      page.getByRole('heading', { name: 'Discover & Book Amazing Events' })
    ).toBeVisible({ timeout: 10000 });
    await page.goto(EVENT_PATH, { waitUntil: 'domcontentloaded' });
  });

  // ── Validation Rule 1: all required fields empty ──────────────────────────
  test('should show all three validation errors when form is submitted empty', async ({ page }) => {
    // Arrange — form is empty on fresh page load

    // Act
    await page.getByRole('button', { name: 'Confirm Booking' }).click();

    // Assert — every required field error must appear simultaneously
    await expect(page.getByText('Name must be at least 2 chars')).toBeVisible();
    await expect(page.getByText('Enter a valid email')).toBeVisible();
    await expect(page.getByText('Enter a valid 10-digit phone')).toBeVisible();
  });

  // ── Validation Rule 2: malformed email ───────────────────────────────────
  test('should show only email error when email format is invalid', async ({ page }) => {
    // Arrange — valid name and phone; email intentionally malformed
    await page.getByRole('textbox', { name: 'Full Name*' }).fill('Aesha Patel');
    await page.getByRole('textbox', { name: 'Phone Number*' }).fill('9876543210');

    // Act
    await page.getByRole('textbox', { name: 'Email*' }).fill('invalid-email@');
    await page.getByRole('button', { name: 'Confirm Booking' }).click();

    // Assert — only the email error shown; name and phone errors must be absent
    await expect(page.getByText('Enter a valid email')).toBeVisible();
    await expect(page.getByText('Name must be at least 2 chars')).not.toBeVisible();
    await expect(page.getByText('Enter a valid 10-digit phone')).not.toBeVisible();
  });

  // ── Validation Rule 3: phone number shorter than 10 digits ───────────────
  test('should show only phone error when phone number has fewer than 10 digits', async ({ page }) => {
    // Arrange — valid name and email; phone intentionally too short (5 digits)
    await page.getByRole('textbox', { name: 'Full Name*' }).fill('Aesha Patel');
    await page.getByRole('textbox', { name: 'Email*' }).fill(userEmail);

    // Act
    await page.getByRole('textbox', { name: 'Phone Number*' }).fill('12345');
    await page.getByRole('button', { name: 'Confirm Booking' }).click();

    // Assert — only the phone error shown; name and email errors must be absent
    await expect(page.getByText('Enter a valid 10-digit phone')).toBeVisible();
    await expect(page.getByText('Name must be at least 2 chars')).not.toBeVisible();
    await expect(page.getByText('Enter a valid email')).not.toBeVisible();
  });

});
