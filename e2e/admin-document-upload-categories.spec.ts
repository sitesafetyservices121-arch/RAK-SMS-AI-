import { test, expect } from '@playwright/test';

test.describe('Admin Document Upload Categories', () => {
  test.beforeEach(async ({ page }) => {
    // Assuming there's a login page or a way to directly access the admin document upload
    // For now, we'll navigate directly to the document upload page.
    // In a real scenario, you'd likely have a login step here.
    await page.goto('/admin/document-upload');
    // Mock authentication if necessary for Playwright
    // await page.evaluate(() => {
    //   localStorage.setItem('token', 'mock-token');
    // });
  });

  test('should display all required categories in the dropdown', async ({ page }) => {
    await page.locator('label:has-text("Category")').click();
    
    const expectedCategories = ['Safety', 'Quality', 'HR', 'Environment', 'Toolbox Talks'];

    for (const category of expectedCategories) {
      await expect(page.locator(`div[role='option']:has-text("${category}")`)).toBeVisible();
    }
  });

  test('should allow selecting a category', async ({ page }) => {
    const categoryToSelect = 'Safety';

    await page.locator('label:has-text("Category")').click();
    await page.locator(`div[role='option']:has-text("${categoryToSelect}")`).click();

    await expect(page.locator('input[name="category"]')).toHaveValue(categoryToSelect);
  });
});