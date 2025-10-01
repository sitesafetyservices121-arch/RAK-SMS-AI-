"use server";

import { db, storage } from "@/lib/firebase-admin";

export async function uploadDocumentAction(formData: FormData) {
  try {
    const category = formData.get("category") as string | null;
    const section = formData.get("section") as string | null;
    const documentName = formData.get("documentName") as string | null;
    const documentFile = formData.get("document") as File | null;

    if (!category || !section || !documentName || !documentFile) {
      throw new Error("Missing form data. All fields are required.");
    }

    // 1. Upload to Firebase Storage
    const bucket = await storage.bucket(); // ✅ now a Bucket
    const filePath = `documents/${category}/${section}/${Date.now()}-${documentFile.name}`;
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
    const firestore = await db;
    const docRef = firestore.collection("documents").doc();
    await docRef.set({
      id: docRef.id,
      name: documentName,
      category,
      section,
      fileName: documentFile.name,
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
  } catch (e: any) {
    console.error("Upload Action Error:", e);
    return {
      success: false,
      error: e.message || "An unknown error occurred.",
    };
  }
}
