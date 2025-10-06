"use server";

import { db, Timestamp } from "@/lib/firebase-admin";
import { STOREROOM_ITEMS_COLLECTION } from "@/lib/firestore-collections";
import type { StockItem } from "@/types/storeroom";

export async function listStockItems(): Promise<StockItem[]> {
  const snapshot = await db
    .collection(STOREROOM_ITEMS_COLLECTION)
    .orderBy("name")
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as StockItem) }));
}

export async function createStockItem(item: StockItem): Promise<StockItem> {
  const docRef = db.collection(STOREROOM_ITEMS_COLLECTION).doc(item.id);
  const payload = {
    ...item,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
  await docRef.set(payload);
  return { ...item };
}

export async function updateStockItem(id: string, item: Partial<StockItem>) {
  await db.collection(STOREROOM_ITEMS_COLLECTION).doc(id).set(
    {
      ...item,
      updatedAt: Timestamp.now(),
    },
    { merge: true }
  );
  const snapshot = await db.collection(STOREROOM_ITEMS_COLLECTION).doc(id).get();
  return { id, ...(snapshot.data() as StockItem) };
}
