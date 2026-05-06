/* AI-GENERATED — Review required | Engineer: | Date: 2026-05-05 */
import { test, expect } from '@playwright/test';
import { AdminEventsPage } from '../../pages/AdminEventsPage';
import testData from './events_test_data.json';

const adminEmail    = `admin_day5_${Date.now()}@example.com`;
const adminPassword = 'Password123!';

// ─────────────────────────────────────────────────────────────────────────────
// Suite 1 — Add New Event (positive scenarios)
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Events Page — Add New Event', () => {

  test.describe.configure({ mode: 'serial' });

  test.beforeAll(async ({ request }) => {
    // Register the admin user once before all tests in this suite
    await request.post('https://api.eventhub.rahulshettyacademy.com/api/auth/register', {
      data: { email: adminEmail, password: adminPassword },
    });
  });

  test.beforeEach(async ({ page }) => {
    // Navigate to Manage Events before every test
    const adminPage = new AdminEventsPage(page);
    await adminPage.navigateAsAdmin(adminEmail, adminPassword);
  });

  test('should add event to table when only required fields are filled', async ({ page }) => {
    // Arrange
    const adminPage = new AdminEventsPage(page);
    const title     = `${testData.requiredFieldsOnly.title} ${Date.now()}`;

    // Act
    await adminPage.fillForm({ ...testData.requiredFieldsOnly, title });
    await adminPage.submitForm();

    // Assert
    await adminPage.assertEventInTable(title);
  });

  test('should add event to table when all fields including optional are filled', async ({ page }) => {
    // Arrange
    const adminPage = new AdminEventsPage(page);
    const title     = `${testData.allFieldsIncluded.title} ${Date.now()}`;

    // Act
    await adminPage.fillForm({ ...testData.allFieldsIncluded, title });
    await adminPage.submitForm();

    // Assert
    await adminPage.assertEventInTable(title);
  });

  test('should show correct category in events table when Workshop is selected', async ({ page }) => {
    // Arrange
    const adminPage = new AdminEventsPage(page);
    const title     = `${testData.workshopCategory.title} ${Date.now()}`;

    // Act
    await adminPage.fillForm({ ...testData.workshopCategory, title });
    await adminPage.submitForm();

    // Assert — title row exists and category cell shows "Workshop"
    await adminPage.assertCategoryInRow(title, testData.workshopCategory.category);
  });

  test('should display newly added event in the All Events list on the home page', async ({ page }) => {
    // Arrange
    const adminPage = new AdminEventsPage(page);
    const title     = `${testData.allEventsListVerification.title} ${Date.now()}`;

    await adminPage.fillForm({ ...testData.allEventsListVerification, title });
    await adminPage.submitForm();
    await adminPage.assertEventInTable(title);

    // Act — navigate to the public home page (All Events list)
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Assert — event is visible to end-users on the home page
    await expect(page.getByText(title)).toBeVisible({ timeout: 15000 });
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 2 — Form Validation (3 validation rules)
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Events Page — Form Validation', () => {

  test.describe.configure({ mode: 'serial' });

  test.beforeAll(async ({ request }) => {
    await request.post('https://api.eventhub.rahulshettyacademy.com/api/auth/register', {
      data: { email: adminEmail, password: adminPassword },
    });
  });

  test.beforeEach(async ({ page }) => {
    const adminPage = new AdminEventsPage(page);
    await adminPage.navigateAsAdmin(adminEmail, adminPassword);
  });

  // Validation Rule 1 — All required fields are empty
  test('should show all required field errors when form is submitted empty', async ({ page }) => {
    // Arrange — form is empty on page load
    const adminPage = new AdminEventsPage(page);

    // Act
    await adminPage.submitForm();

    // Assert — every required field error must be visible simultaneously
    await adminPage.assertAllRequiredFieldErrors();
  });

  // Validation Rule 2 — Title field is the only field left blank
  test('should show only title error when all fields except title are filled', async ({ page }) => {
    // Arrange
    const adminPage = new AdminEventsPage(page);

    // Act — fill every required field except title, then submit
    await adminPage.fillForm(testData.missingTitle);
    await adminPage.submitForm();

    // Assert — title error shown; city and venue errors must NOT appear
    await adminPage.assertOnlyTitleError();
  });

  // Validation Rule 3 — Seats field is set to 0 (below minimum of 1)
  test('should show seats validation error when seats is set to zero', async ({ page }) => {
    // Arrange
    const adminPage = new AdminEventsPage(page);
    const title     = `${testData.zeroSeats.title} ${Date.now()}`;

    // Act — fill all fields with seats = 0, then submit
    await adminPage.fillForm({ ...testData.zeroSeats, title });
    await adminPage.submitForm();

    // Assert — seats error visible; form must not have been submitted
    await expect(page.getByText(testData.validationMessages.seatsInvalid)).toBeVisible();
    await expect(page.getByRole('cell', { name: title, exact: true })).not.toBeVisible();
  });

});
