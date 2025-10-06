import { NextResponse } from "next/server";
import { db, Timestamp } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    const { reportId, documentType = "Site Resource Report", userId = "system" } =
      await request.json();

    if (!reportId) {
      return NextResponse.json(
        { success: false, error: "reportId is required" },
        { status: 400 }
      );
    }

    await db.collection("generatedDocuments").add({
      fileName: `${reportId}.pdf`,
      documentType,
      storagePath: `generated/${reportId}.pdf`,
      userId,
      generatedOn: new Date().toISOString(),
      createdAt: Timestamp.now(),
      metadata: { reportId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save report metadata", error);
    return NextResponse.json(
      { success: false, error: "Failed to save report metadata" },
      { status: 500 }
    );
  }
}
