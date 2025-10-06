import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { STOREROOM_ITEMS_COLLECTION } from '../src/lib/firestore-collections';

// Firebase service account key from environment variable
const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
);

// Initialize Firebase Admin SDK
initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

const initialStock = [
  { id: "ppe-001", name: "Hard Hat", category: "PPE", quantity: 50, location: "Shelf A1", expiryDate: "2026-01-01", status: "In Storeroom" },
  { id: "ppe-002", name: "Safety Gloves", category: "PPE", quantity: 120, location: "Shelf A2", status: "In Storeroom" },
  { id: "ppe-003", name: "Safety Goggles", category: "PPE", quantity: 75, location: "Shelf A1", status: "In Storeroom" },
  { id: "con-001", name: "Drill Bits (Box)", category: "Consumable", quantity: 30, location: "Bin C5", status: "In Storeroom" },
  { id: "con-002", name: "Cutting Discs (115mm)", category: "Consumable", quantity: 200, location: "Bin C6", status: "In Storeroom" },
  { id: "tool-001", name: "Cordless Drill", prefix: "RAK-T-015", category: "Tool", quantity: 1, location: "Tool Cage", condition: "Good", status: "In Use" },
  { id: "tool-002", name: "Angle Grinder", prefix: "RAK-T-016", category: "Tool", quantity: 1, location: "Repair Bay", condition: "Needs Repair", status: "Out for Repair" },
  { id: "equip-001", name: "Generator 5kW", prefix: "RAK-E-003", category: "Equipment", quantity: 1, location: "Site B", status: "In Use", expiryDate: "2025-05-20" },
];

async function seedStoreroom() {
  const collectionRef = db.collection(STOREROOM_ITEMS_COLLECTION);
  const batch = db.batch();

  initialStock.forEach(item => {
    const docRef = collectionRef.doc(item.id);
    batch.set(docRef, item);
  });

  await batch.commit();
  console.log('Storeroom data seeded successfully!');
}

seedStoreroom().catch(console.error);