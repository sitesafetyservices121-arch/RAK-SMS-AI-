
import { NextResponse, NextRequest } from "next/server";
import { db, storage, auth as adminAuth } from "@/lib/firebase-admin";
import { headers } from "next/headers";

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const authHeader = headersList.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Missing Authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.split("Bearer ")[1];


    await adminAuth.verifyIdToken(token);

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
        {
          success: false,
          error: `File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`,
        },
        { status: 400 }
      );
    }

    const mimeType = documentFile.type || "application/octet-stream";
    if (!ALLOWED_FILE_TYPES.includes(mimeType)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid file type. Only PDF, Word, and Excel documents are allowed.",
        },
        { status: 400 }
      );
    }

    // Sanitize file name
    const safeName = documentFile.name.replace(/[^\w.-]/g, "_");

    // 1. Upload to Firebase Storage
    const bucket = storage.bucket();
    const filePath = `documents/${category}/${section}/${Date.now()}-${safeName}`;
    const fileUpload = bucket.file(filePath);

    const arrayBuffer = await documentFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await fileUpload.save(buffer, {
      metadata: { contentType: mimeType },
    });

    await fileUpload.makePublic();
    const downloadURL = fileUpload.publicUrl();

    // 2. Save metadata to Firestore
    const docRef = db.collection("documents").doc();
    await docRef.set({
      name: documentName,
      category,
      subCategory: section,
      fileName: documentFile.name,
      storagePath: filePath,
      downloadURL,
      type: mimeType,
      size: documentFile.size,
      lastUpdated: new Date().toISOString(),
      version: "1.0",
    });

    return NextResponse.json(
      {
        success: true,
        data: { message: "File uploaded and indexed successfully." },
      },
      { status: 200 }
    );
  } catch (e: any) {
    console.error("Upload API Error:", e);
    if (e.code === "auth/id-token-expired" || e.code === "auth/argument-error") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    console.error("Full error object:", JSON.stringify(e, null, 2));
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred on the server." },
      { status: 500 }
    );
  }
}

    