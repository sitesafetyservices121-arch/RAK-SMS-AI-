
// src/scripts/add-engineering-doc.ts
import { db, Timestamp } from "../lib/firebase-admin";

async function addEngineeringDocument() {
  console.log("🌱 Adding engineering.docx to Firestore...");

  try {
    const docRef = db.collection("documents").doc("engineering-doc-01");

    const documentData = {
      name: "Engineering Principles",
      category: "Engineering",
      section: "General",
      version: "1.0",
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      fileName: "engineering.docx",
      // NOTE: This URL is constructed based on the bucket and path.
      // You may need to adjust if you have a different access token.
      downloadURL: "https://firebasestorage.googleapis.com/v0/b/studio-1886793043-bca30.appspot.com/o/Engineering%2Fengineering.docx?alt=media",
      storagePath: "Engineering/engineering.docx",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await docRef.set(documentData);

    console.log("✅ Document 'engineering.docx' metadata added successfully!");
  } catch (err) {
    console.error("❌ Error adding document:", err);
    process.exit(1);
  }
}

addEngineeringDocument()
  .then(() => {
    console.log("Script finished.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Script failed:", err);
    process.exit(1);
  });
