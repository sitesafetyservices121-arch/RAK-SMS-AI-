// scripts/seedFirestore.ts

// Load environment variables from .env (or .env.local if you configure dotenv_config_path)
import "dotenv/config";

import { db } from "../src/lib/firebase-admin";
import { initialEmployees, ppeItems, ppeRegister } from "../src/mocks/employee-data";

async function seed() {
  console.log("🌱 Seeding Firestore...");

  try {
    // ==============================
    // Employees
    // ==============================
    for (const emp of initialEmployees) {
      await db.collection("employees").doc(emp.id).set(emp);
      console.log(`✅ Employee added: ${emp.firstName} ${emp.surname}`);
    }

    // ==============================
    // PPE Items
    // ==============================
    for (const item of ppeItems) {
      await db.collection("ppeItems").doc(item.id).set(item);
      console.log(`✅ PPE Item added: ${item.name}`);
    }

    // ==============================
    // PPE Register
    // ==============================
    for (const entry of ppeRegister) {
      await db.collection("ppeRegister").add(entry);
      console.log(`✅ PPE Register entry added for employee: ${entry.employeeId}`);
    }

    console.log("🎉 Seeding complete!");
  } catch (err) {
    console.error("❌ Error while seeding Firestore:", err);
    throw err;
  }
}

// Run the seeding function
seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  });
