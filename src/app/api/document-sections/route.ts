import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const snapshot = await db.collection("documents").get();

    if (snapshot.empty) {
      return NextResponse.json({ success: true, data: [] });
    }

    const sections = new Set<string>();
    snapshot.docs.forEach((doc) => {
      const subCategory = doc.data().section; // Corrected field name
      if (subCategory) {
        sections.add(subCategory);
      }
    });

    const sectionOptions = Array.from(sections).map((s) => ({
      value: s, // Use the raw section name as the value
      label: s,
    }));

    return NextResponse.json({ success: true, data: sectionOptions });
  } catch (e: unknown) {
    console.error("Get Sections API Error:", e);
    const message =
      e instanceof Error ? e.message : "Failed to fetch sections.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
