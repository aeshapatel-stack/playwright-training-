/* AI-GENERATED — Review required | Engineer: | Date: 2026-04-30 */
import { test, expect } from '@playwright/test';
import { loadTestCases, type TestCase } from './excel-reader';

const allCases  = loadTestCases();
const uiCases   = allCases.filter(tc => tc.TestType === 'UI');
const apiCases  = allCases.filter(tc => tc.TestType === 'API');
const e2eCases  = allCases.filter(tc => tc.TestType === 'E2E');

// Shared admin credentials for Admin Event Creation tests
const adminEmail    = `excel_admin_${Date.now()}@example.com`;
const adminPassword = 'Password123!';

// ── UI Tests ──────────────────────────────────────────────────────────────────
test.describe('Excel-Driven: UI Tests', () => {

  test.describe.configure({ mode: 'serial' });

  test.beforeAll(async ({ request }) => {
    // Register admin account used by Admin Event Creation cases
    await request.post('https://api.eventhub.rahulshettyacademy.com/api/auth/register', {
      data: { email: adminEmail, password: adminPassword },
    });
    // Pre-register emails referenced in the Excel so they exist when tests run
    // (Ignored if already registered — error response is intentionally not checked)
    await request.post('https://api.eventhub.rahulshettyacademy.com/api/auth/register', {
      data: { email: 'existing@example.com', password: 'Password123!' },
    });
    await request.post('https://api.eventhub.rahulshettyacademy.com/api/auth/register', {
      data: { email: 'valid@example.com', password: 'Password123!' },
    });
  });

  for (const tc of uiCases) {
    test(`[${tc.TestID}] ${tc.TestName}`, async ({ page }) => {
      const input = tc.InputData;

      // For TC-001 registration success — use a unique email to avoid conflicts from re-runs
      const emailToUse = (tc.Module === 'Registration' && tc.ExpectedResult.includes('Logout'))
        ? input.email.replace('@', `_${Date.now()}@`)
        : input.email;

      // ── Arrange + Act ─────────────────────────────────────────────────────
      if (tc.Module === 'Registration') {

        await page.goto('/register', { waitUntil: 'domcontentloaded' });

        if (emailToUse)           await page.getByPlaceholder('you@email.com').fill(emailToUse);
        if (input.password)       await page.getByPlaceholder('Min 8 chars, uppercase, number & symbol').fill(input.password);
        if (input.confirmPassword) await page.getByPlaceholder('Repeat your password').fill(input.confirmPassword);

        await page.getByRole('button', { name: 'Create Account' }).click();

      } else if (tc.Module === 'Login') {

        await page.goto('/login', { waitUntil: 'domcontentloaded' });

        if (input.email)    await page.getByLabel('Email').fill(input.email);
        if (input.password) await page.getByLabel('Password').fill(input.password);

        await page.getByRole('button', { name: 'Sign In' }).click();

      } else if (tc.Module === 'Admin Event Creation') {

        // Login as admin
        await page.goto('/login', { waitUntil: 'domcontentloaded' });
        await page.getByLabel('Email').fill(adminEmail);
        await page.getByLabel('Password').fill(adminPassword);
        await page.getByRole('button', { name: 'Sign In' }).click();

        // Navigate to admin events
        await page.getByRole('button', { name: 'Admin' }).click();
        await page.getByRole('navigation').getByRole('link', { name: 'Manage Events' }).click();
        await expect(page.getByRole('heading', { name: '+ New Event' })).toBeVisible();

        // Fill form from InputData
        if (input.title)              await page.getByRole('textbox', { name: 'Title*' }).fill(input.title);
        if (input.category)           await page.getByRole('combobox', { name: 'Category*' }).selectOption(input.category);
        if (input.city)               await page.getByRole('textbox', { name: 'City*' }).fill(input.city);
        if (input.venue)              await page.getByRole('textbox', { name: 'Venue*' }).fill(input.venue);
        if (input.date)               await page.getByRole('textbox', { name: 'Event Date & Time*' }).fill(input.date);
        if (input.price  !== undefined) await page.getByRole('spinbutton', { name: 'Price ($)*' }).fill(String(input.price));
        if (input.seats  !== undefined) await page.getByRole('spinbutton', { name: 'Total Seats*' }).fill(String(input.seats));
        if (input.description)        await page.getByRole('textbox', { name: /describe the event/i }).fill(input.description);
        if (input.imageUrl)           await page.getByRole('textbox', { name: 'Image URL (optional)' }).fill(input.imageUrl);

        await page.getByRole('button', { name: '+ Add Event' }).click();
      }

      // ── Assert ────────────────────────────────────────────────────────────
      const result = tc.ExpectedResult;

      if (result.includes('Logout button')) {
        await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible({ timeout: 15000 });

      } else if (result.includes('Discover & Book Amazing Events')) {
        await expect(page.getByRole('heading', { name: 'Discover & Book Amazing Events' })).toBeVisible({ timeout: 15000 });

      } else if (result.includes('Password does not meet')) {
        await expect(page.getByText('Password does not meet the requirements below')).toBeVisible();

      } else if (result.includes('Passwords do not match')) {
        await expect(page.getByText('Passwords do not match')).toBeVisible();

      } else if (result.includes('Invalid email or password')) {
        await expect(page.getByText('Invalid email or password')).toBeVisible({ timeout: 10000 });

      } else if (result.includes('Sign In button')) {
        await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();

      } else if (result.includes('already registered')) {
        // Toast disappears quickly — assert the failure outcome instead:
        // user stays on /register and is NOT logged in
        await expect(page).toHaveURL(/register/);
        await expect(page.getByRole('button', { name: 'Logout' })).not.toBeVisible();

      } else if (result.includes('All Events table') && input.title) {
        await expect(page.getByRole('cell', { name: input.title, exact: true })).toBeVisible();

      } else if (result.includes('Workshop in the Category')) {
        const row = page.getByRole('row', { name: new RegExp(input.title) });
        await expect(row.getByRole('cell', { name: 'Workshop', exact: true })).toBeVisible();

      } else if (result.includes('six') || result.includes('All six')) {
        await expect(page.getByText('Title is required')).toBeVisible();
        await expect(page.getByText('City is required')).toBeVisible();
        await expect(page.getByText('Venue is required')).toBeVisible();
        await expect(page.getByText('Event date is required')).toBeVisible();
        await expect(page.getByText('Enter a valid price (≥ 0)')).toBeVisible();
        await expect(page.getByText('Must have at least 1 seat')).toBeVisible();

      } else if (result.includes('"Title is required" visible')) {
        await expect(page.getByText('Title is required')).toBeVisible();
        await expect(page.getByText('City is required')).not.toBeVisible();
        await expect(page.getByText('Venue is required')).not.toBeVisible();
      }
    });
  }
});

// ── API Tests ─────────────────────────────────────────────────────────────────
test.describe('Excel-Driven: API Tests', () => {

  for (const tc of apiCases) {
    test(`[${tc.TestID}] ${tc.TestName}`, async ({ request }) => {
      const input    = tc.InputData;
      const endpoint = String(input.endpoint || '');

      // ── Arrange + Act + Assert ────────────────────────────────────────────
      if (endpoint.includes('POST /api/auth/register')) {

        // Arrange — use a unique email so registration always works
        const uniqueEmail = `${tc.TestID}_${Date.now()}@example.com`;

        // Act
        const resp = await request.post(
          'https://api.eventhub.rahulshettyacademy.com/api/auth/register',
          { data: { email: uniqueEmail, password: input.password } }
        );

        // Assert
        expect(resp.ok()).toBe(true);
        const body = await resp.json();
        expect(typeof body.token).toBe('string');
        expect(typeof body.user.id).toBe('number');

      } else if (endpoint.includes('POST /api/auth/login') && input.email !== 'nobody@example.com') {

        // Arrange — register a fresh user so login credentials are guaranteed valid
        const freshEmail    = `${tc.TestID}_${Date.now()}@example.com`;
        const freshPassword = 'Password123!';
        await request.post(
          'https://api.eventhub.rahulshettyacademy.com/api/auth/register',
          { data: { email: freshEmail, password: freshPassword } }
        );

        // Act
        const resp = await request.post(
          'https://api.eventhub.rahulshettyacademy.com/api/auth/login',
          { data: { email: freshEmail, password: freshPassword } }
        );

        // Assert
        expect(resp.status()).toBe(200);
        const body = await resp.json();
        expect(typeof body.token).toBe('string');

      } else if (endpoint.includes('POST /api/auth/login') && input.email === 'nobody@example.com') {

        // Act
        const resp = await request.post(
          'https://api.eventhub.rahulshettyacademy.com/api/auth/login',
          { data: { email: input.email, password: input.password } }
        );

        // Assert — API returns 400 for invalid credentials
        expect(resp.status()).toBe(400);

      } else if (endpoint.includes('GET /api/events') && input.token === '') {

        // Act — no Authorization header
        const resp = await request.get('https://api.eventhub.rahulshettyacademy.com/api/events');

        // Assert
        expect(resp.status()).toBe(401);

      } else if (endpoint.includes('GET /api/events')) {

        // Arrange — get a fresh token
        const regEmail = `${tc.TestID}_${Date.now()}@example.com`;
        const regResp  = await request.post(
          'https://api.eventhub.rahulshettyacademy.com/api/auth/register',
          { data: { email: regEmail, password: 'Password123!' } }
        );
        const { token } = await regResp.json();

        // Act
        const resp = await request.get(
          'https://api.eventhub.rahulshettyacademy.com/api/events',
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Assert
        expect(resp.status()).toBe(200);
        const body = await resp.json();
        const list = body.data ?? body;
        expect(Array.isArray(list)).toBe(true);
        expect(list.length).toBeGreaterThan(0);
      }
    });
  }
});

// ── E2E Tests ─────────────────────────────────────────────────────────────────
test.describe('Excel-Driven: E2E Tests', () => {

  for (const tc of e2eCases) {
    test(`[${tc.TestID}] ${tc.TestName}`, async ({ page, request }) => {
      const e2eEmail    = `${tc.TestID}_${Date.now()}@example.com`;
      const e2ePassword = 'Password123!';

      // Arrange — register fresh user via API
      await request.post(
        'https://api.eventhub.rahulshettyacademy.com/api/auth/register',
        { data: { email: e2eEmail, password: e2ePassword } }
      );

      // Act — login
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.getByLabel('Email').fill(e2eEmail);
      await page.getByLabel('Password').fill(e2ePassword);
      await page.getByRole('button', { name: 'Sign In' }).click();
      await expect(page.getByRole('heading', { name: 'Discover & Book Amazing Events' })).toBeVisible();

      if (tc.Module === 'Bookings') {
        // Navigate to events and book the first available event
        await page.goto('/events', { waitUntil: 'domcontentloaded' });
        await page.getByRole('link', { name: 'Book Now' }).first().click();

        // Fill booking form
        await page.getByRole('textbox', { name: 'Full Name*' }).fill('QA Test User');
        await page.getByRole('textbox', { name: 'Email*' }).fill(e2eEmail);
        await page.getByRole('textbox', { name: 'Phone Number*' }).fill('+91 9876543210');

        // Act — confirm booking
        await page.getByRole('button', { name: 'Confirm Booking' }).click();

        // Assert — app shows inline confirmation on the same page
        await expect(page.getByRole('heading', { name: /Booking Confirmed/i })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole('link', { name: 'View My Bookings' })).toBeVisible();
      }
    });
  }
});
