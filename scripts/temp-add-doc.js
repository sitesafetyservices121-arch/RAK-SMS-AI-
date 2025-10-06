
const admin = require("firebase-admin");

// We need to manually set the env vars because this script is not run by Next.js
// This is a simplified and direct way to use the service account key from the .env file
// In a real app, you'd use a library like dotenv, but for a one-off script this is fine.
const fs = require('fs');
const path = require('path');

// Function to parse .env file
function getEnvVar(name) {
  const envPath = path.resolve(__dirname, '.env.local');
  if (!fs.existsSync(envPath)) {
    envPath = path.resolve(__dirname, '.env');
  }
  const envFile = fs.readFileSync(envPath, "utf8");
  const match = envFile.match(new RegExp(`^${name}=(.*)$`, "m"));
  if (match && match[1]) {
    // Return the value, removing potential single quotes and escaping newlines for JSON
    let value = match[1].trim();
    if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    return value;
  }
  return null;
}

try {
  const serviceAccountString = getEnvVar('FIREBASE_SERVICE_ACCOUNT_KEY');
  const storageBucket = getEnvVar('FIREBASE_STORAGE_BUCKET');

  if (!serviceAccountString || !storageBucket) {
    throw new Error("Firebase environment variables not found. Make sure FIREBASE_SERVICE_ACCOUNT_KEY and FIREBASE_STORAGE_BUCKET are in your .env or .env.local file.");
  }

  const serviceAccount = JSON.parse(serviceAccountString.slice(1, -1));

  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: storageBucket,
    });
  }

  const db = admin.firestore();

  const newDocument = {
    name: "Risk Assessment Template (General Workplaces)",
    category: "Safety",
    section: "Section 1 HIRA'S",
    version: "1.0",
    lastUpdated: new Date(),
    type: "docx",
    downloadURL: "https://firebasestorage.googleapis.com/v0/b/studio-1886793043-bca30.firebasestorage.app/o/document%20library%2FSafety%2FSection%201%20HIRA'S%2FRisk-Assessment-Template_General-Workplaces%20(1).docx?alt=media&token=424cea95-da65-4154-9b13-38d2b1303981",
    fileName: "Risk-Assessment-Template_General-Workplaces (1).docx"
  };

  db.collection("documents").add(newDocument).then((docRef) => {
    console.log("Document successfully added to Firestore with ID: ", docRef.id);
  }).catch((error) => {
    console.error("Error adding document: ", error);
  });

} catch (e) {
  console.error("Script failed:", e.message);
}
