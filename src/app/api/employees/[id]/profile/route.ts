// src/app/api/employees/[id]/profile/route.ts
import { NextResponse } from "next/server";
import { getEmployeeProfile } from "@/lib/core-service";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const employeeId = params.id;
    const profile = await getEmployeeProfile(employeeId);

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: profile });
  } catch (error: unknown) {
    console.error("🔥 Failed to fetch employee profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch employee profile" },
      { status: 500 }
    );
  }
}
