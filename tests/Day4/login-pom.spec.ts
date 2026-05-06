/* AI-GENERATED — Review required | Engineer: | Date: 2026-04-30 */
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

const validEmail    = `pom_user_${Date.now()}@example.com`;
const validPassword = 'Password123!';

test.describe('Login Page — POM Tests', () => {

  test.describe.configure({ mode: 'serial' });

  // Register the test user once via API before UI tests run
  test.beforeAll(async ({ request }) => {
    await request.post('https://api.eventhub.rahulshettyacademy.com/api/auth/register', {
      data: { email: validEmail, password: validPassword },
    });
  });

  test('should redirect to home when credentials are valid', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.navigate();
    await loginPage.login(validEmail, validPassword);
    await loginPage.assertLoginSuccess();
  });

  test('should show Logout button after successful login', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.navigate();
    await loginPage.login(validEmail, validPassword);
    await loginPage.assertLogoutVisible();
  });

  test('should show error when credentials are invalid', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.navigate();
    await loginPage.login('nobody@example.com', 'WrongPass!');
    await loginPage.assertInvalidCredentialsError();
  });

  test('should stay on login page when form is submitted empty', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.navigate();
    await loginPage.clickSignIn();
    await loginPage.assertStillOnLoginPage();
  });

});
