/* AI-GENERATED — Review required | Engineer: | Date: 2026-05-04 */
import { test, expect } from '@playwright/test';
import { AdminEventsPage } from '../../pages/AdminEventsPage';

const adminEmail    = `admin_pom_${Date.now()}@example.com`;
const adminPassword = 'Password123!';

test.describe('Admin Event Creation — POM', () => {

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

  test('should add event to table when all required fields are filled', async ({ page }) => {
    // Arrange
    const adminPage = new AdminEventsPage(page);
    const title     = `QA Summit POM ${Date.now()}`;

    // Act
    await adminPage.fillForm({ title, city: 'Bangalore', venue: 'KTPO', date: '2027-06-15T10:00', price: 299, seats: 50 });
    await adminPage.submitForm();

    // Assert
    await adminPage.assertEventInTable(title);
  });

  test('should add event when optional description and image are provided', async ({ page }) => {
    // Arrange
    const adminPage = new AdminEventsPage(page);
    const title     = `DevOps POM ${Date.now()}`;

    // Act
    await adminPage.fillForm({
      title, city: 'Pune', venue: 'Symbiosis', date: '2027-08-20T09:00',
      price: 199, seats: 30, description: 'Hands-on workshop', imageUrl: 'https://example.com/devops.jpg',
    });
    await adminPage.submitForm();

    // Assert
    await adminPage.assertEventInTable(title);
  });

  test('should show all required field errors when form is submitted empty', async ({ page }) => {
    // Arrange
    const adminPage = new AdminEventsPage(page);

    // Act
    await adminPage.submitForm();

    // Assert
    await adminPage.assertAllRequiredFieldErrors();
  });

  test('should show only title error when title field is left blank', async ({ page }) => {
    // Arrange
    const adminPage = new AdminEventsPage(page);

    // Act
    await adminPage.fillForm({ city: 'Chennai', venue: 'Trade Centre', date: '2027-09-10T11:00', price: 100, seats: 20 });
    await adminPage.submitForm();

    // Assert
    await adminPage.assertOnlyTitleError();
  });

  test('should show Workshop in category column when Workshop is selected', async ({ page }) => {
    // Arrange
    const adminPage = new AdminEventsPage(page);
    const title     = `Docker POM ${Date.now()}`;

    // Act
    await adminPage.fillForm({ title, category: 'Workshop', city: 'Hyderabad', venue: 'HITEC Expo', date: '2027-10-05T14:00', price: 149, seats: 40 });
    await adminPage.submitForm();

    // Assert
    await adminPage.assertCategoryInRow(title, 'Workshop');
  });

});
