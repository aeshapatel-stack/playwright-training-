/* AI-GENERATED — Review required | Engineer: | Date: 2026-05-04 */
import { test } from '../../fixtures/ui-fixtures';
import { RegisterPage } from '../../pages/RegisterPage';
import { LoginPage }    from '../../pages/LoginPage';
import { HomePage }     from '../../pages/HomePage';

test.describe('User Authentication Flows — POM', () => {

  test.describe('Registration Feature', () => {

    test.beforeEach(async ({ appPage }) => {
      await new RegisterPage(appPage).navigate();
    });

    test('should register a new user when all fields are valid', async ({ appPage }) => {
      // Arrange
      const registerPage = new RegisterPage(appPage);
      const uniqueEmail  = `qa_pom_${Date.now()}@example.com`;

      // Act
      await registerPage.register(uniqueEmail, 'Password123!', 'Password123!');

      // Assert
      await registerPage.assertRegistrationSuccess();
    });

    test('should show password error when password does not meet requirements', async ({ appPage }) => {
      // Arrange
      const registerPage = new RegisterPage(appPage);

      // Act
      await registerPage.register('test_pom@example.com', '123');

      // Assert
      await registerPage.assertPasswordRequirementsError();
    });

    test('should show mismatch error when confirm password does not match', async ({ appPage }) => {
      // Arrange
      const registerPage = new RegisterPage(appPage);
      const email        = `qa_mismatch_${Date.now()}@example.com`;

      // Act
      await registerPage.register(email, 'Password123!', 'WrongPassword123!');

      // Assert
      await registerPage.assertPasswordMismatchError();
    });

  });

  test.describe('Login Feature', () => {

    const loginEmail    = `login_pom_${Date.now()}@example.com`;
    const loginPassword = 'Password123!';

    test.beforeAll(async ({ request }) => {
      await request.post('https://api.eventhub.rahulshettyacademy.com/api/auth/register', {
        data: { email: loginEmail, password: loginPassword },
      });
    });

    test.beforeEach(async ({ appPage }) => {
      await new LoginPage(appPage).navigate();
    });

    test('should redirect to home when credentials are valid', async ({ appPage }) => {
      // Arrange
      const loginPage = new LoginPage(appPage);
      const homePage  = new HomePage(appPage);

      // Act
      await loginPage.login(loginEmail, loginPassword);

      // Assert
      await homePage.assertHeadingVisible();
    });

    test('should show Logout button after successful login', async ({ appPage }) => {
      // Arrange
      const loginPage = new LoginPage(appPage);
      const homePage  = new HomePage(appPage);

      // Act
      await loginPage.login(loginEmail, loginPassword);

      // Assert
      await homePage.assertLogoutVisible();
    });

    test('should show error message when credentials are invalid', async ({ appPage }) => {
      // Arrange
      const loginPage = new LoginPage(appPage);

      // Act
      await loginPage.login('notregistered@example.com', 'WrongPassword123!');

      // Assert
      await loginPage.assertInvalidCredentialsError();
    });

    test('should stay on login page when form is submitted empty', async ({ appPage }) => {
      // Arrange
      const loginPage = new LoginPage(appPage);

      // Act
      await loginPage.clickSignIn();

      // Assert
      await loginPage.assertStillOnLoginPage();
    });

  });

});
