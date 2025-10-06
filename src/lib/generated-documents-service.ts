"use server";

import { db } from "@/lib/firebase-admin";
import type { GeneratedDocument } from "@/types/generated-document";

const COLLECTION = "generatedDocuments";

export async function listGeneratedDocuments(): Promise<GeneratedDocument[]> {
  const snapshot = await db
    .collection(COLLECTION)
    .orderBy("generatedOn", "desc")
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as GeneratedDocument) }));
}
