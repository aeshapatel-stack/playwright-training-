// Ensure the path correctly points to where your fixture file lives
import { test, expect } from '../../fixtures/api-fixtures';

test('Verify login via fixture', async ({ loginApi }) => {
  console.log("Token received:", loginApi.token);
  expect(loginApi.token).toBeDefined();
});

test('Verify user can access dashboard with fixture token', async ({ loginApi }) => {
  // The login has already happened automatically!
  console.log(`Using Token from Fixture: ${loginApi.token}`);
  
  // Example: Validate the fixture data
  expect(loginApi.token).toBeDefined();
  expect(typeof loginApi.userId).toBe('number');
  expect(loginApi.userId).toBeGreaterThan(0);
});

test('Another test using the same login fixture', async ({ loginApi, request }) => {
  // You can use the token to make another authorized API call here
  const response = await request.get('/api/auth/user-profile', {
    headers: {
      'Authorization': `Bearer ${loginApi.token}`
    }
  });
  
  // (Assuming a profile endpoint exists)
  // expect(response.status()).toBe(200);
});