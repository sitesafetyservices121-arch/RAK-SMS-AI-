"use server";

import { Timestamp } from "@/lib/firebase-admin";
import { db } from "@/lib/firebase-admin";
import type { GeneratedDocumentRecord } from "@/types/generated-document";

export type SaveGeneratedDocumentInput = {
  userId: string;
  companyId: string;
  companyName: string;
  documentType: string;
  fileName: string;
  storagePath: string;
  downloadUrl: string;
};

export async function saveGeneratedDocumentMetadata({
  userId,
  companyId,
  companyName,
  documentType,
  fileName,
  storagePath,
  downloadUrl,
}: SaveGeneratedDocumentInput): Promise<void> {
  await db.collection("generatedDocuments").add({
    userId,
    companyId,
    companyName,
    documentType,
    fileName,
    storagePath,
    downloadUrl,
    generatedOn: Timestamp.now(),
  });
}

export async function listGeneratedDocumentsByCompany(
  companyId: string
): Promise<GeneratedDocumentRecord[]> {
  const snapshot = await db
    .collection("generatedDocuments")
    .where("companyId", "==", companyId)
    .orderBy("generatedOn", "desc")
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      companyId: data.companyId,
      companyName: data.companyName,
      documentType: data.documentType,
      fileName: data.fileName,
      generatedOn: data.generatedOn?.toDate().toISOString() ?? new Date().toISOString(),
      storagePath: data.storagePath ?? "",
      downloadUrl: data.downloadUrl ?? "",
    } satisfies GeneratedDocumentRecord;
  });
}
