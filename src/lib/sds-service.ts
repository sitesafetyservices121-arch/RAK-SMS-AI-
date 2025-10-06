"use server";

import { db, Timestamp } from "@/lib/firebase-admin";
import type { SdsDocument } from "@/types/sds";

const COLLECTION = "sdsDocuments";

export async function listSdsDocuments(): Promise<SdsDocument[]> {
  const snapshot = await db.collection(COLLECTION).orderBy("productName").get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as SdsDocument) }));
}

export async function createSdsDocument(
  doc: Omit<SdsDocument, "id">
): Promise<SdsDocument> {
  const docRef = db.collection(COLLECTION).doc();
  const payload = {
    ...doc,
    createdAt: Timestamp.now(),
    revisionDate: doc.revisionDate ?? new Date().toISOString().split("T")[0],
  };
  await docRef.set(payload);
  return { id: docRef.id, ...(payload as SdsDocument) };
}
