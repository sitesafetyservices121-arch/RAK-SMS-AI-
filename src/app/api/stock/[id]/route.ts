import { NextResponse } from "next/server";
import { updateStockItem } from "@/lib/storeroom-service";
import type { StockItem } from "@/types/storeroom";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = (await request.json()) as Partial<StockItem>;
    const updated = await updateStockItem(params.id, body);
    return NextResponse.json(updated);
  } catch (error) {
    console.error(`Failed to update stock item ${params.id}`, error);
    return NextResponse.json({ error: "Failed to update stock item" }, { status: 500 });
  }
}
