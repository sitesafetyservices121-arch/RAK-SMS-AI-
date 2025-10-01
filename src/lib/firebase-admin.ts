import admin from "firebase-admin";
import { getApps, App, cert } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getStorage, Storage } from "firebase-admin/storage";

let app: App;
let db: Firestore;
let storage: Storage;

function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    app = getApps()[0];
  } else {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.");
    }
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    app = admin.initializeApp({
      credential: cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  }

  db = getFirestore(app);
  storage = getStorage(app);
}

// Initialize on first import
try {
  initializeFirebaseAdmin();
} catch (error) {
  // In a build environment where env vars might be missing,
  // we will defer initialization to the first API call.
  console.log("Deferring Firebase Admin initialization.");
}

function ensureInitialized() {
  if (!app) {
    console.log("Lazily initializing Firebase Admin...");
    initializeFirebaseAdmin();
  }
}

export const getDb = () => {
  ensureInitialized();
  return db;
};

export const getStorage = () => {
  ensureInitialized();
  return storage;
};
