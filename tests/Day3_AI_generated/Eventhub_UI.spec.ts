/* AI-GENERATED — Review required | Engineer: | Date: 2026-04-29 */
import { test, expect } from '../../fixtures/ui-fixtures';

test.describe('User Authentication Flows', () => {

  const uniqueEmail = `qa_test_${Date.now()}@example.com`;
  const validPassword = 'Password123!';

  test.describe('Registration Feature', () => {

    test.beforeEach(async ({ appPage }) => {
      await appPage.goto('/register', { waitUntil: 'domcontentloaded' }).catch(async () => {
        await appPage.goto('/register', { waitUntil: 'domcontentloaded' });
      });
    });

    test('should register a new user when all fields are valid', async ({ appPage }) => {
      // Arrange
      const emailField = appPage.getByPlaceholder('you@email.com');
      const passwordField = appPage.getByPlaceholder('Min 8 chars, uppercase, number & symbol');
      const confirmField = appPage.getByPlaceholder('Repeat your password');

      // Act
      await emailField.fill(uniqueEmail);
      await passwordField.fill(validPassword);
      await confirmField.fill(validPassword);
      await appPage.getByRole('button', { name: 'Create Account' }).click();

      // Assert
      await expect(appPage.getByRole('button', { name: 'Logout' })).toBeVisible({ timeout: 15000 });
    });

    test('should show password error when password does not meet requirements', async ({ appPage }) => {
      // Arrange
      const emailField = appPage.getByPlaceholder('you@email.com');
      const passwordField = appPage.getByPlaceholder('Min 8 chars, uppercase, number & symbol');

      // Act
      await emailField.fill('test@example.com');
      await passwordField.fill('123');
      await appPage.getByRole('button', { name: 'Create Account' }).click();

      // Assert
      await expect(appPage.getByText('Password does not meet the requirements below')).toBeVisible();
    });

    test('should show mismatch error when confirm password does not match', async ({ appPage }) => {
      // Arrange
      const emailField = appPage.getByPlaceholder('you@email.com');
      const passwordField = appPage.getByPlaceholder('Min 8 chars, uppercase, number & symbol');
      const confirmField = appPage.getByPlaceholder('Repeat your password');

      // Act
      await emailField.fill(uniqueEmail);
      await passwordField.fill(validPassword);
      await confirmField.fill('WrongPassword123!');
      await appPage.getByRole('button', { name: 'Create Account' }).click();

      // Assert
      await expect(appPage.getByText('Passwords do not match')).toBeVisible();
    });

  });

  test.describe('Login Feature', () => {

    const loginEmail = `login_test_${Date.now()}@example.com`;
    const loginPassword = 'Password123!';

    test.beforeAll(async ({ request }) => {
      await request.post('https://api.eventhub.rahulshettyacademy.com/api/auth/register', {
        data: { email: loginEmail, password: loginPassword },
      });
    });

    test.beforeEach(async ({ appPage }) => {
      await appPage.goto('/login', { waitUntil: 'domcontentloaded' }).catch(async () => {
        await appPage.goto('/login', { waitUntil: 'domcontentloaded' });
      });
    });

    test('should redirect to home when credentials are valid', async ({ appPage }) => {
      // Arrange
      const emailField = appPage.getByLabel('Email');
      const passwordField = appPage.getByLabel('Password');

      // Act
      await emailField.fill(loginEmail);
      await passwordField.fill(loginPassword);
      await appPage.getByRole('button', { name: 'Sign In' }).click();

      // Assert
      await expect(
        appPage.getByRole('heading', { name: 'Discover & Book Amazing Events' })
      ).toBeVisible({ timeout: 15000 });
    });

    test('should show error message when credentials are invalid', async ({ appPage }) => {
      // Arrange
      const emailField = appPage.getByLabel('Email');
      const passwordField = appPage.getByLabel('Password');

      // Act
      await emailField.fill('notregistered@example.com');
      await passwordField.fill('WrongPassword123!');
      await appPage.getByRole('button', { name: 'Sign In' }).click();

      // Assert
      await expect(appPage.getByText('Invalid email or password')).toBeVisible({ timeout: 10000 });
    });

  });

});
