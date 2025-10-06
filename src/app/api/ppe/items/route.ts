import { NextResponse } from "next/server";
import { getPpeItems, createPpeItem } from "@/lib/ppe-service";
import type { PpeItem } from "@/types/ppe";

export async function GET() {
  try {
    const items = await getPpeItems();
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error("Failed to fetch PPE catalogue", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch PPE catalogue" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PpeItem;
    if (!body.name || !body.category || !body.id) {
      return NextResponse.json(
        { success: false, error: "Missing required PPE item fields" },
        { status: 400 }
      );
    }

    const item = await createPpeItem(body);
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error) {
    console.error("Failed to create PPE item", error);
    return NextResponse.json(
      { success: false, error: "Failed to save PPE item" },
      { status: 500 }
    );
  }
}
