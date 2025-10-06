import { NextResponse } from "next/server";
import { assignVehicleToSite } from "@/lib/site-assignment-service";

export async function POST(request: Request) {
  try {
    const { vehicleId, siteId } = await request.json();
    if (!vehicleId || !siteId) {
      return NextResponse.json(
        { success: false, error: "vehicleId and siteId are required" },
        { status: 400 }
      );
    }

    await assignVehicleToSite(vehicleId, siteId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to assign vehicle", error);
    return NextResponse.json(
      { success: false, error: "Failed to assign vehicle" },
      { status: 500 }
    );
  }
}
