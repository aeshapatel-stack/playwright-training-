/* AI-GENERATED — Review required | Engineer: | Date: 2026-04-30 */
import { test, expect } from '@playwright/test';
import { z } from 'zod';

const BASE_URL = 'https://api.eventhub.rahulshettyacademy.com/api';

// ── Zod Schemas ───────────────────────────────────────────────────────────────

const EventSchema = z.object({
  id:             z.number(),
  title:          z.string(),
  city:           z.string(),
  venue:          z.string(),
  price:          z.coerce.number(), // API returns price as string e.g. "300"
  totalSeats:     z.number(),
  availableSeats: z.number(),
  category:       z.string(),
  eventDate:      z.string(),
});

const EventsListSchema = z.object({
  data: z.array(EventSchema),
});

// ── Tests ─────────────────────────────────────────────────────────────────────

test.describe('Events API — GET /api/events', () => {

  let token: string;

  test.beforeAll(async ({ request }) => {
    // Arrange — register a fresh user and capture the token
    const resp = await request.post(`${BASE_URL}/auth/register`, {
      data: {
        email:    `events_api_${Date.now()}@example.com`,
        password: 'Password123!',
      },
    });
    const body = await resp.json();
    token = body.token;
  });

  test('should return 200 and a valid event list when token is provided', async ({ request }) => {
    // Act
    const resp = await request.get(`${BASE_URL}/events`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Assert — status
    expect(resp.status()).toBe(200);

    // Assert — schema
    const body = await resp.json();
    const result = EventsListSchema.safeParse(body);
    if (!result.success) {
      console.error('Schema mismatch:', result.error.format());
    }
    expect(result.success).toBe(true);

    // Assert — values
    if (result.success) {
      expect(result.data.data.length).toBeGreaterThan(0);
      const first = result.data.data[0];
      expect(first.id).toBeDefined();
      expect(first.title.length).toBeGreaterThan(0);
      expect(first.price).toBeGreaterThanOrEqual(0);
      expect(first.availableSeats).toBeGreaterThanOrEqual(0);
    }
  });

  test('should return 401 when no token is provided', async ({ request }) => {
    // Act — request without Authorization header
    const resp = await request.get(`${BASE_URL}/events`);

    // Assert
    expect(resp.status()).toBe(401);
  });

  test('should return 401 when an invalid token is provided', async ({ request }) => {
    // Act
    const resp = await request.get(`${BASE_URL}/events`, {
      headers: { Authorization: 'Bearer invalid.token.value' },
    });

    // Assert
    expect(resp.status()).toBe(401);
  });

});
