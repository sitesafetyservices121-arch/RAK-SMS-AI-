// ============================== 
// Firebase Admin Initialization
// ============================== 

import * as admin from "firebase-admin";
import { getApps, App } from "firebase-admin/app";
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
  if (!process.env.FIREBASE_PROJECT_ID) {
    throw new Error("FIREBASE_PROJECT_ID environment variable is not set.");
  }
  if (!process.env.FIREBASE_CLIENT_EMAIL) {
    throw new Error("FIREBASE_CLIENT_EMAIL environment variable is not set.");
  }
  if (!process.env.FIREBASE_PRIVATE_KEY) {
    throw new Error("FIREBASE_PRIVATE_KEY environment variable is not set.");
  }
  if (!process.env.FIREBASE_STORAGE_BUCKET) {
    throw new Error("FIREBASE_STORAGE_BUCKET environment variable is not set.");
  }

  // TEMPORARY DEBUG LOG: REMOVE BEFORE PRODUCTION
  console.log("DEBUG: FIREBASE_PRIVATE_KEY (raw):", process.env.FIREBASE_PRIVATE_KEY);
  console.log("DEBUG: FIREBASE_PRIVATE_KEY (parsed):", process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"));

  try {
    // Initialize Firebase Admin app
    app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });

    // Initialize services
    db = getFirestore(app);
    storage = getStorage(app);
    auth = getAuth(app);

    console.log("✅ Firebase Admin initialized successfully");
  } catch (error) {
    throw new Error(`🔥 Firebase Admin initialization failed: ${(error as Error).message}`);
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
