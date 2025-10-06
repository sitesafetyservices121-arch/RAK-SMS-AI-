
// scripts/add-document.ts
import { db } from "../lib/firebase-admin";
import { z } from "zod";

// Schema validation
const DocumentSchema = z.object({
  name: z.string(),
  category: z.string(),
  section: z.string(),
  version: z.string(),
  lastUpdated: z.date(),
  type: z.enum(["pdf", "docx", "xlsx"]),
  downloadURL: z.string().url(),
  fileName: z.string(),
});
type DocumentEntry = z.infer<typeof DocumentSchema>;

async function addDocument() {
  try {
    const newDocument: DocumentEntry = DocumentSchema.parse({
      name: "Risk Assessment Template (General Workplaces)",
      category: "Safety",
      section: "Section 1 HIRA'S",
      version: "1.0",
      lastUpdated: new Date(),
      type: "docx",
      downloadURL:
        "https://firebasestorage.googleapis.com/…", // shortened for clarity
      fileName: "Risk-Assessment-Template_General-Workplaces (1).docx",
    });

    // Prevent duplicate inserts
    const existing = await db
      .collection(process.env.DOCUMENTS_COLLECTION || "documents")
      .where("fileName", "==", newDocument.fileName)
      .get();

    if (!existing.empty) {
      console.log("⚠️ Document already exists, skipping insert.");
      return;
    }

    const docRef = await db
      .collection(process.env.DOCUMENTS_COLLECTION || "documents")
      .add(newDocument);

    console.log("✅ Document successfully added with ID:", docRef.id);
  } catch (error) {
    console.error("❌ Error adding document:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

addDocument();

