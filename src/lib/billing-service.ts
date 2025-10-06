"use server";

import { db, Timestamp } from "@/lib/firebase-admin";
import type { BillingAccount } from "@/types/billing";

const COLLECTION = "billingAccounts";

export async function listBillingAccounts(): Promise<BillingAccount[]> {
  const snapshot = await db.collection(COLLECTION).orderBy("companyName").get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as BillingAccount) }));
}

export async function createBillingAccount(
  account: Omit<BillingAccount, "id" | "createdAt" | "updatedAt">
): Promise<BillingAccount> {
  const docRef = db.collection(COLLECTION).doc();
  const payload = {
    ...account,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
  await docRef.set(payload);
  return { id: docRef.id, ...(payload as BillingAccount) };
}

export async function updateBillingAccount(
  id: string,
  data: Partial<BillingAccount>
): Promise<BillingAccount> {
  await db.collection(COLLECTION).doc(id).set(
    { ...data, updatedAt: Timestamp.now() },
    { merge: true }
  );
  const snapshot = await db.collection(COLLECTION).doc(id).get();
  return { id, ...(snapshot.data() as BillingAccount) };
}
