# Playwright Training Project — Complete Guide

## What is this project?

This is a Playwright + TypeScript training project built around the **EventHub** application — a ticket booking platform. It covers UI testing, API testing, data-driven testing, Page Object Model, self-healing locators, AI-driven tests, and CI/CD.

**App under test:** https://eventhub.rahulshettyacademy.com
**API under test:** https://api.eventhub.rahulshettyacademy.com/api

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Configuration Files](#configuration-files)
3. [Fixtures](#fixtures)
4. [Page Object Model (pages/)](#page-object-model)
5. [Utilities (Utils/)](#utilities)
6. [Test Files — Day by Day](#test-files)
7. [Scripts](#scripts)
8. [Skills (AI Prompt Templates)](#skills)
9. [Source Files (src/)](#source-files)
10. [CI/CD](#cicd)
11. [NPM Scripts](#npm-scripts)
12. [How to Run Tests](#how-to-run-tests)

---

## Project Structure

```
playwright-training/
│
├── tests/                        ← All test files organised by day
│   ├── Day1/                     ← UI locator basics
│   ├── Day2/                     ← API testing + Zod schema validation
│   ├── Day3_AI_generated/        ← AI-generated tests + POM refactored tests
│   ├── Day4/                     ← Excel-driven, self-healing, POM, Swagger-API
│   └── Day5/                     ← (reserved for E2E flows)
│
├── pages/                        ← Page Object Model classes
├── fixtures/                     ← Shared test setup (auth, navigation)
├── Utils/                        ← Reusable utilities (self-healing locator)
├── scripts/                      ← Code generation scripts
├── skills/                       ← AI prompt templates (SKILL.md files)
├── src/                          ← Auto-generated API types + MCP server
├── docs/                         ← Auto-generated documentation
└── .github/workflows/            ← GitHub Actions CI pipeline
```

---

## Configuration Files

### `playwright.config.ts`
The central Playwright configuration file. Defines:

- **baseURL** — `https://eventhub.rahulshettyacademy.com/` (all relative URLs like `/login` resolve against this)
- **reporter** — HTML report + list reporter in the terminal
- **screenshot: 'on'** — captures screenshots for every test, visible in the HTML report
- **trace: 'on-first-retry'** — records a trace file on test retry for debugging

**Projects defined** (each project runs a specific set of test files):

| Project | Matches | Browser |
|---------|---------|---------|
| `day1` | `**/Day1/**/*.spec.ts` | Chrome |
| `api` | `**/api/**/*.spec.ts` | None (API only) |
| `ui-chromium` | `**/Day3_AI_generated/**/*.spec.ts` | Chrome |
| `ui-firefox` | `**/Day3_AI_generated/**/*.spec.ts` | Firefox |
| `day2` | `**/Day2/**/*.spec.ts` | None (API only) |
| `day4` | `**/Day4/**/*.spec.ts` | Chrome |
| `day5` | `**/Day5/**/*.spec.ts` | Chrome |

---

### `package.json`
Lists all dependencies and npm scripts.

**Key dependencies:**

| Package | Purpose |
|---------|---------|
| `@playwright/test` | Core testing framework |
| `zod` | Runtime schema validation for API responses |
| `xlsx` | Read/write Excel files for data-driven tests |
| `@apidevtools/swagger-parser` | Parse and validate OpenAPI/Swagger specs |
| `openapi-typescript` | Generate TypeScript types from OpenAPI spec |
| `tsx` | Run TypeScript files directly without compiling |

---

### `AGENT.md`
Instructions for Claude Code (AI assistant) when working in this project. Describes the project context, role, boundaries, and coding conventions the AI must follow.

### `CLAUDE.md`
Project-specific guidance for Claude Code — lists common commands, architecture overview, and key conventions.

### `prompts.md`
A library of ready-to-use prompts for generating Playwright tests with AI tools. Contains 5 prompts covering UI flows, Admin CRUD, API contract tests, validation tests, and cross-browser regression.

---

## Fixtures

Fixtures are **shared setup code** that runs automatically before a test and injects ready-to-use objects into the test function.

---

### `fixtures/api-fixtures.ts`

**Purpose:** Registers a fresh user via the API before each test and provides the token and credentials.

**Fixture name:** `loginApi`

**What it provides:**
```typescript
loginApi: {
  token:    string;  // JWT Bearer token — ready to use in API calls
  userId:   number;  // The registered user's ID
  email:    string;  // The generated email address
  password: string;  // The password used to register
}
```

**How to use it:**
```typescript
import { test, expect } from '../../fixtures/api-fixtures';

test('my api test', async ({ request, loginApi }) => {
  // loginApi.token is already available — no registration needed in the test
  const resp = await request.get('/api/events', {
    headers: { Authorization: `Bearer ${loginApi.token}` }
  });
});
```

**Used by:** `tests/Day2/auth-test.spec.ts`, `tests/Day2/crud-api.spec.ts`

---

### `tests/Day3_AI_generated/ui-fixture.ts`

**Purpose:** Navigates the browser to the home page (`/`) before each test and provides the Playwright `page` object as `appPage`.

**Fixture name:** `appPage`

**How to use it:**
```typescript
import { test } from './ui-fixture';

test('my ui test', async ({ appPage }) => {
  // appPage is already at https://eventhub.rahulshettyacademy.com/
  await appPage.goto('/login');
});
```

**Used by:** `Eventhub_UI.spec.ts`, `Eventhub_UI_POM.spec.ts`

---

## Page Object Model

Page Objects wrap all the interactions with a specific page into methods. Tests call these methods instead of writing raw Playwright selectors — making tests shorter, readable, and easier to maintain.

---

### `pages/LoginPage.ts`

Wraps all interactions with the `/login` page.

| Method | What it does |
|--------|-------------|
| `navigate()` | Goes to `/login` |
| `fillEmail(email)` | Fills the Email field |
| `fillPassword(password)` | Fills the Password field |
| `clickSignIn()` | Clicks the Sign In button |
| `login(email, password)` | Fills both fields and clicks Sign In |
| `assertLoginSuccess()` | Asserts "Discover & Book Amazing Events" heading is visible |
| `assertLogoutVisible()` | Asserts Logout button is visible in the nav bar |
| `assertInvalidCredentialsError()` | Asserts "Invalid email or password" error text is visible |
| `assertStillOnLoginPage()` | Asserts URL contains `/login` and Sign In button is still visible |

Uses `SelfHealingLocator` from `Utils/self-healing-locators.ts` with 3 fallback strategies per field.

---

### `pages/RegisterPage.ts`

Wraps all interactions with the `/register` page.

| Method | What it does |
|--------|-------------|
| `navigate()` | Goes to `/register` |
| `register(email, password, confirmPassword?)` | Fills all fields and clicks Create Account |
| `assertRegistrationSuccess()` | Asserts Logout button is visible (user is logged in) |
| `assertPasswordRequirementsError()` | Asserts "Password does not meet the requirements below" |
| `assertPasswordMismatchError()` | Asserts "Passwords do not match" |
| `assertAlreadyRegisteredError()` | Asserts user stays on `/register` and Logout is NOT visible |

---

### `pages/AdminEventsPage.ts`

Wraps the Admin → Manage Events page. Handles full login + navigation + form interactions.

| Method | What it does |
|--------|-------------|
| `navigateAsAdmin(email, password)` | Logs in and navigates to Admin → Manage Events |
| `fillForm(data: EventFormData)` | Fills all provided event form fields |
| `submitForm()` | Clicks the `+ Add Event` button |
| `assertEventInTable(title)` | Asserts the event title appears as a table cell |
| `assertCategoryInRow(title, category)` | Asserts the correct category appears in the event's row |
| `assertAllRequiredFieldErrors()` | Asserts all 6 required field errors are visible |
| `assertOnlyTitleError()` | Asserts only the Title error is visible (others are not) |

**`EventFormData` interface:**
```typescript
{
  title?, category?, city?, venue?,
  date?, price?, seats?, description?, imageUrl?
}
```

---

### `pages/HomePage.ts`

Wraps assertions on the home page after successful login.

| Method | What it does |
|--------|-------------|
| `assertHeadingVisible()` | Asserts "Discover & Book Amazing Events" heading is visible |
| `assertLogoutVisible()` | Asserts Logout button is visible in the nav bar |

---

## Utilities

### `Utils/self-healing-locators.ts`

**Purpose:** Provides a `SelfHealingLocator` class that tries multiple CSS selector strategies in priority order. If the primary selector fails (e.g. element was renamed), it automatically falls back to the next strategy and logs a warning.

**How it works:**
```
Priority 1 → Try selector → Found? Use it.
                          → Not found? Try Priority 2
Priority 2 → Try selector → Found? Use it + log warning "[SelfHealing] Fell back to..."
                          → Not found? Try Priority 3
Priority 3 → Last resort
           → All failed? Throw error listing all attempted selectors
```

**Pre-built locator groups for EventHub:**

| Group | Elements covered |
|-------|-----------------|
| `LoginLocators` | emailInput, passwordInput, signInButton, logoutButton |
| `RegisterLocators` | emailInput, passwordInput, confirmPasswordInput, createAccountButton |
| `AdminEventLocators` | titleInput, cityInput, addEventButton |

**Used by:** `pages/LoginPage.ts`, `tests/Day4/self-healing.spec.ts` (when created)

---

## Test Files

### Day 1 — UI Locator Basics

#### `tests/Day1/example.spec.ts`
Default Playwright example test — verifies the Playwright documentation page has the correct title and a "Get started" link. Used to confirm the basic setup works.

#### `tests/Day1/ui.spec.ts`
Demonstrates all 6 Playwright locator strategies with real examples on the EventHub app and the AutomationPractice site.

| Test | Locator type | Where used |
|------|-------------|-----------|
| Locator 1 — Role | `getByRole()` | AutomationPractice radio buttons |
| Locator 2 — Label | `getByLabel()` | EventHub login form |
| Locator 3 — Placeholder | `getByPlaceholder()` | EventHub register form |
| Locator 4 — TestID | `getByTestId()` / attribute selector | AutomationPractice |
| Locator 5 — Text | `getByText()` | EventHub login page |
| Locator 6 — CSS | `locator('css')` | EventHub login form (last resort) |

---

### Day 2 — API Testing

#### `tests/Day2/API.spec.ts`
API contract test using **Zod schema validation** against a local development server (`http://localhost:8000`). Defines `AuthResponseSchema` with Zod and validates a registration response against it. Requires a local server to be running.

#### `tests/Day2/auth-test.spec.ts`
Demonstrates the **`loginApi` fixture** pattern. Three tests that use the fixture to get a token — the login happens automatically without writing registration code in the test.

#### `tests/Day2/events-api.spec.ts`
Tests the **GET /api/events** endpoint with 3 scenarios:
1. Valid token → 200 + schema validated against `EventsListSchema` (Zod)
2. No token → 401
3. Invalid token → 401

#### `tests/Day2/crud-api.spec.ts`
**8 API tests** covering all HTTP methods with Zod schema validation. Uses the `loginApi` fixture for authentication. Each test is fully independent.

| TC | Method | Endpoint | Validates |
|----|--------|----------|-----------|
| TC-1 | POST | `/auth/register` | 201 + `AuthResponseSchema` |
| TC-2 | POST | `/auth/login` | 200 + token returned |
| TC-3 | GET | `/events` | 200 + `EventsListResponseSchema` |
| TC-4 | GET | `/events/{id}` | 200 + `SingleEventResponseSchema` |
| TC-5 | POST | `/events` | 201 + created event matches sent data |
| TC-6 | PUT | `/events/{id}` | 200 + updated fields reflected |
| TC-7 | DELETE | `/events/{id}` | 200 + subsequent GET returns 404 |
| TC-8 | POST | `/bookings` | 201 + `BookingResponseSchema` |

---

### Day 3 — AI-Generated Tests

#### `tests/Day3_AI_generated/Eventhub_UI.spec.ts`
Original UI test file for Registration and Login flows. Written with raw Playwright selectors (no POM). Uses the `ui-fixture.ts` for the `appPage` fixture.

#### `tests/Day3_AI_generated/Eventhub_UI_POM.spec.ts`
**Refactored version** of `Eventhub_UI.spec.ts` using Page Object Models. Same test scenarios but all interactions go through `RegisterPage`, `LoginPage`, and `HomePage` classes instead of raw selectors.

#### `tests/Day3_AI_generated/generated_using_skills.spec.ts`
5 Admin Event Creation tests generated using `skills/playwright-test-writer/SKILL.md`. Written with raw Playwright selectors. Covers: create event, create with optional fields, empty form validation, single field error, category selection.

#### `tests/Day3_AI_generated/AdminEvents_POM.spec.ts`
**Refactored version** of `generated_using_skills.spec.ts` using the `AdminEventsPage` POM class. Same 5 test scenarios but all interactions go through `AdminEventsPage` methods.

#### `tests/Day3_AI_generated/ui-fixture.ts`
UI fixture file — provides the `appPage` fixture that navigates to `/` before each test. Imported by `Eventhub_UI.spec.ts` and `Eventhub_UI_POM.spec.ts`.

---

### Day 4 — Advanced Patterns

#### `tests/Day4/excel-reader.ts`
**Not a test file — a utility module.** Reads `test-cases.xlsx`, validates every row using a **Zod schema**, and returns typed `TestCase` objects. Used by `excel-driven.spec.ts`.

Key features:
- Uses `xlsx` library to read the Excel file
- Zod validates: `TestID`, `Module`, `TestName`, `Priority` (enum), `TestType` (enum), `ExpectedResult`
- Filters out rows where `Enabled` is not `TRUE`
- Parses `InputData` column from JSON string to object
- Also re-exports TypeScript types from `src/api-types.ts`

#### `tests/Day4/excel-driven.spec.ts`
**Data-driven test file** — reads all test cases from `test-cases.xlsx` and runs them dynamically. 19 test cases total (TC-001 to TC-019, TC-020 is disabled).

Three test groups:
- **UI Tests (13)** — Registration, Login, Admin Event Creation
- **API Tests (5)** — Auth register, login, events GET
- **E2E Tests (1)** — Full booking flow

How it works:
1. `loadTestCases()` reads and validates the Excel file
2. Tests are split by `TestType`: UI / API / E2E
3. Each test loops over its cases and runs the matching action block
4. Assertions are derived from the `ExpectedResult` column using pattern matching

#### `tests/Day4/test-cases.xlsx`
The Excel file containing 20 test case definitions. Columns:
`TestID | Module | TestName | Priority | InputData | Steps | ExpectedResult | TestType | Enabled`

Generated by `scripts/generate-test-cases.js`.

#### `tests/Day4/AIdriventypeAPI.spec.ts`
**Swagger-driven API tests.** Reads the OpenAPI spec at runtime and derives test names and expected status codes from it — nothing is hardcoded. 2 tests:
1. POST /auth/register — test name and `201` status come from the spec
2. GET /events — test name and `200` status come from the spec

`beforeAll` validates the entire spec using `SwaggerParser.validate()` before any test runs.

#### `tests/Day4/login-pom.spec.ts`
4 login tests using the `LoginPage` POM class. Demonstrates how POM methods replace raw selector calls in a spec file.

| Test | Method called |
|------|--------------|
| Valid login → home heading | `loginPage.login()` + `assertLoginSuccess()` |
| Valid login → logout visible | `loginPage.login()` + `assertLogoutVisible()` |
| Invalid login → error | `loginPage.login()` + `assertInvalidCredentialsError()` |
| Empty form → stays on login | `loginPage.clickSignIn()` + `assertStillOnLoginPage()` |

---

## Scripts

### `scripts/generate-test-cases.js`
Generates `tests/Day4/test-cases.xlsx` with 20 predefined test cases. Run once to create the Excel file.

```bash
node scripts/generate-test-cases.js
```

### `scripts/swagger-to-md.ts`
Reads `src/openapi.json`, parses every endpoint, and generates `docs/api-reference.md` — a human-readable API reference document with request body tables and response code tables.

```bash
npm run gen:docs
```

---

## Skills

AI prompt template files that tell AI tools (Claude, Copilot, Cursor) exactly how to generate tests for this project.

### `skills/playwright-test-writer/SKILL.md`
Rules for generating **UI tests**. Key rules:
- Use `getByRole()` first, then `getByLabel()`, `getByPlaceholder()`, etc.
- Always use AAA structure (Arrange / Act / Assert)
- Always add the review header
- Test names must follow `should [action] when [condition]`
- Import from `@playwright/test` not `playwright`

### `skills/api-test-writer/SKILL.md`
Rules for generating **API tests**. Key rules:
- Always define a Zod schema for every response
- Always use `safeParse()` never `parse()`
- Always use fresh credentials with `Date.now()` in the email
- Never hardcode tokens
- Status code reference table included

---

## Source Files

### `src/openapi.json`
The complete OpenAPI 3.0 specification for the EventHub API. Extracted from the live API's Swagger UI. Contains all endpoint definitions, request/response schemas, and status codes.

**Used by:**
- `npm run gen:types` → generates `src/api-types.ts`
- `npm run gen:docs` → generates `docs/api-reference.md`
- `tests/Day4/AIdriventypeAPI.spec.ts` → drives test assertions at runtime

### `src/api-types.ts`
**Auto-generated — do not edit manually.** TypeScript interfaces for every API request and response type, generated from `src/openapi.json` using `openapi-typescript`.

**Key types exported:**
- `AuthInput` — `{ email, password }`
- `AuthResponse` — `{ token, user: { id, email } }`
- `Event` — full event object
- `CreateEventInput` — fields needed to create an event
- `Booking` — full booking object
- `CreateBookingInput` — fields needed to create a booking

**Regenerate with:**
```bash
npm run gen:types
```

### `src/mcp-server.ts`
A minimal MCP (Model Context Protocol) server that allows Claude to interact with the project via tools. Currently exposes a basic `hello_world` tool. Run with `npm run mcp`.

---

## Docs

### `docs/api-reference.md`
**Auto-generated — do not edit manually.** Human-readable API documentation for all 10 EventHub endpoints. Generated from `src/openapi.json`.

**Regenerate with:**
```bash
npm run gen:docs
```

---

## CI/CD

### `.github/workflows/playwright.yml`
GitHub Actions pipeline that runs automatically on:
- Every push to `main` or `master`
- Every pull request targeting `main` or `master`
- Daily at 06:00 UTC (scheduled run)

**Pipeline steps:**
1. Checkout code
2. Setup Node.js 20 with npm cache
3. `npm ci` — install dependencies
4. `npx playwright install --with-deps` — install browsers
5. `npx playwright test` — run all tests
6. Upload HTML report as artifact (always runs, even if tests fail)

**Report artifact:** `playwright-report-{run_number}` — retained for 30 days. Download from the GitHub Actions run page to view the full HTML report with screenshots.

---

## NPM Scripts

| Command | What it does |
|---------|-------------|
| `npm run gen:types` | Regenerates `src/api-types.ts` from `src/openapi.json` |
| `npm run gen:docs` | Regenerates `docs/api-reference.md` from `src/openapi.json` |
| `npm run test:all` | Runs all projects (all days) |
| `npm run test:day4` | Runs Day 4 tests only |
| `npm run test:ui` | Runs Chromium + Firefox UI tests (Day 3) |
| `npm run test:api` | Runs API project tests |
| `npm run mcp` | Starts the MCP server |

---

## How to Run Tests

### Install everything (first time only)
```bash
npm install
npx playwright install --with-deps
```

### Run by day
```bash
npx playwright test --project=day1    # Day 1 — locators
npx playwright test --project=day2    # Day 2 — API tests
npx playwright test --project=ui-chromium  # Day 3 — Chrome
npx playwright test --project=ui-firefox   # Day 3 — Firefox
npx playwright test --project=day4    # Day 4 — advanced patterns
npx playwright test --project=day5    # Day 5 — E2E flows
```

### Run a specific file
```bash
npx playwright test --project=day2 tests/Day2/crud-api.spec.ts
npx playwright test --project=day4 tests/Day4/excel-driven.spec.ts
```

### Run a specific test by name
```bash
npx playwright test -g "should return 201"
```

### Run everything
```bash
npm run test:all
```

### View HTML report
```bash
npx playwright show-report
```

---

## Key Concepts Used in This Project

| Concept | Where to see it |
|---------|----------------|
| Locator strategies (Role, Label, Placeholder, Text, CSS) | `tests/Day1/ui.spec.ts` |
| API testing with status + body assertions | `tests/Day2/events-api.spec.ts` |
| Zod schema validation on API responses | `tests/Day2/crud-api.spec.ts` |
| Custom fixtures | `fixtures/api-fixtures.ts`, `ui-fixture.ts` |
| Page Object Model | `pages/` folder + `*_POM.spec.ts` files |
| Self-healing locators | `Utils/self-healing-locators.ts` |
| Data-driven testing from Excel | `tests/Day4/excel-driven.spec.ts` |
| Swagger/OpenAPI driven tests | `tests/Day4/AIdriventypeAPI.spec.ts` |
| Auto-generated TypeScript types | `src/api-types.ts` |
| AI skill templates | `skills/` folder |
| GitHub Actions CI | `.github/workflows/playwright.yml` |
