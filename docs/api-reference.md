# API Reference — EventHub API

> Version: **1.0.0**
>
> REST API for the EventHub ticket booking platform.
> 
> All event and booking operations are available here. Booking creation is atomic — seats are decremented in the same database transaction.

**Base URL:** `https://api.eventhub.rahulshettyacademy.com/api`

---

## `POST` /auth/register

**Register a new user**

Creates a new user account and returns a JWT token. Each registered user gets a fully isolated sandbox — events and bookings are private to their account.

**Auth required:** ❌ No

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | `string` | ✅ | e.g. `student@example.com` |
| `password` | `string` | ✅ | e.g. `secret123` |

### Responses

| Status | Meaning |
|--------|---------|
| `201` | ✅ Account created successfully |
| `400` | ⚠️ Validation error — invalid email format or password too short, or email already registered |

---

## `POST` /auth/login

**Log in with existing credentials**

Authenticates a user and returns a JWT token. Store the token and send it as a Bearer token in the Authorization header on all subsequent requests.

**Auth required:** ❌ No

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | `string` | ✅ | e.g. `student@example.com` |
| `password` | `string` | ✅ | e.g. `secret123` |

### Responses

| Status | Meaning |
|--------|---------|
| `200` | ✅ Login successful |
| `400` | ⚠️ Wrong password or validation error |
| `404` | ⚠️ No account found for this email |

---

## `GET` /auth/me

**Get the currently authenticated user**

Validates the bearer token and returns the decoded user identity. Useful for verifying a token is still valid.

**Auth required:** ✅ Yes — `Authorization: Bearer <token>`

### Responses

| Status | Meaning |
|--------|---------|
| `200` | ✅ Token is valid — returns user identity |
| `401` | ⚠️ Missing or invalid token |

---

## `GET` /bookings

**List all bookings**

Returns a paginated list of all bookings, each including full event details.

**Auth required:** ❌ No

### Responses

| Status | Meaning |
|--------|---------|
| `200` | ✅ Paginated list of bookings |
| `500` | ❌ Internal server error |

---

## `POST` /bookings

**Create a booking (buy tickets)**

Books tickets for an event. The service will:
1. Verify the event exists
2. Check sufficient seats are available
3. Calculate the total price
4. Generate a unique booking reference (EVT-XXXXXX)
5. Atomically create the booking and decrement available seats


**Auth required:** ❌ No

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `eventId` | `integer` | ✅ | e.g. `1` |
| `customerName` | `string` | ✅ | e.g. `Priya Sharma` |
| `customerEmail` | `string` | ✅ | e.g. `priya.sharma@email.com` |
| `customerPhone` | `string` | ✅ | e.g. `+91-9876543210` |
| `quantity` | `integer` | ✅ | e.g. `2` |

### Responses

| Status | Meaning |
|--------|---------|
| `201` | ✅ Booking confirmed |
| `400` | ⚠️ Validation error or insufficient seats |
| `404` | ⚠️ Event not found |
| `500` | ❌ Internal server error |

---

## `GET` /bookings/ref/{ref}

**Look up a booking by reference code**

Retrieves a booking using the unique booking reference (e.g. EVT-A1B2C3).

**Auth required:** ❌ No

### Responses

| Status | Meaning |
|--------|---------|
| `200` | ✅ Booking found |
| `404` | ⚠️ Booking not found |
| `500` | ❌ Internal server error |

---

## `GET` /bookings/{id}

**Get a single booking by ID**

**Auth required:** ❌ No

### Responses

| Status | Meaning |
|--------|---------|
| `200` | ✅ Booking found |
| `404` | ⚠️ Booking not found |
| `500` | ❌ Internal server error |

---

## `DELETE` /bookings/{id}

**Cancel a booking**

Cancels (permanently deletes) a booking and atomically restores the
released seats back to the event's `availableSeats` count.


**Auth required:** ❌ No

### Responses

| Status | Meaning |
|--------|---------|
| `200` | ✅ Booking cancelled and seats restored |
| `404` | ⚠️ Booking not found |
| `500` | ❌ Internal server error |

---

## `GET` /events

**List all events**

Returns a paginated list of events. Supports filtering by category, city, and free-text search.

**Auth required:** ❌ No

### Responses

| Status | Meaning |
|--------|---------|
| `200` | ✅ Paginated list of events |
| `500` | ❌ Internal server error |

---

## `POST` /events

**Create a new event**

Creates an event. `availableSeats` is automatically set equal to `totalSeats`.

**Auth required:** ❌ No

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | `string` | ✅ | e.g. `Tech Summit 2026` |
| `description` | `string` | — | e.g. `A premier technology conference.` |
| `category` | `string` | ✅ | e.g. `Conference` |
| `venue` | `string` | ✅ | e.g. `Bangalore International Centre` |
| `city` | `string` | ✅ | e.g. `Bangalore` |
| `eventDate` | `string` | ✅ | e.g. `2026-06-15T09:00:00.000Z` |
| `price` | `number` | ✅ | e.g. `1500` |
| `totalSeats` | `integer` | ✅ | e.g. `500` |
| `imageUrl` | `string` | — | e.g. `https://example.com/banner.jpg` |

### Responses

| Status | Meaning |
|--------|---------|
| `201` | ✅ Event created successfully |
| `400` | ⚠️ Validation error |
| `500` | ❌ Internal server error |

---

## `GET` /events/{id}

**Get a single event by ID**

**Auth required:** ❌ No

### Responses

| Status | Meaning |
|--------|---------|
| `200` | ✅ Event found |
| `404` | ⚠️ Event not found |
| `500` | ❌ Internal server error |

---

## `PUT` /events/{id}

**Update an event**

**Auth required:** ❌ No

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | `string` | ✅ | e.g. `Tech Summit 2026` |
| `description` | `string` | — | e.g. `A premier technology conference.` |
| `category` | `string` | ✅ | e.g. `Conference` |
| `venue` | `string` | ✅ | e.g. `Bangalore International Centre` |
| `city` | `string` | ✅ | e.g. `Bangalore` |
| `eventDate` | `string` | ✅ | e.g. `2026-06-15T09:00:00.000Z` |
| `price` | `number` | ✅ | e.g. `1500` |
| `totalSeats` | `integer` | ✅ | e.g. `500` |
| `imageUrl` | `string` | — | e.g. `https://example.com/banner.jpg` |

### Responses

| Status | Meaning |
|--------|---------|
| `200` | ✅ Event updated successfully |
| `400` | ⚠️ Validation error |
| `404` | ⚠️ Event not found |
| `500` | ❌ Internal server error |

---

## `DELETE` /events/{id}

**Delete an event**

Permanently deletes an event and all associated bookings (cascade).

**Auth required:** ❌ No

### Responses

| Status | Meaning |
|--------|---------|
| `200` | ✅ Event deleted successfully |
| `404` | ⚠️ Event not found |
| `500` | ❌ Internal server error |

---

## `GET` /health

**API health check**

**Auth required:** ❌ No

### Responses

| Status | Meaning |
|--------|---------|
| `200` | ✅ API is running |

---

## `GET` /config

**Get public feature flags**

**Auth required:** ❌ No

### Responses

| Status | Meaning |
|--------|---------|
| `200` | ✅ Feature flag values |

---

