# Prompt Library — EventHub Playwright Tests

A curated set of prompts for generating Playwright TypeScript tests on this project.
Always pair with `skills/playwright-test-writer/SKILL.md` for consistent output.

---

## How to use these prompts

Paste the skill content or reference the file path first, then append the prompt below.

**With Claude Code (auto-reads AGENT.md):**
> Just paste the prompt directly — AGENT.md instructs Claude to read SKILL.md first.

**With any other AI tool:**
> "Read `skills/playwright-test-writer/SKILL.md` first. Then: [prompt]"

---

## Prompt 1 — UI Happy Path (Auth Flow)

**Use when:** generating login or registration tests for new user journeys.

```
Read skills/playwright-test-writer/SKILL.md first.

Generate a Playwright TypeScript test file for the following scenario:
- Feature: [Login / Registration]
- App URL: https://eventhub.rahulshettyacademy.com
- The test user must be created via beforeAll using POST https://api.eventhub.rahulshettyacademy.com/api/auth/register with { email, password }
- Use getByLabel() for login form fields (Email and Password labels are properly associated)
- Use getByPlaceholder() for register form fields (labels are not associated in HTML)
- After successful login, assert the heading "Discover & Book Amazing Events" is visible
- After successful registration, assert the "Logout" button is visible
- Place the file under tests/Day3_AI_generated/
```

**Example output:** `tests/Day3_AI_generated/Eventhub_UI.spec.ts`

---

## Prompt 2 — Admin CRUD Tests

**Use when:** generating tests for any admin panel operation (events, bookings).

```
Read skills/playwright-test-writer/SKILL.md first.

Generate 5 Playwright TypeScript tests for the following admin feature:
- Feature: [Create / Edit / Delete] [Event / Booking] from the Admin menu
- Login flow: POST /api/auth/register in beforeAll, then UI login in beforeEach
- Admin menu: click the "Admin" button in getByRole('navigation'), then click the relevant link
- Use getByRole() selectors for all form fields (Title*, City*, Venue*, Category*, Price ($)*, Total Seats*)
- Use test.describe.configure({ mode: 'serial' }) to prevent parallel conflicts
- Cover: happy path, optional fields, empty form validation, single field validation, and one business-rule case
- Place the file under tests/Day3_AI_generated/
```

**Example output:** `tests/Day3_AI_generated/generated_using_skills.spec.ts`

---

## Prompt 3 — API Contract Tests with Zod

**Use when:** generating API tests that validate response shape and status codes.

```
Read skills/playwright-test-writer/SKILL.md first.

Generate a Playwright TypeScript API test file for the following endpoint:
- Endpoint: [METHOD] [path] (e.g. POST /api/auth/login)
- Base URL: https://api.eventhub.rahulshettyacademy.com
- Use Zod to define the expected response schema
- Cover: 200 success with valid payload, 4xx with invalid payload, response schema validation
- Use the request fixture directly — no browser needed
- Place the file under tests/Day2/
- The Playwright project name is "api" — no browser config needed
```

**Example output:** `tests/Day2/API.spec.ts`

---

## Prompt 4 — Validation & Error Message Tests

**Use when:** the form has required fields and inline error messages to verify.

```
Read skills/playwright-test-writer/SKILL.md first.

Generate Playwright tests that verify form validation for [form name] at [URL].
For each test:
- Submit the form with one or more fields missing or invalid
- Assert the exact error message text that appears (e.g. "Title is required")
- Assert that other error messages do NOT appear when only one field is invalid
- Do not assert toBeDisabled() on submit buttons — this app shows errors after submit, not by disabling the button
- Use getByText() for error message assertions
- Place the file under tests/Day3_AI_generated/
```

---

## Prompt 5 — Cross-Browser Regression Suite

**Use when:** adding a new feature and want Chromium + Firefox coverage in one go.

```
Read skills/playwright-test-writer/SKILL.md first.

Generate a Playwright TypeScript regression test file for the [feature name] feature.
Requirements:
- The file must work under both the ui-chromium and ui-firefox projects in playwright.config.ts
  (testMatch: **/Day3_AI_generated/**/*.spec.ts covers both automatically)
- Cover the 3 most important user journeys: [journey 1], [journey 2], [journey 3]
- Use serial mode if tests share state; use parallel mode if each test is independent
- Seed any required test data via the REST API in beforeAll (not via UI)
- Use only getByRole() and getByLabel() selectors — no CSS, no XPath
- Place the file under tests/Day3_AI_generated/
```

---

## Quick-reference: key selectors for this app

| Element | Correct selector |
|---------|-----------------|
| Login — Email field | `getByLabel('Email')` |
| Login — Password field | `getByLabel('Password')` |
| Register — Email field | `getByPlaceholder('you@email.com')` |
| Register — Password field | `getByPlaceholder('Min 8 chars, uppercase, number & symbol')` |
| Register — Confirm Password | `getByPlaceholder('Repeat your password')` |
| Admin dropdown | `getByRole('button', { name: 'Admin' })` |
| Admin → Manage Events | `getByRole('navigation').getByRole('link', { name: 'Manage Events' })` |
| Event Title field | `getByRole('textbox', { name: 'Title*' })` |
| Event Category dropdown | `getByRole('combobox', { name: 'Category*' })` |
| Event Price field | `getByRole('spinbutton', { name: 'Price ($)*' })` |
| Event Seats field | `getByRole('spinbutton', { name: 'Total Seats*' })` |
| Submit new event | `getByRole('button', { name: '+ Add Event' })` |
