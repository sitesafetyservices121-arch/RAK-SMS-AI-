// src/app/api/inspections/[id]/route.ts
import { NextResponse } from "next/server";
import { db, Timestamp } from "@/lib/firebase-admin";
import type { Inspection } from "@/types/inspections";

// Next.js 15 automatically infers the context type from the folder structure.
// No explicit type annotation needed — it causes the type error.
export async function PUT(request: Request, context) {
  const { id } = context.params;
  try {
    const body = await request.json();

    // Prevent overwriting the ID and handle timestamps properly
    const { id: bodyId, createdAt, ...dataToUpdate } = body;

    const updatedData = {
      ...dataToUpdate,
      updatedAt: Timestamp.now(),
    };

    // Update the Firestore document
    await db.collection("inspections").doc(id).update(updatedData);

    // Fetch the updated document
    const docSnap = await db.collection("inspections").doc(id).get();

    if (!docSnap.exists) {
      return NextResponse.json(
        { error: `Inspection with ID ${id} not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ id, ...docSnap.data() });
  } catch (error) {
    console.error(`Failed to update inspection:`, error);
    return NextResponse.json(
      { error: "Failed to update inspection" },
      { status: 500 }
    );
  }
}
