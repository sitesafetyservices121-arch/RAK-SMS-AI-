// src/lib/firebase-admin.ts
import admin from "firebase-admin";

let serviceAccount: any;

// Try to use FIREBASE_SERVICE_ACCOUNT_KEY first (full JSON)
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  } catch (error) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", error);
    throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT_KEY format");
  }
} else {
  // Fallback to individual environment variables
  serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
  };
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();
const Timestamp = admin.firestore.Timestamp;

export { db, auth, storage, Timestamp };
