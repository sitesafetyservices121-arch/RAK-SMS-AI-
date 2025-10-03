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
  projectId: "rak-sms-ai-original-8604-15199",
  appId: "1:155016620289:web:3747314d0f5bdc2bae9300",
  apiKey: "AIzaSyDWUALoi9wbHXpk5THJ5xEwUTKEE5RtYKE",
  authDomain: "rak-sms-ai-original-8604-15199.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "155016620289",
};

// ==============================
// Initialization
// ==============================

// Ensure we don’t re-initialize if already running
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

// Optionally enable Firestore debug logging (toggle off in production)
if (process.env.NODE_ENV !== "production") {
  setLogLevel("debug");
  console.log("Firestore debug logging enabled");
}

// ==============================
// Exports
// ==============================

export { app, auth, db };
