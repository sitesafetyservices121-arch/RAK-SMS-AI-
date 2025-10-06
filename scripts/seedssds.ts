import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();

async function seedSds() {
  const docRef = db.collection("sds_documents").doc();

  await docRef.set({
    id: docRef.id,
    productName: "Acetone",
    supplier: "Chemical Corp",
    revisionDate: "2023-10-15",
    version: 1,
    uploadedBy: "adminUser123",
    fileUrl: "https://example.com/sds/acetone-v1.pdf",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log("✅ SDS seeded:", docRef.id);
}

seedSds();
