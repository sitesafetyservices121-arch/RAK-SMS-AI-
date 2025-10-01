import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const firestore = getDb();
    const snapshot = await firestore.collection("documents").get();
    if (snapshot.empty) {
      return NextResponse.json({ success: true, data: [] });
    }

    const sections = new Set<string>();
    snapshot.docs.forEach((doc) => {
      const section = doc.data().section;
      if (section) sections.add(section);
    });

    const sectionOptions = Array.from(sections).map((s) => ({
      value: s.toLowerCase().trim().replace(/\s+/g, "-"),
      label: s,
    }));

    return NextResponse.json({ success: true, data: sectionOptions });
  } catch (e: unknown) {
    console.error("Get Sections API Error:", e);
    const message = e instanceof Error ? e.message : "Failed to fetch sections.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
