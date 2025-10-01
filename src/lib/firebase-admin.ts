// ==============================
// Firebase Admin Initialization
// ==============================

import * as admin from "firebase-admin";
import { getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getStorage, Storage } from "firebase-admin/storage";
import { getAuth, Auth } from "firebase-admin/auth";

// Firebase service references
let app: App;
let db: Firestore;
let storage: Storage;
let auth: Auth;

/**
 * Initialize Firebase Admin SDK with service account and environment config.
 */
function initializeFirebaseAdmin(): void {
  // If already initialized, reuse existing app
  if (getApps().length > 0) {
    app = getApps()[0];
    db = getFirestore(app);
    storage = getStorage(app);
    auth = getAuth(app);
    return;
  }

  // Validate required environment variables
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.");
  }

  if (!process.env.FIREBASE_STORAGE_BUCKET) {
    throw new Error("FIREBASE_STORAGE_BUCKET environment variable is not set.");
  }

  try {
    // Parse service account with newline handling for private_key
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY.replace(/\n/g, "\n")
    );

    // Validate essential fields
    if (
      !serviceAccount.project_id ||
      !serviceAccount.private_key ||
      !serviceAccount.client_email
    ) {
      throw new Error("Invalid Firebase service account structure.");
    }

    // Initialize Firebase Admin app
    app = admin.initializeApp({
      credential: cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });

    // Initialize services
    db = getFirestore(app);
    storage = getStorage(app);
    auth = getAuth(app);

    console.log("✅ Firebase Admin initialized successfully");
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Ensure it's valid JSON.");
    }
    throw error;
  }
}

// Initialize immediately when the module is loaded
initializeFirebaseAdmin();

// ==============================
// Exports
// ==============================

export { db, storage, auth, app };

/**
 * Getter function to safely retrieve Firebase services.
 */
export function getFirebaseServices() {
  if (!app || !db || !storage || !auth) {
    throw new Error("Firebase Admin has not been initialized.");
  }
  return { app, db, storage, auth };
}
