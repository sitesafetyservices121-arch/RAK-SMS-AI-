import admin from "firebase-admin";
import { getApps } from "firebase-admin/app";

// Initialize Firebase Admin SDK
function initializeAdmin() {
  // If already initialized, return the existing instance
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.");
  }

  try {
    let serviceAccount;
    try {
      // Try parsing the JSON directly
      serviceAccount = JSON.parse(serviceAccountKey);
    } catch (e) {
      throw new Error(
        "Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Ensure it's a valid, non-escaped JSON string."
      );
    }

    // Validate essential fields
    if (!serviceAccount.project_id || !serviceAccount.private_key) {
      throw new Error(
        'Service account key is missing required fields like "project_id" or "private_key".'
      );
    }

    // Initialize Firebase Admin
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: `${serviceAccount.project_id}.appspot.com`,
    });
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
    throw new Error(
      "Could not initialize Firebase Admin SDK. Please check your service account credentials."
    );
  }
}

// Export initialized services
export const adminApp = initializeAdmin();
export const db = admin.firestore(adminApp);
export const storage = admin.storage(adminApp);       // ✅ Storage object
export const bucket = storage.bucket();               // ✅ Bucket object
