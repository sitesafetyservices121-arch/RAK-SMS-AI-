import { NextResponse } from "next/server";
import { createSdsDocument, listSdsDocuments } from "@/lib/sds-service";
import type { SdsDocument } from "@/types/sds";
import { storage } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const documents = await listSdsDocuments();
    return NextResponse.json({ success: true, data: documents });
  } catch (error) {
    console.error("Failed to fetch SDS documents", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch SDS documents" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productName, supplier, revisionDate, fileName, fileType, fileBase64, uploadedBy } =
      body as {
        productName: string;
        supplier: string;
        revisionDate?: string;
        fileName: string;
        fileType: string;
        fileBase64: string;
        uploadedBy?: string;
      };

    if (!productName || !supplier || !fileName || !fileBase64) {
      return NextResponse.json(
        { success: false, error: "Missing required SDS fields" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(fileBase64, "base64");
    const bucket = storage.bucket();
    const filePath = `sds/${Date.now()}-${fileName}`;
    const file = bucket.file(filePath);
    await file.save(buffer, { contentType: fileType ?? "application/pdf" });
    const fileUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    const saved = await createSdsDocument({
      productName,
      supplier,
      revisionDate: revisionDate ?? new Date().toISOString().split("T")[0],
      fileUrl,
      uploadedBy: uploadedBy ?? "system",
    });
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error) {
    console.error("Failed to create SDS document", error);
    return NextResponse.json(
      { success: false, error: "Failed to create SDS document" },
      { status: 500 }
    );
  }
}
