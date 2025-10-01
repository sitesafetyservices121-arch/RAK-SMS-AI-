import admin from "firebase-admin";
import { getApps } from "firebase-admin/app";

// Initialize Firebase Admin SDK
async function initializeAdmin() {
  // If already initialized, return the existing instance
  if (getApps().length > 0) {
    return getApps()[0];
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
      // Unescape newline characters and parse the JSON
      serviceAccount = JSON.parse(serviceAccountKey.replace(/\\n/g, "\n"));
    } catch (e) {
      throw new Error(
        "Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Ensure it is a valid JSON string."
      );
    }
    
    // Validate essential fields
    if (!serviceAccount.project_id || !serviceAccount.private_key) {
      throw new Error(
        'Service account key is missing required fields like "project_id" or "private_key".'
      );
    }

    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: `${serviceAccount.project_id}.appspot.com`,
    });
    
    // Check and create bucket if it doesn't exist
    const bucket = admin.storage(app).bucket();
    const [exists] = await bucket.exists();
    if (!exists) {
      console.warn(`Storage bucket ${bucket.name} does not exist. Attempting to create it...`);
      await bucket.create();
      console.log(`Bucket ${bucket.name} created successfully.`);
    }

    return app;
    
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
    throw new Error(
      "Could not initialize Firebase Admin SDK. Please check your service account credentials."
    );
  }
}

// Asynchronously initialize and export services
const adminAppPromise = initializeAdmin();

// We need to export promises that resolve to the services
// to handle the async initialization.
const getDb = async () => {
  const app = await adminAppPromise;
  return admin.firestore(app);
};

const getStorage = async () => {
  const app = await adminAppPromise;
  return admin.storage(app);
};

const getBucket = async () => {
    const storage = await getStorage();
    return storage.bucket();
};


// To use in other server files, you will now need to `await` these.
// e.g., `const db = await getDb();`
// This is a temporary solution to a complex race condition.
// A more robust solution might involve a singleton pattern.
export const db = {
  collection: (...args: Parameters<FirebaseFirestore.Firestore["collection"]>) =>
    getDb().then((db) => db.collection(...args)),
} as any;

export const storage = {
  bucket: (...args: Parameters<ReturnType<typeof admin.storage>["bucket"]>) =>
    getStorage().then((s) => s.bucket(...args)),
} as any;
