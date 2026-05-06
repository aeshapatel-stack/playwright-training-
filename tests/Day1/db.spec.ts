import { test, expect } from '../../fixtures/db.fixtures';

const LOCAL_API = 'http://localhost:8000';

test('new user persisted after API creation', async ({ request, db }) => {
  const email    = `db-test-${Date.now()}@example.com`;
  const password = 'Password123!';

  // Register a new user via the local API
  const resp = await request.post(`${LOCAL_API}/auth/register`, {
    data: { email, password },
  });

  expect(resp.ok()).toBeTruthy();

  // Extract the UUID assigned by the API
  const body = await resp.json();
  const id   = body.data.user.id;

  // Verify the user row exists in the database with the correct email
  const result = await db.query(
    'SELECT id, email FROM users WHERE id = $1',
    [id]
  );

  expect(result.rows.length).toBe(1);
  expect(result.rows[0].email).toBe(email);
});

test('password is never stored in plain text', async ({ request, db }) => {
  const email    = `pw-hash-test-${Date.now()}@example.com`;
  const password = 'Password123!';

  // Register a fresh user so we have a known email to query
  await request.post(`${LOCAL_API}/auth/register`, {
    data: { email, password },
  });

  // Verify the stored hash uses pbkdf2-sha256 and is never the plain-text password
  const result = await db.query(
    'SELECT password_hash FROM users WHERE email = $1',
    [email]
  );

  expect(result.rows.length).toBe(1);
  expect(result.rows[0].password_hash).toMatch(/^\$pbkdf2-sha256\$/);
  expect(result.rows[0].password_hash).not.toBe(password);
});
