// scripts/seedAllData.ts
// Unified seed script for all core data: employees, vehicles, sites, PPE items, and PPE register

import "dotenv/config";
import { db, Timestamp } from "../src/lib/firebase-admin";
import type {
  Employee,
  Vehicle,
  Site,
  PpeItem,
  PpeRegisterEntry
} from "../src/types/core-types";

// Initial seed data
const initialEmployees: Employee[] = [
  {
    id: "EMP-001",
    firstName: "John",
    surname: "Doe",
    idNumber: "8501015000087",
    codeLicense: "C1",
    courses: [
      {
        courseName: "First Aid Level 1",
        status: "Completed",
        expiryDate: "2025-08-01",
      },
      {
        courseName: "Working at Heights",
        status: "Completed",
        expiryDate: "2026-01-15",
      },
    ],
  },
  {
    id: "EMP-002",
    firstName: "Jane",
    surname: "Smith",
    idNumber: "9003155111086",
    codeLicense: null,
    courses: [
      {
        courseName: "HIRA",
        status: "Scheduled",
        expiryDate: null,
      },
      {
        courseName: "Fire Fighting",
        status: "Expired",
        expiryDate: "2024-05-20",
      },
    ],
  },
  {
    id: "EMP-003",
    firstName: "Mike",
    surname: "Johnson",
    idNumber: "7811235222081",
    codeLicense: "EC1",
    courses: [
      {
        courseName: "Forklift Operator",
        status: "Completed",
        expiryDate: "2025-11-10",
      },
    ],
  },
  {
    id: "EMP-004",
    firstName: "Sarah",
    surname: "Williams",
    idNumber: "9207185333089",
    codeLicense: null,
    courses: [
      {
        courseName: "Safety Officer",
        status: "Completed",
        expiryDate: "2025-12-01",
      },
    ],
  },
];

const initialVehicles: Vehicle[] = [
  { vehicle: "Bakkie 1", status: "Awaiting Inspection" },
  { vehicle: "Truck 2", status: "Passed" },
  { vehicle: "Van 3", status: "Failed" },
  { vehicle: "Bakkie 4", status: "Passed" },
];

const initialSites: Site[] = [
  { id: "site-01", name: "ConstructCo HQ", location: "Johannesburg" },
  { id: "site-02", name: "BuildIt Site B", location: "Pretoria" },
  { id: "site-03", name: "InfraWorks Project", location: "Cape Town" },
];

const ppeItems: PpeItem[] = [
  { id: "ppe-hd-01", name: "Hard Hat", category: "Head" },
  { id: "ppe-ft-01", name: "Safety Boots", category: "Feet" },
  { id: "ppe-bd-01", name: "Reflective Vest", category: "Body" },
  { id: "ppe-hg-01", name: "Gloves", category: "Hands" },
];

const ppeRegister: PpeRegisterEntry[] = [
  {
    employeeId: "EMP-001",
    ppeItemId: "ppe-hd-01",
    dateIssued: "2024-01-10",
    validUntil: "2025-01-10",
    signature: "Signed",
  },
  {
    employeeId: "EMP-002",
    ppeItemId: "ppe-ft-01",
    dateIssued: "2024-02-15",
    validUntil: "2025-02-15",
    signature: "Signed",
  },
  {
    employeeId: "EMP-003",
    ppeItemId: "ppe-bd-01",
    dateIssued: "2024-03-01",
    validUntil: "2025-03-01",
    signature: "Signed",
  },
  {
    employeeId: "EMP-001",
    ppeItemId: "ppe-hg-01",
    dateIssued: "2024-05-20",
    validUntil: "2024-11-20",
    signature: "Signed",
  },
];

async function seedAllData() {
  console.log("🌱 Starting full data seeding...\n");

  try {
    // ==============================
    // 1. Seed Employees
    // ==============================
    console.log("📋 Seeding Employees...");
    for (const emp of initialEmployees) {
      const employeeData = {
        ...emp,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      await db.collection("employees").doc(emp.id).set(employeeData);
      console.log(`  ✅ Employee: ${emp.firstName} ${emp.surname} (${emp.id})`);
    }
    console.log(`  Total employees seeded: ${initialEmployees.length}\n`);

    // ==============================
    // 2. Seed Vehicles
    // ==============================
    console.log("🚗 Seeding Vehicles...");
    for (const vehicle of initialVehicles) {
      const vehicleData = {
        ...vehicle,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      const docRef = await db.collection("vehicles").add(vehicleData);
      console.log(`  ✅ Vehicle: ${vehicle.vehicle} - Status: ${vehicle.status} (${docRef.id})`);
    }
    console.log(`  Total vehicles seeded: ${initialVehicles.length}\n`);

    // ==============================
    // 3. Seed Sites
    // ==============================
    console.log("🏗️  Seeding Sites...");
    for (const site of initialSites) {
      const siteData = {
        ...site,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      await db.collection("sites").doc(site.id).set(siteData);
      console.log(`  ✅ Site: ${site.name} - Location: ${site.location} (${site.id})`);
    }
    console.log(`  Total sites seeded: ${initialSites.length}\n`);

    // ==============================
    // 4. Seed PPE Items
    // ==============================
    console.log("🦺 Seeding PPE Items...");
    for (const item of ppeItems) {
      const ppeItemData = {
        ...item,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      await db.collection("ppeItems").doc(item.id).set(ppeItemData);
      console.log(`  ✅ PPE Item: ${item.name} (${item.category}) - ${item.id}`);
    }
    console.log(`  Total PPE items seeded: ${ppeItems.length}\n`);

    // ==============================
    // 5. Seed PPE Register
    // ==============================
    console.log("📝 Seeding PPE Register...");
    for (const entry of ppeRegister) {
      const ppeRegisterData = {
        ...entry,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      const docRef = await db.collection("ppeRegister").add(ppeRegisterData);
      console.log(`  ✅ PPE Register Entry: Employee ${entry.employeeId} - Item ${entry.ppeItemId} (${docRef.id})`);
    }
    console.log(`  Total PPE register entries seeded: ${ppeRegister.length}\n`);

    // ==============================
    // Summary
    // ==============================
    console.log("🎉 Full data seeding complete!\n");
    console.log("📊 Summary:");
    console.log(`  - Employees: ${initialEmployees.length}`);
    console.log(`  - Vehicles: ${initialVehicles.length}`);
    console.log(`  - Sites: ${initialSites.length}`);
    console.log(`  - PPE Items: ${ppeItems.length}`);
    console.log(`  - PPE Register Entries: ${ppeRegister.length}`);
    console.log("\n✨ Your Firestore database is now fully populated with initial data!");

  } catch (err) {
    console.error("❌ Error while seeding Firestore:", err);
    throw err;
  }
}

// Run the seeding function
seedAllData()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  });
