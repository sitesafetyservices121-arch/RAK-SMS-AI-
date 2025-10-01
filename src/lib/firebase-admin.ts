import admin, { App } from 'firebase-admin';
import { getApps, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';
import { getAuth, Auth } from 'firebase-admin/auth';

let app: App;
let db: Firestore;
let storage: Storage;
let auth: Auth;

// This function initializes the Firebase Admin SDK.
// It checks if an app is already initialized to prevent re-initialization.
function initializeFirebaseAdmin() {
  if (!getApps().length) {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.'
      );
    }
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    app = admin.initializeApp({
      credential: cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  } else {
    app = getApps()[0];
  }

  db = getFirestore(app);
  storage = getStorage(app);
  auth = getAuth(app);
}

// Initialize on first import.
initializeFirebaseAdmin();

// Export the initialized instances directly.
export { db, storage, auth };
