// scripts/seedCoreData.ts
import { db } from "../src/lib/firebase-admin";
import { initialEmployees, initialVehicles, initialSites } from "../src/mocks/core-data";

async function seed() {
  console.log("🌱 Seeding core data...");

  // Employees
  for (const emp of initialEmployees) {
    await db.collection("employees").doc(emp.id).set(emp);
    console.log(`✅ Employee: ${emp.firstName} ${emp.surname}`);
  }

  // Vehicles
  for (const vehicle of initialVehicles) {
    await db.collection("vehicles").add(vehicle);
    console.log(`✅ Vehicle: ${vehicle.vehicle}`);
  }

  // Sites
  for (const site of initialSites) {
    await db.collection("sites").doc(site.id).set(site);
    console.log(`✅ Site: ${site.name}`);
  }

  console.log("🎉 Core data seeding complete!");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error seeding:", err);
    process.exit(1);
  });
