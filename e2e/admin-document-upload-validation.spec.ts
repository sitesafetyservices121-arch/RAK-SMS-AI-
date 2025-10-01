
import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

const TEST_FILE_PDF = "e2e/fixtures/test-document.pdf";
const TEST_FILE_TXT = "e2e/fixtures/test-document.txt";
const LARGE_FILE_NAME = "e2e/fixtures/large-file.pdf";
const LARGE_FILE_SIZE_MB = 11;
const MAX_FILE_SIZE_MB = 10; // This constant was missing

// Create a dummy large file for testing the size validation
const createLargeFile = () => {
  const buffer = Buffer.alloc(LARGE_FILE_SIZE_MB * 1024 * 1024, "a");
  fs.writeFileSync(LARGE_FILE_NAME, buffer);
};

// Delete the large file after tests are done
const cleanupLargeFile = () => {
  if (fs.existsSync(LARGE_FILE_NAME)) {
    fs.unlinkSync(LARGE_FILE_NAME);
  }
};

test.describe("Admin Document Upload with Validation", () => {
  test.beforeAll(() => {
    createLargeFile();
  });

  test.afterAll(() => {
    cleanupLargeFile();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/document-upload");
  });

  test("should show an error for invalid file type", async ({ page }) => {
    await page.getByLabel("Category").selectOption("Safety");
    await page.getByLabel("Section").fill("Invalid Type Test");
    await page.getByLabel("Document Name").fill("Text File Upload");
    await page.getByLabel("Document File").setInputFiles(TEST_FILE_TXT);

    const errorMessage = page.getByText(
      "Invalid file type. Only PDF, Word, or Excel files are allowed."
    );
    await expect(errorMessage).toBeVisible();

    // Also check that the submit button is disabled or the form doesn't submit
    const submitButton = page.getByRole("button", { name: /Upload Document/i });
    await submitButton.click();

    // The error message should still be visible, and no success toast should appear
    await expect(errorMessage).toBeVisible();
    const successToast = page.locator(
      "text=Upload Successful"
    );
    await expect(successToast).not.toBeVisible();
  });

  test("should show an error for a file that is too large", async ({
    page,
  }) => {
    await page.getByLabel("Category").selectOption("Safety");
    await page.getByLabel("Section").fill("Large File Test");
    await page.getByLabel("Document Name").fill("Large PDF Upload");
    await page.getByLabel("Document File").setInputFiles(LARGE_FILE_NAME);

    const errorMessage = page.getByText(
      `File size must be less than ${MAX_FILE_SIZE_MB}MB.`
    );
    await expect(errorMessage).toBeVisible();
  });

  test("should upload a valid document successfully", async ({ page }) => {
    await page.getByLabel("Category").selectOption("Quality");
    await page.getByLabel("Section").fill("Successful Upload Test");
    await page.getByLabel("Document Name").fill("Valid PDF Upload");
    await page.getByLabel("Document File").setInputFiles(TEST_FILE_PDF);

    // Check that there are no validation errors
    const errorMessages = page.locator(".text-destructive");
    await expect(errorMessages).toHaveCount(0);

    await page.getByRole("button", { name: /Upload Document/i }).click();

    const successToast = page.locator("text=Upload Successful");
    await expect(successToast).toBeVisible();
  });
});
