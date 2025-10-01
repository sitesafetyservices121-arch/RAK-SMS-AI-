import admin from "firebase-admin";
import { getApps, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getStorage, Storage } from "firebase-admin/storage";

let app: App | undefined;

function initializeAdmin(): App {
  if (app) {
    return app;
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set."
    );
  }

  try {
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountKey.replace(/\\n/g, "\n"));
    } catch {
      throw new Error(
        "Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Ensure it is a valid JSON string."
      );
    }

    if (!serviceAccount.project_id || !serviceAccount.private_key) {
      throw new Error(
        'Service account key is missing required fields like "project_id" or "private_key".'
      );
    }
    
    // Use the default app if already initialized
    if(getApps().length > 0) {
      app = getApps()[0];
      return app;
    }

    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: "studio-1886793043-bca30.appspot.com",
    });

    return app;
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
    throw new Error(
      "Could not initialize Firebase Admin SDK. Please check your service account credentials."
    );
  }
}

// Ensure the app is initialized before exporting services
initializeAdmin();

// Export the initialized services directly
export const db: Firestore = getFirestore();
export const storage: Storage = getStorage();
