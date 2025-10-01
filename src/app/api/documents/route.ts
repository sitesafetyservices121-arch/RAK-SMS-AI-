import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase-admin";
import type { Document } from "@/types/documents";

export async function GET() {
  try {
    const firestore = getDb();
    const snapshot = await firestore.collection("documents").get();

    if (snapshot.empty) {
      return NextResponse.json({ success: true, data: [] });
    }

    const documents: Document[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      const lastUpdated = data.lastUpdated?.toDate ? data.lastUpdated.toDate().toISOString().split("T")[0] : new Date(data.lastUpdated).toISOString().split("T")[0];
      return {
        id: doc.id,
        name: data.name,
        category: data.category,
        subCategory: data.section,
        version: data.version,
        lastUpdated,
        type: data.type,
        downloadURL: data.downloadURL,
        fileName: data.fileName,
      };
    });

    documents.sort((a, b) => {
      if (a.category < b.category) return -1;
      if (a.category > b.category) return 1;
      if (a.subCategory < b.subCategory) return -1;
      if (a.subCategory > b.subCategory) return 1;
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });

    return NextResponse.json({ success: true, data: documents });
  } catch (e: unknown) {
    console.error("Get Documents API Error:", e);
    const message = e instanceof Error ? e.message : "Failed to fetch documents.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
