
import { test, expect } from "@playwright/test";

test.describe("Admin Document Upload Success", () => {
  test("should successfully upload a PDF document", async ({ page }) => {
    // Navigate to the document upload page
    await page.goto("/admin/document-upload");

    // Fill out the form
    await page.getByLabel("Category").selectOption("Safety");
    await page.getByLabel("Section").fill("E2E Test Section");
    await page.getByLabel("Document Name").fill("E2E Test Document");

    // Upload a file
    await page.getByLabel("Document File").setInputFiles("e2e/fixtures/test-document.pdf");

    // Submit the form
    await page.getByRole("button", { name: /Upload Document/i }).click();

    // Wait for the success toast to appear and verify its content
    const successToast = page.locator("text=Upload Successful");
    await expect(successToast).toBeVisible();

    const toastDescription = page.locator("text=test-document.pdf has been processed.");
    await expect(toastDescription).toBeVisible();
  });
});

    