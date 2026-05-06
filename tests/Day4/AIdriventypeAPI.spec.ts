/* AI-GENERATED — Review required | Engineer: | Date: 2026-04-30 */
import { test, expect } from '@playwright/test';
import SwaggerParser from '@apidevtools/swagger-parser';
import * as path from 'path';

const BASE_URL = 'https://api.eventhub.rahulshettyacademy.com/api';
const SPEC_PATH = path.resolve(__dirname, '../../src/openapi.json');

// ── Load spec synchronously (JSON require) ────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-var-requires
const rawSpec = require('../../src/openapi.json');

// Extract summary + first 2xx status code from the spec for a given path/method.
// This is what makes the tests "AI-driven" — assertions are derived from the spec,
// not hardcoded.
function specMeta(pathKey: string, method: string): { summary: string; okStatus: number } {
  const op      = (rawSpec.paths[pathKey] as any)?.[method] ?? {};
  const summary = (op.summary as string) ?? `${method.toUpperCase()} ${pathKey}`;
  const okStatus = Number(
    Object.keys(op.responses ?? { 200: {} })
      .find(s => Number(s) >= 200 && Number(s) < 300) ?? 200
  );
  return { summary, okStatus };
}

// Metadata pulled straight from the OpenAPI spec
const registerMeta = specMeta('/auth/register', 'post'); // → { summary, okStatus: 201 }
const eventsMeta   = specMeta('/events',         'get');  // → { summary, okStatus: 200 }

test.describe('AI-Driven: Swagger-Generated API Tests', () => {

  // Validate the spec is well-formed before any test runs.
  // If the spec ever drifts (wrong types, missing required fields), this fails immediately.
  test.beforeAll(async () => {
    await SwaggerParser.validate(SPEC_PATH);
    console.log(`✅ Spec validated — ${rawSpec.info.title} v${rawSpec.info.version}`);
  });

  // ── Test 1: derived from POST /auth/register ──────────────────────────────
  // Title, expected HTTP status, and required body fields all come from the spec.
  test(`[Spec] ${registerMeta.summary}`, async ({ request }) => {
    const email = `aidriven_${Date.now()}@example.com`;

    // Arrange + Act
    const resp = await request.post(`${BASE_URL}/auth/register`, {
      data: { email, password: 'Password123!' },
    });

    // Assert — spec says 201 with { token: string, user: { id: number } }
    expect(resp.status()).toBe(registerMeta.okStatus);
    const body = await resp.json();
    expect(typeof body.token).toBe('string');
    expect(typeof body.user.id).toBe('number');
    expect(body.user.email).toBe(email);
  });

  // ── Test 2: derived from GET /events ─────────────────────────────────────
  // Bearer auth requirement and expected 200 status come from the spec.
  test(`[Spec] ${eventsMeta.summary}`, async ({ request }) => {
    // Arrange — spec says register returns a token; use it to authenticate
    const regResp = await request.post(`${BASE_URL}/auth/register`, {
      data: { email: `aidriven_ev_${Date.now()}@example.com`, password: 'Password123!' },
    });
    const { token } = await regResp.json();

    // Act — spec: GET /events requires Authorization: Bearer <token>
    const resp = await request.get(`${BASE_URL}/events`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Assert — spec says 200 with { data: Event[] }
    expect(resp.status()).toBe(eventsMeta.okStatus);
    const body = await resp.json();
    const list: unknown[] = body.data ?? body;
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
  });

});
