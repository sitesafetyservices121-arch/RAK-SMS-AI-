import { test, expect } from '@playwright/test';

test.describe('Login functionality', () => {
  test('should allow an admin user to log in', async ({ page }) => {
    await page.goto('/login');

    // Replace with admin credentials
    await page.fill('input[name="email"]', 'ruan@sitesafety.services');
    await page.fill('input[name="password"]', '50700Koen*');

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
  });

  test('should allow a client user to log in', async ({ page }) => {
    await page.goto('/login');

    // Replace with client credentials
    await page.fill('input[name="email"]', 'info@sitesafety.services');
    await page.fill('input[name="password"]', '50700Koen*');

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
  });
});
