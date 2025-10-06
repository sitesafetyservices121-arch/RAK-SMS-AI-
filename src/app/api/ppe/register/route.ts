import { NextResponse } from "next/server";
import { addPpeRegisterEntry, getPpeRegisterEntries } from "@/lib/ppe-service";
import type { PpeRegisterEntry } from "@/types/ppe";

export async function GET() {
  try {
    const entries = await getPpeRegisterEntries();
    return NextResponse.json({ success: true, data: entries });
  } catch (error) {
    console.error("Failed to load PPE register", error);
    return NextResponse.json(
      { success: false, error: "Failed to load PPE register" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PpeRegisterEntry;
    if (!body.employeeId || !body.ppeItemId || !body.dateIssued || !body.validUntil) {
      return NextResponse.json(
        { success: false, error: "Missing required register fields" },
        { status: 400 }
      );
    }

    const saved = await addPpeRegisterEntry(body);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error) {
    console.error("Failed to save PPE register entry", error);
    return NextResponse.json(
      { success: false, error: "Failed to save register entry" },
      { status: 500 }
    );
  }
}
