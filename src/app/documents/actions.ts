
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

export async function getDocumentsAction(): Promise<{ success: boolean; data?: Document[]; error?: string }> {
  try {
    const snapshot = await db.collection("documents").orderBy("category").orderBy("section").orderBy("name").get();
    if (snapshot.empty) {
      return { success: true, data: [] };
    }

    const documents: Document[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        category: data.category,
        subCategory: data.section, // Map Firestore 'section' to 'subCategory'
        version: data.version,
        lastUpdated: new Date(data.lastUpdated).toISOString().split('T')[0],
        type: data.type,
        downloadURL: data.downloadURL,
        fileName: data.fileName,
      }
    });

    return { success: true, data: documents };
  } catch (e: any) {
    console.error("Get Documents Error:", e);
    return { success: false, error: "Failed to fetch documents." };
  }
}

export async function getDocumentSectionsAction(): Promise<{ success: boolean; data?: { value: string; label: string }[]; error?: string }> {
    try {
        const snapshot = await db.collection('documents').get();
        if (snapshot.empty) {
            return { success: true, data: [] };
        }
        
        const sections = new Set<string>();
        snapshot.docs.forEach(doc => {
            sections.add(doc.data().section);
        });

        const sectionOptions = Array.from(sections).map(s => ({
            value: s.toLowerCase().replace(/ /g, '-'),
            label: s
        }));

        return { success: true, data: sectionOptions };

    } catch (e: any) {
        console.error("Get Sections Error:", e);
        return { success: false, error: 'Failed to fetch sections.'}
    }
}
