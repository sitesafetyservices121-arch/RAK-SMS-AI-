// src/lib/pdf.ts
'use server';

import * as admin from 'firebase-admin';
import { db, auth } from '@/lib/firebase-admin';

type PdfRequest = {
  template: 'default';
  fileName: string;
  html: string;
  userId: string;
  documentType: string;
  createdAt: FirebaseFirestore.FieldValue;
  metadata: Record<string, any>;
};

/**
 * Creates a PDF generation request in Firestore.
 * This will be picked up by the "PDF Generator" Firebase Extension.
 *
 * @param {string} userId - The ID of the user requesting the PDF.
 * @param {string} documentType - The type of document being generated (e.g., 'she-plan').
 * @param {string} fileName - The desired filename for the PDF.
 * @param {string} htmlContent - The core HTML content to be rendered in the PDF.
 * @param {Record<string, any>} metadata - Additional data to store with the request.
 * @returns {Promise<{ storagePath: string }>} The future storage path of the PDF.
 */
export async function generatePdfRequest(
  userId: string,
  documentType: string,
  fileName: string,
  htmlContent: string,
  metadata: Record<string, any>
): Promise<{ storagePath: string }> {
  try {
    const userRecord = await auth.getUser(userId);

    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body { font-family: 'Helvetica', sans-serif; font-size: 11px; color: #333; }
              h1, h2, h3 { color: #FF7733; }
              h1 { font-size: 24px; border-bottom: 2px solid #F0F0F0; padding-bottom: 10px; }
              h2 { font-size: 18px; }
              pre { background-color: #F0F0F0; padding: 10px; border-radius: 5px; white-space: pre-wrap; font-family: 'Courier New', monospace; }
              .header, .footer { text-align: center; font-size: 9px; color: #777; }
              .header { margin-bottom: 20px; }
              .footer { margin-top: 20px; }
          </style>
      </head>
      <body>
          <div class="header">RAK-SMS AI Generated Document | Generated for: ${
            userRecord.displayName || userRecord.email
          } on ${new Date().toLocaleDateString()}</div>
          ${htmlContent}
          <div class="footer">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>
      </body>
      </html>
    `;

    const docRef = db.collection('pdfRequests').doc();
    const storagePath = `documents/generated/${userId}/${fileName}`;

    const requestData: PdfRequest = {
      template: 'default',
      fileName,
      html: fullHtml,
      userId,
      documentType,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      metadata: {
        ...metadata,
        generatedBy: userRecord.displayName || userRecord.email,
        storagePath: storagePath,
      },
    };

    await docRef.set(requestData);

    // Save metadata to the generatedDocuments collection for easier querying
    await db.collection('generatedDocuments').add({
      clientCompanyId: metadata.clientName || 'N/A', // Adjust as needed
      documentType,
      generatedOn: new Date().toISOString(),
      fileName,
      storagePath,
      userId,
    });
    
    return { storagePath };
  } catch (error) {
    console.error('Error creating PDF request:', error);
    throw new Error('Failed to initiate PDF generation.');
  }
}
