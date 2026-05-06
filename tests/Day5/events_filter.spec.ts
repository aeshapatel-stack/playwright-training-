/* AI-GENERATED — Review required | Engineer: | Date: 2026-05-05 */
import { test, expect } from '@playwright/test';
import { EventsFilterPage } from '../../pages/eventfilter';

const userEmail    = `filter_${Date.now()}@example.com`;
const userPassword = 'Password123!';
const API_BASE     = 'https://api.eventhub.rahulshettyacademy.com';

test.describe('Events Filter — Conference Category', () => {

  test.beforeAll(async ({ request }) => {
    await request.post(`${API_BASE}/api/auth/register`, {
      data: { email: userEmail, password: userPassword },
    });
  });

  test.beforeEach(async ({ page }) => {
    const eventsPage = new EventsFilterPage(page);
    await eventsPage.loginAndNavigate(userEmail, userPassword);
    await eventsPage.assertHeadingVisible();
  });

  test('should display the Upcoming Events page with category filter', async ({ page }) => {
    // Assert
    await expect(page.getByRole('heading', { name: 'Upcoming Events' })).toBeVisible();
    await expect(page.getByRole('combobox').first()).toBeVisible();
  });

  test('should filter events to show only Conference events when Conference is selected', async ({ page }) => {
    // Arrange
    const eventsPage = new EventsFilterPage(page);

    // Act
    await eventsPage.filterByCategory('🎙 Conference');

    // Assert — World Tech Summit is the permanent Conference fixture event
    await eventsPage.assertEventVisible('World Tech Summit');
  });

  test('should hide non-Conference events after applying Conference filter', async ({ page }) => {
    // Arrange
    const eventsPage = new EventsFilterPage(page);

    // Act
    await eventsPage.filterByCategory('🎙 Conference');

    // Assert — non-Conference events must not be visible
    await eventsPage.assertEventNotVisible('Dilli Diwali Mela');
    await eventsPage.assertEventNotVisible('Hollywood Monsoon Night');
  });

  test('should restore all events when filter is reset to All Categories', async ({ page }) => {
    // Arrange
    const eventsPage = new EventsFilterPage(page);

    // Act — first filter, then reset
    await eventsPage.filterByCategory('🎙 Conference');
    await eventsPage.filterByCategory('All Categories');

    // Assert — all event types should be visible again
    await eventsPage.assertEventVisible('Dilli Diwali Mela');
    await eventsPage.assertEventVisible('World Tech Summit');
  });

});
