// scripts/add-document.ts
import { db } from "../lib/firebase-admin";

async function addDocument() {
  try {
    const newDocument = {
      name: "Risk Assessment Template (General Workplaces)",
      category: "Safety",
      section: "Section 1 HIRA'S",
      version: "1.0",
      lastUpdated: new Date(),
      type: "docx",
      downloadURL:
        "https://firebasestorage.googleapis.com/v0/b/studio-1886793043-bca30.firebasestorage.app/o/document%20library%2FSafety%2FSection%201%20HIRA'S%2FRisk-Assessment-Template_General-Workplaces%20(1).docx?alt=media&token=424cea95-da65-4154-9b13-38d2b1303981",
      fileName:
        "Risk-Assessment-Template_General-Workplaces (1).docx",
    };

    const docRef = await db.collection("documents").add(newDocument);
    console.log("✅ Document successfully added with ID:", docRef.id);
  } catch (error) {
    console.error("❌ Error adding document:", error);
    process.exit(1);
  }
}

addDocument();
