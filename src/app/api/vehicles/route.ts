import { NextResponse } from "next/server";
import { getAllVehicles, updateVehicleStatus } from "@/lib/core-service";

// GET: fetch all vehicles
export async function GET() {
  try {
    const vehicles = await getAllVehicles();
    return NextResponse.json({ success: true, data: vehicles });
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch vehicles" },
      { status: 500 }
    );
  }
}

// PATCH: update vehicle status
export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "Missing id or status" },
        { status: 400 }
      );
    }
    await updateVehicleStatus(id, status);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating vehicle:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update vehicle" },
      { status: 500 }
    );
  }
}
