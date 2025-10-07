// src/app/api/storeroom/route.ts
import { NextResponse } from "next/server";
import { db, Timestamp } from "@/lib/firebase-admin";
import type { StoreroomItem } from "@/types/storeroom";

// GET all storeroom items (with optional company filter)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    let query = db.collection("storeroom");

    // Apply filters
    if (companyId) {
      query = query.where("companyId", "==", companyId) as any;
    }
    if (category) {
      query = query.where("category", "==", category) as any;
    }
    if (status) {
      query = query.where("status", "==", status) as any;
    }

    const snapshot = await query.orderBy("updatedAt", "desc").get();
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(items);
  } catch (error) {
    console.error("Failed to fetch storeroom items:", error);
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}

// POST a new storeroom item
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newItem: Partial<StoreroomItem> = {
      ...body,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await db.collection("storeroom").add(newItem);

    // Log transaction
    await db.collection("storeroom-transactions").add({
      itemId: docRef.id,
      itemName: newItem.name,
      companyId: newItem.companyId,
      transactionType: "added",
      performedBy: newItem.createdBy,
      performedAt: Timestamp.now(),
      newValue: newItem,
    });

    const savedItem = { id: docRef.id, ...newItem };
    return NextResponse.json(savedItem, { status: 201 });
  } catch (error) {
    console.error("Failed to add storeroom item:", error);
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }
}
