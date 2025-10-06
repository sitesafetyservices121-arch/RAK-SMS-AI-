
// src/app/api/inspections/route.ts
import { NextResponse } from "next/server";
import { db, Timestamp } from "@/lib/firebase-admin";
import type { Inspection } from "@/types/inspections";

// GET all inspections
export async function GET() {
  try {
    const snapshot = await db.collection("inspections").orderBy("date", "desc").get();
    const inspections = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json(inspections);
  } catch (error) {
    console.error("Failed to fetch inspections:", error);
    return NextResponse.json({ error: "Failed to fetch inspections" }, { status: 500 });
  }
}

// POST a new inspection
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newInspection: Partial<Inspection> = {
      ...body,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await db.collection("inspections").add(newInspection);
    const savedInspection = { id: docRef.id, ...newInspection };

    return NextResponse.json(savedInspection, { status: 201 });
  } catch (error) {
    console.error("Failed to add inspection:", error);
    return NextResponse.json({ error: "Failed to add inspection" }, { status: 500 });
  }
}
