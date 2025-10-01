import { NextResponse } from "next/server";
import { getDb, getStorage } from "@/lib/firebase-admin";

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const category = formData.get("category") as string | null;
    const section = formData.get("section") as string | null;
    const documentName = formData.get("documentName") as string | null;
    const documentFile = formData.get("document") as File | null;

    // --- Validation ---
    if (!category || !section || !documentName || !documentFile) {
      return NextResponse.json(
        { success: false, error: "Missing form data. All fields are required." },
        { status: 400 }
      );
    }

    if (documentFile.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: `File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.` },
        { status: 400 }
      );
    }

    if (!ALLOWED_FILE_TYPES.includes(documentFile.type)) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Only PDF, Word, and Excel documents are allowed." },
        { status: 400 }
      );
    }

    // Sanitize file name
    const safeName = documentFile.name.replace(/[^\w.-]/g, "_");

    // 1. Upload to Firebase Storage
    const storage = getStorage();
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
    const db = getDb();
    const firestore = db;
    const docRef = firestore.collection("documents").doc();
    await docRef.set({
      name: documentName,
      category,
      section,
      fileName: documentFile.name,
      storagePath: filePath,
      downloadURL,
      type: documentFile.type,
      size: documentFile.size,
      lastUpdated: new Date().toISOString(),
      version: "1.0",
    });

    return NextResponse.json(
      { success: true, data: { message: "File uploaded and indexed successfully." } },
      { status: 200 }
    );
  } catch (e: unknown) {
    console.error("Upload API Error:", e);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred on the server." },
      { status: 500 }
    );
  }
}
