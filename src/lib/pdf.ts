// ==============================
// PDF Metadata Registration
// ==============================
// This is a server-side module that logs metadata for generated PDFs.
// PDFs can be created client-side (AI tools) or queued by admins (HTML → PDF).
// ==============================

"use server";

import * as admin from "firebase-admin";
import { db, auth } from "@/lib/firebase-admin";

// ------------------------------
// Types
// ------------------------------

/**
 * Metadata for registering an already-generated PDF.
 */
export type PdfMetadata = {
  fileName: string;
  userId: string;
  documentType: string;
  storagePath: string; // Path in Firebase Storage
  metadata?: Record<string, any>;
};

/**
 * Request for generating a PDF (admin flow).
 */
export type PdfRequest = {
  template: "default";
  fileName: string;
  html: string;
  userId: string;
  documentType: string;
  createdAt: FirebaseFirestore.FieldValue;
  metadata: Record<string, any>;
};

// ------------------------------
// Client Flow (AI tool → PDF → Storage → Firestore log)
// ------------------------------

/**
 * Register metadata for a client-generated PDF.
 * Called after the PDF is uploaded to Firebase Storage.
 */
export async function registerPdfMetadata({
  fileName,
  userId,
  documentType,
  storagePath,
  metadata = {},
}: PdfMetadata): Promise<{ storagePath: string }> {
  try {
    const userRecord = await auth.getUser(userId);

    await db.collection("generatedDocuments").add({
      fileName,
      documentType,
      storagePath,
      userId,
      generatedOn: new Date().toISOString(),
      generatedBy: userRecord.displayName || userRecord.email,
      ...metadata,
    });

    return { storagePath };
  } catch (error) {
    console.error("❌ Error registering PDF metadata:", error);
    throw new Error("Failed to register PDF metadata.");
  }
}

// ------------------------------
// Admin Flow (optional future use)
// ------------------------------

/**
 * Create a PDF generation request in Firestore.
 * This can be consumed by a PDF generator extension or worker.
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
          <div class="header">AI Generated Document | Generated for: ${
            userRecord.displayName || userRecord.email
          } on ${new Date().toLocaleDateString()}</div>
          ${htmlContent}
          <div class="footer">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>
      </body>
      </html>
    `;

    const storagePath = `documents/generated/${userId}/${fileName}`;

    const requestData: PdfRequest = {
      template: "default",
      fileName,
      html: fullHtml,
      userId,
      documentType,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      metadata: {
        ...metadata,
        generatedBy: userRecord.displayName || userRecord.email,
        storagePath,
      },
    };

    await db.collection("pdfRequests").add(requestData);

    return { storagePath };
  } catch (error) {
    console.error("❌ Error creating PDF request:", error);
    throw new Error("Failed to initiate PDF generation.");
  }
}
