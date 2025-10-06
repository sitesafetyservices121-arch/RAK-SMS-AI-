
// src/app/api/inspections/[id]/route.ts
import { NextResponse } from "next/server";
import { db, Timestamp } from "@/lib/firebase-admin";
import type { Inspection } from "@/types/inspections";

interface DynamicRouteContext {
  params: {
    id: string;
  };
}

// PUT (update) an inspection
export async function PUT(request: Request, context: DynamicRouteContext) {
  try {
    const { id } = context.params;
    const body = await request.json();
    
    // Ensure we don't overwrite the id and handle dates
    const { id: bodyId, createdAt, ...dataToUpdate } = body;

    const updatedData = {
      ...dataToUpdate,
      updatedAt: Timestamp.now(),
    };

    await db.collection("inspections").doc(id).update(updatedData);

    const docSnap = await db.collection("inspections").doc(id).get();

    return NextResponse.json({ id, ...docSnap.data() });
  } catch (error) {
    console.error(`Failed to update inspection ${context.params.id}:`, error);
    return NextResponse.json({ error: "Failed to update inspection" }, { status: 500 });
  }
}
