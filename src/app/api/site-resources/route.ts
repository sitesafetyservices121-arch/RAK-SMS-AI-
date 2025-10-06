import { NextResponse } from "next/server";
import { getSiteResources } from "@/lib/site-assignment-service";

export async function GET() {
  try {
    const data = await getSiteResources();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Failed to load site resources", error);
    return NextResponse.json(
      { success: false, error: "Failed to load site resources" },
      { status: 500 }
    );
  }
}
