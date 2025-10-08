// src/app/api/ppe-register/route.ts
import { NextResponse } from "next/server";
import { getAllPpeRegisterEntries, getPpeRegisterByEmployeeId } from "@/lib/core-service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");

    if (employeeId) {
      // Get PPE register entries for a specific employee
      const entries = await getPpeRegisterByEmployeeId(employeeId);
      return NextResponse.json({ success: true, data: entries });
    } else {
      // Get all PPE register entries
      const entries = await getAllPpeRegisterEntries();
      return NextResponse.json({ success: true, data: entries });
    }
  } catch (error: unknown) {
    console.error("🔥 Failed to fetch PPE register:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch PPE register" },
      { status: 500 }
    );
  }
}
