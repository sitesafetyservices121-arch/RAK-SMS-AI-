
"use server";

import { db } from "@/lib/firebase-admin";

export type Document = {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  version: string;
  lastUpdated: string;
  type: string;
  downloadURL: string;
  fileName: string;
};

export async function getDocumentsAction(): Promise<{
  success: boolean;
  data?: Document[];
  error?: string;
}> {
  try {
    // Fetch all documents without a complex sort order to avoid needing a composite index.
    const snapshot = await db.collection("documents").get();

    if (snapshot.empty) {
      return { success: true, data: [] };
    }

    let documents: Document[] = snapshot.docs.map((doc) => {
      const data = doc.data();

      let lastUpdated: string;
      if (data.lastUpdated?.toDate) {
        lastUpdated = data.lastUpdated.toDate().toISOString().split("T")[0];
      } else {
        lastUpdated = new Date(data.lastUpdated).toISOString().split("T")[0];
      }

      return {
        id: doc.id,
        name: data.name,
        category: data.category,
        subCategory: data.section, // Map Firestore 'section' → 'subCategory'
        version: data.version,
        lastUpdated,
        type: data.type,
        downloadURL: data.downloadURL,
        fileName: data.fileName,
      };
    });

    // Perform sorting in the backend code instead of in the query.
    documents.sort((a, b) => {
      if (a.category < b.category) return -1;
      if (a.category > b.category) return 1;
      if (a.subCategory < b.subCategory) return -1;
      if (a.subCategory > b.subCategory) return 1;
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });

    return { success: true, data: documents };
  } catch (e: unknown) {
    console.error("Get Documents Error:", e);
    const message = e instanceof Error ? e.message : "Failed to fetch documents.";
    return { success: false, error: message };
  }
}

export async function getDocumentSectionsAction(): Promise<{
  success: boolean;
  data?: { value: string; label: string }[];
  error?: string;
}> {
  try {
    const snapshot = await db.collection("documents").get();
    if (snapshot.empty) {
      return { success: true, data: [] };
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

    return { success: true, data: sectionOptions };
  } catch (e: unknown) {
    console.error("Get Sections Error:", e);
    const message = e instanceof Error ? e.message : "Failed to fetch sections.";
    return { success: false, error: message };
  }
}
