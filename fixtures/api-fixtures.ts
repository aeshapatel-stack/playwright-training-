import { test as base } from '@playwright/test';

const API_BASE = 'https://api.eventhub.rahulshettyacademy.com/api';

// 1. Define the type for your fixture
export type MyFixtures = {
  loginApi: {
    token:    string;
    userId:   number;
    email:    string;
    password: string;
  };
};

// 2. Create the custom test object by extending base
export const test = base.extend<MyFixtures>({
  loginApi: async ({ request }, use) => {
    // Register a fresh user so the fixture always works regardless of environment
    const email    = `fixture_${Date.now()}@example.com`;
    const password = 'Password123!';

    const response = await request.post(`${API_BASE}/auth/register`, {
      data: { email, password },
    });

    const responseBody = await response.json();

    // Provide token, userId, and credentials to the test
    await use({
      token:    responseBody.token,
      userId:   responseBody.user.id,
      email,
      password,
    });
  },
});

// 3. Export expect so it is available in your tests
export { expect } from '@playwright/test';