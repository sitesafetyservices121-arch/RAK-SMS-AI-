"use server";

import { db, Timestamp } from "@/lib/firebase-admin";
import type { PpeItem, PpeRegisterEntry } from "@/types/ppe";

const ITEMS_COLLECTION = "ppeItems";
const REGISTER_COLLECTION = "ppeRegister";

export async function getPpeItems(): Promise<PpeItem[]> {
  const snapshot = await db.collection(ITEMS_COLLECTION).orderBy("name").get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as PpeItem) }));
}

export async function createPpeItem(item: PpeItem): Promise<PpeItem> {
  const { id, ...rest } = item;
  const docRef = id
    ? db.collection(ITEMS_COLLECTION).doc(id)
    : db.collection(ITEMS_COLLECTION).doc();

  const payload = {
    ...rest,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await docRef.set(payload, { merge: true });
  const saved = await docRef.get();
  return { id: docRef.id, ...(saved.data() as PpeItem) };
}

export async function getPpeRegisterEntries(): Promise<PpeRegisterEntry[]> {
  const snapshot = await db
    .collection(REGISTER_COLLECTION)
    .orderBy("dateIssued", "desc")
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as PpeRegisterEntry) }));
}

export async function addPpeRegisterEntry(
  entry: PpeRegisterEntry
): Promise<PpeRegisterEntry> {
  const docRef = db.collection(REGISTER_COLLECTION).doc();
  const payload = {
    ...entry,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
  await docRef.set(payload);
  return { id: docRef.id, ...entry };
}

export async function deletePpeRegisterEntry(id: string) {
  await db.collection(REGISTER_COLLECTION).doc(id).delete();
}
