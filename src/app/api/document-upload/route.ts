// src/app/api/document-upload/route.ts
import { NextResponse, NextRequest } from "next/server";
import { db, storage, Timestamp } from "@/lib/firebase-admin";
import { Readable } from "stream";

// This function handles the file upload POST request.
// It uses request.formData() to correctly handle multipart/form-data.
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("document") as File | null;
    const category = formData.get("category") as string;
    const section = formData.get("section") as string;
    const documentName = formData.get("documentName") as string;

    if (!file || !category || !section || !documentName) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const storagePath = `document-library/${category}/${section}/${file.name}`;
    const bucket = storage.bucket();
    const fileRef = bucket.file(storagePath);

    // Convert blob to buffer to stream it to Firebase Storage
    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = Readable.from(buffer);

    // Stream the upload to Firebase Storage
    await new Promise<void>((resolve, reject) => {
        const writeStream = fileRef.createWriteStream({
            metadata: {
                contentType: file.type,
            },
        });
        stream.pipe(writeStream)
            .on('error', (err) => reject(err))
            .on('finish', () => resolve());
    });
    
    // Get a public, long-lived URL for the file
    const [downloadURL] = await fileRef.getSignedUrl({
      action: 'read',
      expires: '03-09-2491' // A date far in the future
    });

    // Save document metadata to Firestore
    const docRef = db.collection("documents").doc();
    const newDocument = {
      id: docRef.id,
      name: documentName,
      fileName: file.name,
      category: category,
      section: section,
      version: "1.0",
      type: file.type,
      size: file.size,
      downloadURL: downloadURL,
      storagePath: storagePath,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await docRef.set(newDocument);

    return NextResponse.json({
      success: true,
      data: {
        message: "Document uploaded and metadata saved successfully.",
        document: newDocument,
      },
    });
  } catch (error: unknown) {
    console.error("🔥 Document Upload API Error:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
