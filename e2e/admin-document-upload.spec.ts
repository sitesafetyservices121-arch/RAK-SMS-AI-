
import { test, expect } from '@playwright/test';

test.describe('Admin Document Upload', () => {
  test('should upload a document successfully', async ({ page }) => {
    // Navigate to the document upload page
    await page.goto('/admin/document-upload');

    // Fill out the form
    await page.selectOption('select[name="category"]', 'Safety');
    await page.fill('input[placeholder="Select or create a section..."]', 'Test Section');
    await page.fill('input[name="documentName"]', 'Test Document');

    // Upload a file
    await page.setInputFiles('input[type="file"]', 'e2e/fixtures/test-document.txt');

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for the success toast to appear
    const toast = await page.waitForSelector('[data-testid="toast"]');
    const toastText = await toast.textContent();

    // Assert that the toast message is correct
    expect(toastText).toContain('Upload Successful');
    expect(toastText).toContain('test-document.txt has been processed.');
  });
});
