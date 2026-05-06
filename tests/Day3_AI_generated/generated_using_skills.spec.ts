/* AI-GENERATED — Review required | Engineer: | Date: 2026-04-29 */
import { test, expect } from '@playwright/test';

const adminEmail = `admin_${Date.now()}@example.com`;
const adminPassword = 'Password123!';

test.describe('Admin Event Creation', () => {

  test.describe.configure({ mode: 'serial' });

  test.beforeAll(async ({ request }) => {
    await request.post('https://api.eventhub.rahulshettyacademy.com/api/auth/register', {
      data: { email: adminEmail, password: adminPassword },
    });
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.getByLabel('Email').fill(adminEmail);
    await page.getByLabel('Password').fill(adminPassword);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.getByRole('button', { name: 'Admin' }).click();
    await page.getByRole('navigation').getByRole('link', { name: 'Manage Events' }).click();
    await expect(page.getByRole('heading', { name: '+ New Event' })).toBeVisible();
  });

  test('should add event to table when all required fields are filled', async ({ page }) => {
    const title = `QA Automation Summit ${Date.now()}`;

    // Arrange
    await page.getByRole('textbox', { name: 'Title*' }).fill(title);
    await page.getByRole('textbox', { name: 'City*' }).fill('Bangalore');
    await page.getByRole('textbox', { name: 'Venue*' }).fill('KTPO Convention Centre');
    await page.getByRole('textbox', { name: 'Event Date & Time*' }).fill('2027-06-15T10:00');
    await page.getByRole('spinbutton', { name: 'Price ($)*' }).fill('299');
    await page.getByRole('spinbutton', { name: 'Total Seats*' }).fill('50');

    // Act
    await page.getByRole('button', { name: '+ Add Event' }).click();

    // Assert
    await expect(page.getByRole('cell', { name: title, exact: true })).toBeVisible();
  });

  test('should add event to table when optional description and image url are provided', async ({ page }) => {
    const title = `DevOps Workshop ${Date.now()}`;

    // Arrange
    await page.getByRole('textbox', { name: 'Title*' }).fill(title);
    await page.getByRole('textbox', { name: /describe the event/i }).fill('A hands-on DevOps workshop for QA engineers.');
    await page.getByRole('textbox', { name: 'City*' }).fill('Pune');
    await page.getByRole('textbox', { name: 'Venue*' }).fill('Symbiosis Tech Park');
    await page.getByRole('textbox', { name: 'Event Date & Time*' }).fill('2027-08-20T09:00');
    await page.getByRole('spinbutton', { name: 'Price ($)*' }).fill('199');
    await page.getByRole('spinbutton', { name: 'Total Seats*' }).fill('30');
    await page.getByRole('textbox', { name: 'Image URL (optional)' }).fill('https://example.com/devops.jpg');

    // Act
    await page.getByRole('button', { name: '+ Add Event' }).click();

    // Assert
    await expect(page.getByRole('cell', { name: title, exact: true })).toBeVisible();
  });

  test('should show all required field errors when form is submitted empty', async ({ page }) => {
    // Arrange — form is empty on page load

    // Act
    await page.getByRole('button', { name: '+ Add Event' }).click();

    // Assert
    await expect(page.getByText('Title is required')).toBeVisible();
    await expect(page.getByText('City is required')).toBeVisible();
    await expect(page.getByText('Venue is required')).toBeVisible();
    await expect(page.getByText('Event date is required')).toBeVisible();
    await expect(page.getByText('Enter a valid price (≥ 0)')).toBeVisible();
    await expect(page.getByText('Must have at least 1 seat')).toBeVisible();
  });

  test('should show title required error when only title field is left blank', async ({ page }) => {
    // Arrange
    await page.getByRole('textbox', { name: 'City*' }).fill('Chennai');
    await page.getByRole('textbox', { name: 'Venue*' }).fill('Chennai Trade Centre');
    await page.getByRole('textbox', { name: 'Event Date & Time*' }).fill('2027-09-10T11:00');
    await page.getByRole('spinbutton', { name: 'Price ($)*' }).fill('100');
    await page.getByRole('spinbutton', { name: 'Total Seats*' }).fill('20');

    // Act
    await page.getByRole('button', { name: '+ Add Event' }).click();

    // Assert
    await expect(page.getByText('Title is required')).toBeVisible();
    await expect(page.getByText('City is required')).not.toBeVisible();
    await expect(page.getByText('Venue is required')).not.toBeVisible();
  });

  test('should create event with correct category when Workshop is selected', async ({ page }) => {
    const title = `Docker Workshop ${Date.now()}`;

    // Arrange
    await page.getByRole('textbox', { name: 'Title*' }).fill(title);
    await page.getByRole('combobox', { name: 'Category*' }).selectOption('Workshop');
    await page.getByRole('textbox', { name: 'City*' }).fill('Hyderabad');
    await page.getByRole('textbox', { name: 'Venue*' }).fill('HITEC City Expo');
    await page.getByRole('textbox', { name: 'Event Date & Time*' }).fill('2027-10-05T14:00');
    await page.getByRole('spinbutton', { name: 'Price ($)*' }).fill('149');
    await page.getByRole('spinbutton', { name: 'Total Seats*' }).fill('40');

    // Act
    await page.getByRole('button', { name: '+ Add Event' }).click();

    // Assert
    const eventRow = page.getByRole('row', { name: new RegExp(title) });
    await expect(eventRow).toBeVisible();
    await expect(eventRow.getByRole('cell', { name: 'Workshop', exact: true })).toBeVisible();
  });

});
