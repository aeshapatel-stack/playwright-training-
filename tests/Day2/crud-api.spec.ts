/* AI-GENERATED — Review required | Engineer: | Date: 2026-05-04 */
import { test, expect } from '../../fixtures/api-fixtures';
import { z } from 'zod';

const BASE_URL = 'https://api.eventhub.rahulshettyacademy.com/api';

// ── Zod Schemas ───────────────────────────────────────────────────────────────

const AuthResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id:    z.number(),
    email: z.string().email(),
  }),
});

// price is returned as a string by the API (e.g. "300") — coerce to number
const EventSchema = z.object({
  id:             z.number(),
  title:          z.string(),
  category:       z.string(),
  city:           z.string(),
  venue:          z.string(),
  eventDate:      z.string(),
  price:          z.coerce.number(),
  totalSeats:     z.number(),
  availableSeats: z.number(),
});

const SingleEventResponseSchema = z.object({
  success: z.boolean(),
  data:    EventSchema,
});

const EventsListResponseSchema = z.object({
  data: z.array(EventSchema),
});

const BookingSchema = z.object({
  id:            z.number(),
  eventId:       z.number(),
  customerName:  z.string(),
  customerEmail: z.string().email(),
  customerPhone: z.string(),
  quantity:      z.number(),
  totalPrice:    z.coerce.number(),
  status:        z.enum(['confirmed', 'cancelled']),
  bookingRef:    z.string(),
});

const BookingResponseSchema = z.object({
  data: BookingSchema,
});

// ── Tests ─────────────────────────────────────────────────────────────────────

test.describe('EventHub API — Full CRUD with Schema Validation', () => {

  // ── TC-1: POST /auth/register ─────────────────────────────────────────────
  // Uses built-in request fixture — testing registration itself, loginApi not needed here
  test('TC-1 | POST /auth/register — should return 201 with token and user id', async ({ request }) => {
    // Arrange
    const email = `tc1_${Date.now()}@example.com`;

    // Act
    const resp = await request.post(`${BASE_URL}/auth/register`, {
      data: { email, password: 'Password123!' },
    });

    // Assert — status
    expect(resp.status()).toBe(201);

    // Assert — schema
    const body = await resp.json();
    const result = AuthResponseSchema.safeParse(body);
    if (!result.success) console.error('Schema mismatch:', result.error.format());
    expect(result.success).toBe(true);

    // Assert — values
    if (result.success) {
      expect(result.data.user.email).toBe(email);
      expect(result.data.token.length).toBeGreaterThan(0);
    }
  });

  // ── TC-2: POST /auth/login ────────────────────────────────────────────────
  // loginApi fixture registers a fresh user — we use its email/password to test login
  test('TC-2 | POST /auth/login — should return 200 with token when credentials are valid', async ({ request, loginApi }) => {
    // Arrange — loginApi fixture already registered the user; use its credentials
    const { email, password } = loginApi;

    // Act
    const resp = await request.post(`${BASE_URL}/auth/login`, {
      data: { email, password },
    });

    // Assert — status
    expect(resp.status()).toBe(200);

    // Assert — schema
    const body = await resp.json();
    const result = AuthResponseSchema.safeParse(body);
    if (!result.success) console.error('Schema mismatch:', result.error.format());
    expect(result.success).toBe(true);

    // Assert — values
    if (result.success) {
      expect(result.data.token.length).toBeGreaterThan(0);
    }
  });

  // ── TC-3: GET /events ─────────────────────────────────────────────────────
  test('TC-3 | GET /events — should return 200 with array of events matching schema', async ({ request, loginApi }) => {
    // Act — loginApi.token comes from the fixture
    const resp = await request.get(`${BASE_URL}/events`, {
      headers: { Authorization: `Bearer ${loginApi.token}` },
    });

    // Assert — status
    expect(resp.status()).toBe(200);

    // Assert — schema
    const body = await resp.json();
    const result = EventsListResponseSchema.safeParse(body);
    if (!result.success) console.error('Schema mismatch:', result.error.format());
    expect(result.success).toBe(true);

    // Assert — values
    if (result.success) {
      expect(result.data.data.length).toBeGreaterThan(0);
      expect(result.data.data[0].id).toBeDefined();
    }
  });

  // ── TC-4: GET /events/{id} ────────────────────────────────────────────────
  test('TC-4 | GET /events/{id} — should return 200 with single event matching schema', async ({ request, loginApi }) => {
    // Arrange — create an event to fetch by ID
    const createResp = await request.post(`${BASE_URL}/events`, {
      headers: { Authorization: `Bearer ${loginApi.token}` },
      data: { title: `TC4 Event ${Date.now()}`, category: 'Conference', city: 'Bangalore', venue: 'KTPO', eventDate: '2027-06-15T10:00:00.000Z', price: 299, totalSeats: 50 },
    });
    const eventId = (await createResp.json()).data.id;

    // Act
    const resp = await request.get(`${BASE_URL}/events/${eventId}`, {
      headers: { Authorization: `Bearer ${loginApi.token}` },
    });

    // Assert — status
    expect(resp.status()).toBe(200);

    // Assert — schema
    const body = await resp.json();
    const result = SingleEventResponseSchema.safeParse(body);
    if (!result.success) console.error('Schema mismatch:', result.error.format());
    expect(result.success).toBe(true);

    // Assert — values
    if (result.success) {
      expect(result.data.data.id).toBe(eventId);
    }
  });

  // ── TC-5: POST /events ────────────────────────────────────────────────────
  test('TC-5 | POST /events — should return 201 and create event with correct fields', async ({ request, loginApi }) => {
    // Arrange
    const title = `TC5 Event ${Date.now()}`;

    // Act
    const resp = await request.post(`${BASE_URL}/events`, {
      headers: { Authorization: `Bearer ${loginApi.token}` },
      data: {
        title,
        category:   'Workshop',
        city:       'Mumbai',
        venue:      'BKC Convention Centre',
        eventDate:  '2027-09-10T09:00:00.000Z',
        price:      499,
        totalSeats: 100,
      },
    });

    // Assert — status
    expect(resp.status()).toBe(201);

    // Assert — schema
    const body = await resp.json();
    const result = SingleEventResponseSchema.safeParse(body);
    if (!result.success) console.error('Schema mismatch:', result.error.format());
    expect(result.success).toBe(true);

    // Assert — values
    if (result.success) {
      expect(result.data.data.title).toBe(title);
      expect(result.data.data.category).toBe('Workshop');
      expect(result.data.data.totalSeats).toBe(100);
    }
  });

  // ── TC-6: PUT /events/{id} ────────────────────────────────────────────────
  test('TC-6 | PUT /events/{id} — should return 200 and update the event title', async ({ request, loginApi }) => {
    // Arrange — create a dedicated event to update
    const createResp = await request.post(`${BASE_URL}/events`, {
      headers: { Authorization: `Bearer ${loginApi.token}` },
      data: { title: `TC6 Original ${Date.now()}`, category: 'Conference', city: 'Bangalore', venue: 'KTPO', eventDate: '2027-06-15T10:00:00.000Z', price: 299, totalSeats: 50 },
    });
    const eventId      = (await createResp.json()).data.id;
    const updatedTitle = `TC6 Updated ${Date.now()}`;

    // Act
    const resp = await request.put(`${BASE_URL}/events/${eventId}`, {
      headers: { Authorization: `Bearer ${loginApi.token}` },
      data: {
        title:      updatedTitle,
        category:   'Conference',
        city:       'Bangalore',
        venue:      'KTPO',
        eventDate:  '2027-06-15T10:00:00.000Z',
        price:      399,
        totalSeats: 50,
      },
    });

    // Assert — status
    expect(resp.status()).toBe(200);

    // Assert — schema
    const body = await resp.json();
    const result = SingleEventResponseSchema.safeParse(body);
    if (!result.success) console.error('Schema mismatch:', result.error.format());
    expect(result.success).toBe(true);

    // Assert — updated value reflected in response
    if (result.success) {
      expect(result.data.data.title).toBe(updatedTitle);
      expect(result.data.data.price).toBe(399);
    }
  });

  // ── TC-7: DELETE /events/{id} ─────────────────────────────────────────────
  test('TC-7 | DELETE /events/{id} — should return 200 and event should no longer exist', async ({ request, loginApi }) => {
    // Arrange — create a dedicated event to delete
    const createResp = await request.post(`${BASE_URL}/events`, {
      headers: { Authorization: `Bearer ${loginApi.token}` },
      data: {
        title:      `Delete Me ${Date.now()}`,
        category:   'Festival',
        city:       'Delhi',
        venue:      'Pragati Maidan',
        eventDate:  '2027-12-01T10:00:00.000Z',
        price:      99,
        totalSeats: 20,
      },
    });
    const createBody = await createResp.json();
    const deleteId   = createBody.data.id;

    // Act
    const deleteResp = await request.delete(`${BASE_URL}/events/${deleteId}`, {
      headers: { Authorization: `Bearer ${loginApi.token}` },
    });

    // Assert — delete succeeded
    expect(deleteResp.status()).toBe(200);

    // Assert — event no longer accessible
    const getResp = await request.get(`${BASE_URL}/events/${deleteId}`, {
      headers: { Authorization: `Bearer ${loginApi.token}` },
    });
    expect(getResp.status()).toBe(404);
  });

  // ── TC-8: POST /bookings ──────────────────────────────────────────────────
  test('TC-8 | POST /bookings — should return 201 with booking confirmation and ref', async ({ request, loginApi }) => {
    // Arrange — create a fresh event to book
    const eventResp = await request.post(`${BASE_URL}/events`, {
      headers: { Authorization: `Bearer ${loginApi.token}` },
      data: { title: `TC8 Bookable ${Date.now()}`, category: 'Conference', city: 'Bangalore', venue: 'KTPO', eventDate: '2027-06-15T10:00:00.000Z', price: 299, totalSeats: 50 },
    });
    const bookEventId   = (await eventResp.json()).data.id;
    const customerEmail = `customer_${Date.now()}@example.com`;

    // Act
    const resp = await request.post(`${BASE_URL}/bookings`, {
      headers: { Authorization: `Bearer ${loginApi.token}` },
      data: {
        eventId:       bookEventId,
        customerName:  'QA Test User',
        customerEmail,
        customerPhone: '+91 9876543210',
        quantity:      1,
      },
    });

    // Assert — status
    expect(resp.status()).toBe(201);

    // Assert — schema
    const body = await resp.json();
    const result = BookingResponseSchema.safeParse(body);
    if (!result.success) console.error('Schema mismatch:', result.error.format());
    expect(result.success).toBe(true);

    // Assert — values
    if (result.success) {
      expect(result.data.data.eventId).toBe(bookEventId);
      expect(result.data.data.status).toBe('confirmed');
      expect(result.data.data.bookingRef.length).toBeGreaterThan(0);
      expect(result.data.data.quantity).toBe(1);
    }
  });

});
