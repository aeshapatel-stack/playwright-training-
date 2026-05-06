# skills/playwright-test-writer/SKILL.md
 
## What this skill does
Generates production-ready Playwright TypeScript test files for our application.
Read this file in full before writing any test code.
 
## Non-negotiable rules
1. ALWAYS use getByRole() or getByLabel() as the first-choice selector.
   Never use CSS classes or XPath unless all other options are exhausted.
2. ALWAYS wrap each test file in test.describe() with a meaningful name.
3. ALWAYS add the review header at the top of every generated file:
   /* AI-GENERATED — Review required | Engineer: [name] | Date: [YYYY-MM-DD] */
4. NEVER hard-code URLs — use process.env.BASE_URL or the baseURL config.
5. ALWAYS follow AAA structure: Arrange → Act → Assert with blank lines between.
6. ALWAYS import from '@playwright/test', never from 'playwright' directly.
7. Test names MUST follow: 'should [action] when [condition]'.
8. DB tests MUST use the db.fixture.ts and rely on ROLLBACK — never commit.
9. Always add comments for all functions and complex logic — assume the reviewer is not familiar with the code.
## Selector priority order (follow strictly)
1. getByRole()        — best, tied to accessibility
2. getByLabel()       — form fields
3. getByPlaceholder() — inputs without a label
4. getByTestId()      — use data-testid attributes
5. getByText()        — for visible text content
6. locator('css')     — last resort only
 
## Output format
Return ONLY the TypeScript file content.
No explanations, no markdown fences, no preamble — just the file.
 
## Worked example
INPUT: 'Test that an admin can delete a user and the user disappears from the list'
 
OUTPUT:
/* AI-GENERATED — Review required | Engineer: | Date: */
import { test, expect } from '@playwright/test';
import { test as dbTest } from '../fixtures/db.fixture';
 
test.describe('Admin User Management', () => {
  test('should remove user from list when admin deletes them', async ({ page }) => {
    // Arrange
    await page.goto('/admin/users');
    const targetRow = page.getByRole('row', { name: 'jane@example.com' });
    await expect(targetRow).toBeVisible();
 
    // Act
    await targetRow.getByRole('button', { name: 'Delete' }).click();
    await page.getByRole('button', { name: 'Confirm' }).click();
 
    // Assert
    await expect(targetRow).not.toBeVisible();
  });
});


