"use server";

import { db, storage } from "@/lib/firebase-admin";

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export async function uploadDocumentAction(formData: FormData) {
  try {
    const category = formData.get("category") as string | null;
    const section = formData.get("section") as string | null;
    const documentName = formData.get("documentName") as string | null;
    const documentFile = formData.get("document") as File | null;

    // --- Validation ---
    if (!category || !section || !documentName || !documentFile) {
      return {
        success: false,
        error: "Missing form data. All fields are required.",
      };
    }

    if (documentFile.size > MAX_FILE_SIZE_BYTES) {
      return {
        success: false,
        error: `File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`,
      };
    }

    if (!ALLOWED_FILE_TYPES.includes(documentFile.type)) {
      return {
        success: false,
        error: "Invalid file type. Only PDF, Word, and Excel documents are allowed.",
      };
    }

    // Sanitize file name
    const safeName = documentFile.name.replace(/[^\w.-]/g, "_");

    // 1. Upload to Firebase Storage
    const bucket = storage.bucket();
    const filePath = `documents/${category}/${section}/${Date.now()}-${safeName}`;
    const fileUpload = bucket.file(filePath);

    const buffer = Buffer.from(await documentFile.arrayBuffer());

    await fileUpload.save(buffer, {
      metadata: {
        contentType: documentFile.type,
      },
    });

    await fileUpload.makePublic();
    const downloadURL = fileUpload.publicUrl();

    // 2. Save metadata to Firestore
    const firestore = db;
    const docRef = firestore.collection("documents").doc();
    await docRef.set({
      name: documentName,
      category,
      section,
      fileName: documentFile.name, // Keep original name for metadata
      storagePath: filePath, // Store the path for future reference
      downloadURL,
      type: documentFile.type,
      size: documentFile.size,
      lastUpdated: new Date().toISOString(),
      version: "1.0",
    });

    return {
      success: true,
      data: { message: "File uploaded and indexed successfully." },
    };
  } catch (e: unknown) {
    console.error("Upload Action Error:", e);
    // Type guard for Firebase errors
    if (typeof e === "object" && e !== null && "code" in e) {
      const errorCode = (e as { code: string }).code;
      if (errorCode === "storage/unauthorized") {
        return {
          success: false,
          error: "Permission denied. You are not authorized to upload files.",
        };
      }
      if (errorCode === "storage/object-not-found") {
        return {
          success: false,
          error: "File not found during upload process.",
        };
      }
    }
    // Generic error for other cases
    return {
      success: false,
      error: "An unexpected error occurred on the server.",
    };
  }
}

