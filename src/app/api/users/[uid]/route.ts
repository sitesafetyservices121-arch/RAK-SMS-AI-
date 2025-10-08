import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ uid: string }> }
) {
  const { uid } = await params;
  try {

    if (!uid) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get user document from Firestore
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const userData = userDoc.data();

    return NextResponse.json({
      uid,
      email: userData?.email,
      companyId: userData?.companyId || "default-company",
      role: userData?.role || "user",
      displayName: userData?.displayName,
      photoURL: userData?.photoURL,
    });
  } catch (error: any) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch user data" },
      { status: 500 }
    );
  }
}
