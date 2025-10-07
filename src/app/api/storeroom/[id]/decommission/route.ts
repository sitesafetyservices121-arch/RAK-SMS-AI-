// src/app/api/storeroom/[id]/decommission/route.ts
import { NextResponse } from "next/server";
import { db, Timestamp } from "@/lib/firebase-admin";

// POST - Decommission an item
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { performedBy, reason, disposalMethod } = body;

    const itemRef = db.collection("storeroom").doc(id);
    const doc = await itemRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const previousValue = doc.data();

    const updates = {
      status: "decommissioned",
      condition: "decommissioned",
      decommissionedAt: Timestamp.now(),
      decommissionedBy: performedBy,
      decommissionReason: reason,
      disposalMethod: disposalMethod || null,
      updatedAt: Timestamp.now(),
      lastModifiedBy: performedBy,
    };

    await itemRef.update(updates);

    // Log transaction
    await db.collection("storeroom-transactions").add({
      itemId: id,
      itemName: previousValue?.name,
      companyId: previousValue?.companyId,
      transactionType: "decommissioned",
      performedBy,
      performedAt: Timestamp.now(),
      previousValue,
      newValue: { ...previousValue, ...updates },
      notes: reason,
    });

    return NextResponse.json({
      id: id,
      ...previousValue,
      ...updates,
    });
  } catch (error) {
    console.error("Failed to decommission item:", error);
    return NextResponse.json({ error: "Failed to decommission item" }, { status: 500 });
  }
}
