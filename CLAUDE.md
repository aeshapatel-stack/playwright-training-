# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies and browsers
npm install
npx playwright install --with-deps

# Run all tests
npx playwright test

# Run a specific test file
npx playwright test tests/Day1/ui.spec.ts

# Run tests for a specific project
npx playwright test --project=api
npx playwright test --project=ui-chromium
npx playwright test --project=ui-firefox

# Run tests matching a pattern
npx playwright test -g "should login"

# Open HTML test report
npx playwright show-report

# Run the MCP server
npm run mcp
```

## Architecture

**Test projects** (defined in `playwright.config.ts`):
- `api` — matches `**/api/**/*.spec.ts`; no browser, hits `https://api.eventhub.rahulshettyacademy.com/`
- `ui-chromium` / `ui-firefox` — matches Day3 tests; `baseURL` is `https://eventhub.rahulshettyacademy.com/`

**Fixture layer** (`fixtures/api-fixtures.ts`): Exports a custom `test` that extends the base Playwright test with a `loginApi` fixture. This fixture performs a POST login, then provides `{ token, userId }` to consuming tests. Day2 `auth-test.spec.ts` uses this instead of `@playwright/test` directly.

**Test organization** by learning day:
- `tests/Day1/` — basic navigation and element interaction
- `tests/Day2/` — API testing with Zod schema validation; a local server at `http://localhost:8000` is required for `API.spec.ts`
- `tests/Day3_AI_generated/` — full UI auth flows (register, login, validation); ships its own `ui-fixture.ts` which provides an `appPage` fixture that navigates to the base URL on setup

**Schema validation**: `tests/Day2/API.spec.ts` uses `zod` to define expected response shapes and asserts API responses against them.

**MCP server** (`src/mcp-server.ts`): Minimal stub for Claude integration via stdio transport; currently exposes only a `hello_world` tool.

**CI** (`.github/workflows/playwright.yml`): Runs on push/PR to `main`/`master`. Uses `ubuntu-latest`, installs LTS Node, runs `npx playwright install --with-deps`, then `npx playwright test`. Uploads the HTML report as an artifact (30-day retention). Workers are set to `1` in CI to avoid flakiness.
