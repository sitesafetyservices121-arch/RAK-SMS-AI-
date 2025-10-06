import { NextResponse } from "next/server";
import { assignEmployeeToSite } from "@/lib/site-assignment-service";

export async function POST(request: Request) {
  try {
    const { employeeId, siteId } = await request.json();
    if (!employeeId || !siteId) {
      return NextResponse.json(
        { success: false, error: "employeeId and siteId are required" },
        { status: 400 }
      );
    }

    await assignEmployeeToSite(employeeId, siteId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to assign employee", error);
    return NextResponse.json(
      { success: false, error: "Failed to assign employee" },
      { status: 500 }
    );
  }
}
