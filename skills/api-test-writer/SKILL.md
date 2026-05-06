# skills/api-test-writer/SKILL.md

## What this skill does
Generates production-ready Playwright TypeScript API test files for the EventHub project.
Read this file in full before writing any API test code.

## Non-negotiable rules
1. ALWAYS add the review header at the top of every generated file:
   /* AI-GENERATED — Review required | Engineer: [name] | Date: [YYYY-MM-DD] */
2. ALWAYS import from '@playwright/test', never from 'playwright' directly.
3. ALWAYS define a Zod schema for every response you assert — never assert raw JSON fields without a schema.
4. ALWAYS use safeParse() — never parse(). Check validation.success before accessing validation.data.
5. ALWAYS follow AAA structure: Arrange → Act → Assert with blank lines between sections.
6. ALWAYS use fresh credentials — register a new user in beforeAll or inside the test using Date.now() in the email.
7. NEVER hardcode tokens or user IDs — obtain them from the API response at runtime.
8. NEVER use a beforeEach to make API calls that could be shared — use beforeAll to avoid redundant requests.
9. Test names MUST follow: 'should [result] when [condition]'.
10. ALWAYS wrap tests in test.describe() with a meaningful name.
11. Always add comments for all functions and complex logic — assume the reviewer is not familiar with the code.

## Project API details
- Base URL   : https://api.eventhub.rahulshettyacademy.com/api
- Register   : POST /api/auth/register  { email, password } → 201 { token, user: { id, email } }
- Login      : POST /api/auth/login     { email, password } → 200 { token, user: { id, email } }
- Events     : GET  /api/events         Authorization: Bearer <token> → 200 { data: Event[] }
- Bookings   : POST /api/bookings       Authorization: Bearer <token> + body → 201 { data: Booking }

## Fixtures available
| Fixture     | Import from                     | Provides              | Use when                          |
|-------------|----------------------------------|----------------------|-----------------------------------|
| request     | '@playwright/test' (built-in)    | APIRequestContext     | Most API tests — raw HTTP calls   |
| loginApi    | 'fixtures/api-fixtures.ts'       | { token, userId }    | Tests that need a pre-logged-in user |

## Zod rules
- Define schemas at the top of the file, outside describe blocks.
- Use z.object() for response bodies, z.array() for lists.
- Use z.string(), z.number(), z.boolean(), z.enum([]) for field types.
- Use z.string().email() to validate email fields.
- Use z.union() or z.discriminatedUnion() for endpoints that return different shapes on success vs error.
- Log schema errors with console.error('Schema mismatch:', validation.error.format()) before failing.

## Zod schema patterns for this project

### Auth response
```typescript
const AuthResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.number(),
    email: z.string().email(),
  }),
});
```

### Event object
```typescript
const EventSchema = z.object({
  id: z.number(),
  title: z.string(),
  city: z.string(),
  venue: z.string(),
  price: z.number(),
  totalSeats: z.number(),
  availableSeats: z.number(),
  category: z.string(),
  eventDate: z.string(),
});
```

### Events list response
```typescript
const EventsListSchema = z.object({
  data: z.array(EventSchema),
});
```

## Status code rules
| Scenario                        | Expected status |
|----------------------------------|-----------------|
| Successful registration          | 201             |
| Successful login                 | 200             |
| Successful GET (events/bookings) | 200             |
| Successful POST (bookings)       | 201             |
| Invalid credentials / bad input  | 400             |
| Missing or invalid token         | 401             |
| Resource not found               | 404             |

## Output format
Return ONLY the TypeScript file content.
No explanations, no markdown fences, no preamble — just the file.

## Worked example
INPUT: 'Test that registering via API returns a token and user id'

OUTPUT:
/* AI-GENERATED — Review required | Engineer: | Date: */
import { test, expect } from '@playwright/test';
import { z } from 'zod';

const BASE_URL = 'https://api.eventhub.rahulshettyacademy.com/api';

const AuthResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.number(),
    email: z.string().email(),
  }),
});

test.describe('Auth API — Registration', () => {

  test('should return token and user id when valid credentials are provided', async ({ request }) => {
    // Arrange
    const email = `qa_${Date.now()}@example.com`;

    // Act
    const resp = await request.post(`${BASE_URL}/auth/register`, {
      data: { email, password: 'Password123!' },
    });

    // Assert — status
    expect(resp.status()).toBe(201);

    // Assert — schema
    const body = await resp.json();
    const result = AuthResponseSchema.safeParse(body);
    if (!result.success) {
      console.error('Schema mismatch:', result.error.format());
    }
    expect(result.success).toBe(true);

    // Assert — values
    if (result.success) {
      expect(result.data.user.email).toBe(email);
      expect(result.data.token.length).toBeGreaterThan(0);
    }
  });

});
