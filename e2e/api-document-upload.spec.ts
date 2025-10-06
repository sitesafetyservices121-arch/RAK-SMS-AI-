import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test('should upload a document through the API', async ({ request }) => {
  const filePath = path.resolve(__dirname, 'fixtures/test-document.pdf');
  const file = fs.readFileSync(filePath);

  const response = await request.post('/admin/document-upload', {
    multipart: {
      category: 'Safety',
      section: 'E2E Test Section',
      documentName: 'E2E Test Document',
      file: {
        name: 'test-document.pdf',
        mimeType: 'application/pdf',
        buffer: file,
      },
    },
  });

  expect(response.ok()).toBeTruthy();
});
