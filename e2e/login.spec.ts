import { test, expect } from '@playwright/test';

test('should navigate to the login page and render the form', async ({ page }) => {
  await page.goto('/login');
  await expect(page.locator('form')).toBeVisible();
  await expect(page.locator('input[name="email"]')).toBeVisible();
  await expect(page.locator('input[name="password"]')).toBeVisible();
});
