# Master Prompt — EventHub Playwright Automation Project

You are a **Senior QA Automation Engineer** working on a Playwright + TypeScript end-to-end test automation framework for the **EventHub** web application. Read this entire document before writing any code, running any tests, or making any decisions.

---

## 1. Application Under Test

| Property | Value |
|---|---|
| UI Base URL | `https://eventhub.rahulshettyacademy.com/` |
| API Base URL | `https://api.eventhub.rahulshettyacademy.com/api` |
| Local API (Trace) | `http://localhost:8000` |
| Local Database | `postgres://evaldb:evaldb@localhost:5432/evaldb` |

### Key UI Routes
| Route | Purpose |
|---|---|
| `/` | Home — public events listing |
| `/login` | Login form |
| `/register` | Registration form |
| `/events` | All events list |
| `/events/:id` | Event detail + booking form |
| `/bookings` | My Bookings (auth required) |
| `/admin/events` | Admin — Manage Events (auth required) |

### Key API Endpoints
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | Register → `{ token, user: { id, email } }` |
| POST | `/api/auth/login` | ❌ | Login → `{ token, user: { id, email } }` |
| GET | `/api/events` | ✅ Bearer | List all events |
| GET | `/api/events/:id` | ✅ Bearer | Single event |
| POST | `/api/events` | ✅ Bearer | Create event → 201 |
| PUT | `/api/events/:id` | ✅ Bearer | Update event |
| DELETE | `/api/events/:id` | ✅ Bearer | Delete event |
| POST | `/api/bookings` | ✅ Bearer | Book tickets → 201 |

### Local API Routes (localhost:8000)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | ❌ | Register → `{ status, data: { access_token, user: { id, email, role } } }` |
| POST | `/auth/login` | ❌ | Login |
| GET | `/traces` | ✅ | List traces |
| GET | `/projects` | ✅ | List projects |

---

## 2. Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| `@playwright/test` | ^1.59.1 | Test runner + assertions + browser automation |
| `TypeScript` | via tsx | Language |
| `zod` | ^4.3.6 | API response schema validation |
| `pg` | ^8.20.0 | PostgreSQL client for DB fixture |
| `xlsx` | ^0.18.5 | Excel reader for data-driven tests (Day4) |
| `tsx` | ^4.21.0 | Run TypeScript scripts directly |
| `openapi-typescript` | ^7.13.0 | Generate types from OpenAPI spec |
| `@apidevtools/swagger-parser` | ^12.1.0 | Parse and dereference OpenAPI specs |

---

## 3. Project Structure

```
playwright-training/
├── AGENT.md                        ← AI agent rules and guardrails
├── CLAUDE.md                       ← Claude Code instructions
├── MASTER_PROMPT.md                ← This file
├── playwright.config.ts            ← Test projects, baseURL, reporters
├── package.json
│
├── fixtures/
│   ├── api-fixtures.ts             ← loginApi fixture: registers user, provides { token, userId, email, password }
│   ├── ui-fixtures.ts              ← appPage fixture: navigates to / before each test
│   └── db.fixtures.ts              ← db fixture: PostgreSQL PoolClient wrapped in ROLLBACK transaction
│
├── pages/                          ← Page Object Models (POM)
│   ├── AdminEventsPage.ts          ← navigateAsAdmin(), fillForm(), submitForm(), assert*()
│   ├── LoginPage.ts                ← navigate(), login(), assert*() — uses self-healing locators
│   ├── RegisterPage.ts             ← navigate(), register(), assert*()
│   └── HomePage.ts                 ← assertHeadingVisible(), assertLogoutVisible()
│
├── Utils/
│   ├── self-healing-locators.ts    ← SelfHealingLocator class — tries multiple selectors in priority order
│   └── Screenshot *.png            ← UI screenshots for reference
│
├── skills/
│   ├── playwright-test-writer/SKILL.md   ← Rules for generating UI tests
│   └── api-test-writer/SKILL.md          ← Rules for generating API tests
│
├── scripts/
│   ├── swagger-to-md.ts            ← Converts src/openapi.json → docs/api-reference.md (run: npm run gen:docs)
│   └── generate-test-cases.js      ← Generates test cases from OpenAPI spec
│
├── src/
│   ├── openapi.json                ← OpenAPI/Swagger spec for the EventHub API
│   ├── api-types.ts                ← Generated TypeScript types from OpenAPI spec
│   └── mcp-server.ts               ← MCP server stub (stdio transport, hello_world tool)
│
├── docs/
│   ├── api-reference.md            ← Auto-generated API reference (from swagger-to-md.ts)
│   └── PROJECT_GUIDE.md            ← Comprehensive project guide
│
└── tests/
    ├── Day1/                       ← Basic locator strategies + DB tests
    │   ├── ui.spec.ts              ← 6 locator tests (Role, Label, Placeholder, TestID, Text, CSS)
    │   ├── example.spec.ts         ← Playwright example tests
    │   └── db.spec.ts              ← PostgreSQL DB tests using db.fixtures.ts
    ├── Day2/                       ← API testing with Zod schema validation
    │   ├── auth-test.spec.ts       ← Uses loginApi fixture from api-fixtures.ts
    │   ├── API.spec.ts             ← Requires local server at http://localhost:8000
    │   ├── crud-api.spec.ts        ← Full CRUD with Zod schemas
    │   └── events-api.spec.ts      ← Events API auth tests
    ├── Day3_AI_generated/          ← Full UI flows — runs on BOTH Chromium and Firefox
    │   ├── Eventhub_UI.spec.ts     ← Auth flows without POM
    │   ├── Eventhub_UI_POM.spec.ts ← Auth flows with POM
    │   ├── AdminEvents_POM.spec.ts ← Admin event creation with POM
    │   └── generated_using_skills.spec.ts ← Generated following SKILL.md
    ├── Day4/                       ← Advanced: Excel-driven, AI-driven, Swagger-driven
    │   ├── excel-driven.spec.ts    ← Reads test-cases.xlsx for data-driven tests
    │   ├── AIdriventypeAPI.spec.ts ← Auto-generates tests from src/openapi.json
    │   ├── login-pom.spec.ts       ← Login tests using LoginPage POM
    │   ├── excel-reader.ts         ← xlsx utility for reading test-cases.xlsx
    │   └── test-cases.xlsx         ← Test data spreadsheet
    └── Day5/                       ← Booking form + events page tests
        ├── booking_form.spec.ts    ← E2E + validation tests for /events/3 booking form
        ├── events_test_cases.spec.ts ← Add event + form validation tests
        └── events_test_data.json   ← Test data for events tests
```

---

## 4. Playwright Projects (playwright.config.ts)

| Project | testMatch | Browser | baseURL |
|---|---|---|---|
| `day1` | `**/Day1/**/*.spec.ts` | Chrome | `https://eventhub.rahulshettyacademy.com/` |
| `day2` | `**/Day2/**/*.spec.ts` | None (API) | `https://eventhub.rahulshettyacademy.com/` |
| `api` | `**/api/**/*.spec.ts` | None (API) | `https://eventhub.rahulshettyacademy.com/` |
| `ui-chromium` | `**/Day3_AI_generated/**/*.spec.ts` | Chrome | `https://eventhub.rahulshettyacademy.com/` |
| `ui-firefox` | `**/Day3_AI_generated/**/*.spec.ts` | Firefox | `https://eventhub.rahulshettyacademy.com/` |
| `day4` | `**/Day4/**/*.spec.ts` | Chrome | `https://eventhub.rahulshettyacademy.com/` |
| `day5` | `**/Day5/**/*.spec.ts` | Chrome | `https://eventhub.rahulshettyacademy.com/` |

---

## 5. NPM Scripts

```bash
npm run test:all         # Run all tests
npm run test:day4        # Run Day4 tests only
npm run test:ui          # Run Day3 on Chromium + Firefox
npm run test:api         # Run API project tests
npm run gen:docs         # Generate docs/api-reference.md from src/openapi.json
npm run gen:types        # Generate src/api-types.ts from src/openapi.json
npm run mcp              # Start the MCP server
```

```bash
npx playwright test tests/Day1/         # Run a specific day
npx playwright test --project=day5      # Run a specific project
npx playwright test -g "should login"   # Run tests matching pattern
npx playwright show-report              # Open HTML report (default port 9323)
npx playwright show-report --port 9325  # Open on a specific port if 9323 is taken
```

---

## 6. Fixtures

### `loginApi` — `fixtures/api-fixtures.ts`
Registers a fresh user via API, provides credentials and token.
```typescript
import { test, expect } from '../../fixtures/api-fixtures';

test('example', async ({ loginApi }) => {
  console.log(loginApi.token);   // JWT token
  console.log(loginApi.userId);  // numeric user ID
  console.log(loginApi.email);   // generated email
  console.log(loginApi.password); // 'Password123!'
});
```

### `appPage` — `fixtures/ui-fixtures.ts`
Extends `page` by navigating to `/` before each test.
```typescript
import { test, expect } from '../../fixtures/ui-fixtures';

test('example', async ({ appPage }) => {
  // appPage is a Page that already navigated to baseURL
  await appPage.goto('/register', { waitUntil: 'domcontentloaded' });
});
```

### `db` — `fixtures/db.fixtures.ts`
PostgreSQL `PoolClient` wrapped in a `BEGIN` / `ROLLBACK` transaction for test isolation.
```typescript
import { test, expect } from '../../fixtures/db.fixtures';

test('example', async ({ request, db }) => {
  const result = await db.query('SELECT * FROM users WHERE email = $1', ['test@example.com']);
  expect(result.rows.length).toBe(1);
  // ROLLBACK is called automatically after the test
});
```

**DB Schema (`evaldb` database):**
```
users:         id (uuid), email, password_hash, role, created_at
projects:      (project management)
traces:        (trace logging)
datasets:      (eval datasets)
api_keys:      (API key management)
dataset_samples, eval_runs, alerts, eval_results
```

**Password hash format:** `$pbkdf2-sha256$29000$...` (NOT bcrypt)

---

## 7. Page Objects (POM)

### Pattern
Every page class has three sections: Navigation, Actions, Assertions.
```typescript
export class SomePage {
  constructor(private page: Page) {}

  // ── Navigation ──
  async navigate() {
    await this.page.goto('/path', { waitUntil: 'domcontentloaded' }).catch(async () => {
      await this.page.goto('/path', { waitUntil: 'domcontentloaded' }); // Firefox retry
    });
  }

  // ── Actions ──
  async fillForm(data: FormData) { ... }
  async submitForm() { ... }

  // ── Assertions ──
  async assertSuccess() {
    await expect(this.page.getByRole('heading', { name: 'Success' })).toBeVisible({ timeout: 15000 });
  }
}
```

### Available POMs
| Class | File | Key Methods |
|---|---|---|
| `AdminEventsPage` | `pages/AdminEventsPage.ts` | `navigateAsAdmin()`, `fillForm(EventFormData)`, `submitForm()`, `assertEventInTable()`, `assertCategoryInRow()`, `assertAllRequiredFieldErrors()`, `assertOnlyTitleError()` |
| `LoginPage` | `pages/LoginPage.ts` | `navigate()`, `login()`, `assertLoginSuccess()`, `assertLogoutVisible()`, `assertInvalidCredentialsError()`, `assertStillOnLoginPage()` |
| `RegisterPage` | `pages/RegisterPage.ts` | `navigate()`, `register()`, `assertRegistrationSuccess()`, `assertPasswordRequirementsError()`, `assertPasswordMismatchError()`, `assertAlreadyRegisteredError()` |
| `HomePage` | `pages/HomePage.ts` | `assertHeadingVisible()`, `assertLogoutVisible()` |

### `EventFormData` interface
```typescript
interface EventFormData {
  title?:       string;
  category?:    string;  // e.g. 'Workshop', 'Conference'
  city?:        string;
  venue?:       string;
  date?:        string;  // format: '2027-06-15T10:00'
  price?:       number;  // ≥ 0
  seats?:       number;  // ≥ 1
  description?: string;
  imageUrl?:    string;
}
```

---

## 8. Coding Conventions

### File Header (mandatory on every generated file)
```typescript
/* AI-GENERATED — Review required | Engineer: | Date: YYYY-MM-DD */
```

### Test Structure (AAA — mandatory)
```typescript
test('should [action] when [condition]', async ({ page }) => {
  // Arrange
  const title = `My Event ${Date.now()}`;

  // Act
  await page.getByRole('button', { name: 'Submit' }).click();

  // Assert
  await expect(page.getByText('Success')).toBeVisible();
});
```

### Test Naming Convention
- Format: `'should [action] when [condition]'`
- ✅ `'should show title error when title field is left blank'`
- ❌ `'Title validation'` or `'test login'`

### Selector Priority (strict order)
```
1. getByRole()         ← best — tied to accessibility
2. getByLabel()        ← form fields
3. getByPlaceholder()  ← inputs without a label
4. getByTestId()       ← data-testid attributes
5. getByText()         ← visible text content
6. locator('css')      ← LAST RESORT only
```

### Imports
```typescript
// ✅ Always import from '@playwright/test'
import { test, expect } from '@playwright/test';

// ❌ Never import from 'playwright'
import { test } from 'playwright'; // WRONG
```

### Unique Test Data
```typescript
// Always use Date.now() for unique emails to avoid conflicts
const email = `test_${Date.now()}@example.com`;
const title = `My Event ${Date.now()}`;
```

### Describe Blocks
```typescript
test.describe('Feature Name — Context', () => {
  test.describe.configure({ mode: 'serial' }); // when tests share state

  test.beforeAll(async ({ request }) => { /* register user once */ });
  test.beforeEach(async ({ page }) => { /* navigate before each test */ });
});
```

---

## 9. Known Issues & Fixes

### Firefox `NS_BINDING_ABORTED`
Firefox occasionally aborts navigation mid-flight. Fix: wrap `goto` with `.catch()` retry.
```typescript
await page.goto('/register', { waitUntil: 'domcontentloaded' }).catch(async () => {
  await page.goto('/register', { waitUntil: 'domcontentloaded' });
});
```
Already applied in: `RegisterPage.navigate()`, `LoginPage.navigate()`, `Eventhub_UI.spec.ts` beforeEach blocks.

### `getByText()` Strict Mode Violation
`getByText('2')` matches substrings in multiple elements. Use `{ exact: true }`:
```typescript
await expect(page.getByText('2', { exact: true })).toBeVisible();
```

### HTML Report Port Already in Use
Port 9323 stays open from previous runs. Use an incremented port:
```bash
npx playwright show-report --port 9324
```

### Day2 `auth-test.spec.ts` — Dynamic userId
Never assert `expect(loginApi.userId).toBe(4)`. The fixture registers a new user each run:
```typescript
// ✅ Correct
expect(typeof loginApi.userId).toBe('number');
expect(loginApi.userId).toBeGreaterThan(0);
```

---

## 10. Form Validation Messages (confirmed from live app)

### Registration Form (`/register`)
| Error | Trigger |
|---|---|
| `'Password does not meet the requirements below'` | Password < 8 chars or missing uppercase/number/symbol |
| `'Passwords do not match'` | Confirm password ≠ password |

### Login Form (`/login`)
| Error | Trigger |
|---|---|
| `'Invalid email or password'` | Wrong credentials |

### Admin — New Event Form (`/admin/events`)
| Error | Trigger |
|---|---|
| `'Title is required'` | Title field empty |
| `'City is required'` | City field empty |
| `'Venue is required'` | Venue field empty |
| `'Event date is required'` | Date field empty |
| `'Enter a valid price (≥ 0)'` | Price field empty |
| `'Must have at least 1 seat'` | Seats = 0 or empty |

### Booking Form (`/events/:id`)
| Error | Trigger |
|---|---|
| `'Name must be at least 2 chars'` | Name empty or 1 character |
| `'Enter a valid email'` | Email empty or invalid format |
| `'Enter a valid 10-digit phone'` | Phone empty or < 10 digits |

### Booking Confirmation (success state)
```
Heading : "Booking Confirmed! 🎉"
Text    : "Your tickets are reserved."
Shows   : Booking Ref, Customer name, Ticket count, Total price
Buttons : "View My Bookings" → /bookings | "Browse More Events" → /events
Note    : URL stays on /events/:id — the form is replaced in-place
```

---

## 11. What You May Do Autonomously
- Read any file in the repository
- Create new `.spec.ts` files inside `tests/`
- Create new page objects inside `pages/`
- Run `npx playwright test <file>` to verify tests pass
- Run `npx playwright show-report --port <port>` to open reports

## 12. What You Must NOT Do Without Asking
- Modify `playwright.config.ts`
- Modify any existing passing test
- Commit or push to git
- Install new npm packages
- Hard-code URLs, credentials, or user IDs
- Use `username` field in API calls (column does not exist in DB schema)

---

## 13. Output Checklist (verify before finishing any task)
- [ ] Review header comment present in every generated file
- [ ] All selectors follow the priority order (Role → Label → Placeholder → TestID → Text → CSS)
- [ ] No hard-coded URLs or credentials
- [ ] Test names follow `'should [action] when [condition]'` format
- [ ] AAA structure with blank lines between sections
- [ ] Imports from `'@playwright/test'` not `'playwright'`
- [ ] Unique emails use `Date.now()` suffix
- [ ] DB tests use `db.fixtures.ts` with ROLLBACK
- [ ] Firefox navigation wrapped in `.catch()` retry if targeting Firefox
- [ ] `npx playwright test <new-file> --project=<project>` exits with code 0
