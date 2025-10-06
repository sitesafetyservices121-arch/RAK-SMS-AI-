import { NextResponse } from "next/server";
import { listGeneratedDocuments } from "@/lib/generated-documents-service";

export async function GET() {
  try {
    const documents = await listGeneratedDocuments();
    return NextResponse.json({ success: true, data: documents });
  } catch (error) {
    console.error("Failed to fetch generated documents", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch generated documents" },
      { status: 500 }
    );
  }
}
