// ==============================
// Firebase Client Initialization
// ==============================

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore, setLogLevel } from "firebase/firestore";

// ==============================
// Configuration
// ==============================

const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// ==============================
// Initialization
// ==============================

const app: FirebaseApp = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

// Enable Firestore debug logs in dev only
if (process.env.NODE_ENV !== "production") {
  setLogLevel("debug");
  console.log("✅ Firestore debug logging enabled (dev mode)");
}

// ==============================
// Exports
// ==============================

export { app, auth, db };
