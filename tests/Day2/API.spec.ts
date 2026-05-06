import { test, expect } from '@playwright/test';
import { z } from 'zod';

/**
 * User schema (nested inside auth response)
 */
const AuthResponseSchema = z.object({
  status: z.literal('success'),
  data: z.object({
    access_token: z.string(),
    token_type: z.string(),
    user: z.object({
      id: z.string(),
      email: z.string().email(),
      role: z.enum(['user', 'admin']),
    }),
  }),
  error: z.null(),
});

test.describe('Auth API Validation', () => {
  const BASE_URL = 'http://localhost:8000';

  test('should register and validate user structure', async ({ request }) => {
    const payload = {
      email: `dev_${Date.now()}@example.com`,
      password: 'Password123!',
      role: 'user',
    };

    const response = await request.post(`${BASE_URL}/auth/register`, {
      data: payload,
    });

    // Fail fast if API request failed
    expect(response.ok(), `Failed to register: ${response.status()}`).toBeTruthy();

    const responseBody = await response.json();

    // Validate full response structure
    const validation = AuthResponseSchema.safeParse(responseBody);

    if (!validation.success) {
      console.error('❌ Schema Mismatch:', validation.error.format());
    }

    expect(validation.success, 'Response JSON should match AuthResponseSchema').toBe(true);

    // Assertions on actual user data
    if (validation.success) {
      const { user } = validation.data.data;

      expect(user.email).toBe(payload.email);
      expect(user.role).toBe('user');
      expect(user.id).toBeDefined();
    }
  });
});