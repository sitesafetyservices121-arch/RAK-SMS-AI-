
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

// This function initializes the Firebase Admin SDK.
function initializeAdmin() {
  // If the app is already initialized, return the existing instance.
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountKey);
  } catch (error) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Ensure it is a valid JSON string.', error);
    throw new Error('Could not initialize Firebase Admin SDK. Service account key is invalid JSON.');
  }

  // Validate the parsed service account object
  if (!serviceAccount.project_id || !serviceAccount.private_key) {
      throw new Error('Service account key is missing required fields like "project_id" or "private_key".');
  }

  // Correctly format the private_key by replacing escaped newlines with actual newlines.
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

  try {
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
      storageBucket: `${serviceAccount.project_id}.appspot.com`
    });
  } catch (error) {
     console.error('Firebase Admin initialization error:', error);
     throw new Error('Could not initialize Firebase Admin SDK. Please check your service account credentials.');
  }
}

export const adminApp = initializeAdmin();
export const db = admin.firestore(adminApp);
export const storage = admin.storage(adminApp);
