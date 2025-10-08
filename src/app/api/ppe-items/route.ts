// src/app/api/ppe-items/route.ts
import { NextResponse } from "next/server";
import { getAllPpeItems } from "@/lib/core-service";

export async function GET() {
  try {
    const ppeItems = await getAllPpeItems();
    return NextResponse.json({ success: true, data: ppeItems });
  } catch (error: unknown) {
    console.error("🔥 Failed to fetch PPE items:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch PPE items" },
      { status: 500 }
    );
  }
}
