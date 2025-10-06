import { NextResponse } from "next/server";
import { createStockItem, listStockItems } from "@/lib/storeroom-service";
import type { StockItem } from "@/types/storeroom";

export async function GET() {
  try {
    const stock = await listStockItems();
    return NextResponse.json(stock);
  } catch (error) {
    console.error("Failed to fetch stock", error);
    return NextResponse.json({ error: "Failed to fetch stock" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const item = (await request.json()) as StockItem;
    if (!item.id || !item.name || !item.category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const saved = await createStockItem(item);
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error("Failed to create stock item", error);
    return NextResponse.json({ error: "Failed to create stock item" }, { status: 500 });
  }
}
