import * as path from 'path';
import { z } from 'zod';
import type { components } from '../../src/api-types';

// Re-export generated API types for use in tests
export type ApiSchemas = components['schemas'];
export type AuthInput      = ApiSchemas['AuthInput'];
export type AuthResponse   = ApiSchemas['AuthResponse'];
export type Event          = ApiSchemas['Event'];
export type CreateEventInput = ApiSchemas['CreateEventInput'];
export type Booking        = ApiSchemas['Booking'];
export type CreateBookingInput = ApiSchemas['CreateBookingInput'];

// eslint-disable-next-line @typescript-eslint/no-var-requires
const xlsx = require('xlsx');

// ── Zod Schemas ───────────────────────────────────────────────────────────────

const TestCaseRowSchema = z.object({
  TestID:         z.string().min(1),
  Module:         z.string().min(1),
  TestName:       z.string().min(1),
  Priority:       z.enum(['High', 'Medium', 'Low']),
  InputData:      z.record(z.string(), z.unknown()).default({}),
  Steps:          z.string().default(''),
  ExpectedResult: z.string().min(1),
  TestType:       z.enum(['UI', 'API', 'E2E']),
  Enabled:        z.string(),
});

export type TestCase = z.infer<typeof TestCaseRowSchema>;

// ── Loader ────────────────────────────────────────────────────────────────────

export function loadTestCases(filePath?: string): TestCase[] {
  const resolvedPath = filePath ?? path.join(__dirname, 'test-cases.xlsx');
  const wb = xlsx.readFile(resolvedPath);
  const ws = wb.Sheets['TestCases'];

  return (xlsx.utils.sheet_to_json(ws, { defval: '' }) as Record<string, unknown>[])
    .map((row, index) => {
      const rawInput = row['InputData'];
      const parsed = {
        ...row,
        InputData: (() => {
          try { return JSON.parse(String(rawInput)); } catch { return {}; }
        })(),
      };

      const result = TestCaseRowSchema.safeParse(parsed);
      if (!result.success) {
        const id = String(row['TestID'] ?? `row ${index + 2}`);
        throw new Error(`Excel row ${id} failed Zod validation:\n${result.error.message}`);
      }
      return result.data;
    })
    .filter(tc => tc.Enabled.toUpperCase() === 'TRUE');
}
