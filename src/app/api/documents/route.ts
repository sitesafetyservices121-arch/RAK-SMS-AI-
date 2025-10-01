import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const section = searchParams.get("section");

    let query: FirebaseFirestore.Query = db.collection("documents");

    if (category) {
      query = query.where("category", "==", category);
    }
    // Corrected to use the 'subCategory' field as stored in Firestore
    if (section) {
      query = query.where("subCategory", "==", section);
    }

    const snapshot = await query.orderBy("name").get();

    if (snapshot.empty) {
      return NextResponse.json({ success: true, data: [] });
    }

    const documents = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ success: true, data: documents });
  } catch (e: unknown) {
    console.error("Get Documents API Error:", e);
    const message =
      e instanceof Error ? e.message : "Failed to fetch documents.";
    // Ensure JSON is always returned, even on error
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
