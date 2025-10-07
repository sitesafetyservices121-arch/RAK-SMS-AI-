// src/app/api/storeroom/[id]/route.ts
import { NextResponse } from "next/server";
import { db, Timestamp } from "@/lib/firebase-admin";

// GET a single storeroom item
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const doc = await db.collection("storeroom").doc(id).get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("Failed to fetch storeroom item:", error);
    return NextResponse.json({ error: "Failed to fetch item" }, { status: 500 });
  }
}

// PUT/UPDATE a storeroom item
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const itemRef = db.collection("storeroom").doc(id);

    // Get previous value for audit trail
    const previousDoc = await itemRef.get();
    const previousValue = previousDoc.data();

    const updatedItem = {
      ...body,
      updatedAt: Timestamp.now(),
    };

    await itemRef.update(updatedItem);

    // Log transaction
    await db.collection("storeroom-transactions").add({
      itemId: id,
      itemName: updatedItem.name || previousValue?.name,
      companyId: updatedItem.companyId || previousValue?.companyId,
      transactionType: "updated",
      performedBy: updatedItem.lastModifiedBy,
      performedAt: Timestamp.now(),
      previousValue,
      newValue: updatedItem,
    });

    return NextResponse.json({ id: id, ...updatedItem });
  } catch (error) {
    console.error("Failed to update storeroom item:", error);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

// DELETE a storeroom item
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { searchParams } = new URL(request.url);
    const performedBy = searchParams.get("performedBy") || "unknown";

    const itemRef = db.collection("storeroom").doc(id);
    const doc = await itemRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const itemData = doc.data();

    // Log transaction before deletion
    await db.collection("storeroom-transactions").add({
      itemId: id,
      itemName: itemData?.name,
      companyId: itemData?.companyId,
      transactionType: "removed",
      performedBy,
      performedAt: Timestamp.now(),
      previousValue: itemData,
    });

    await itemRef.delete();

    return NextResponse.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Failed to delete storeroom item:", error);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
