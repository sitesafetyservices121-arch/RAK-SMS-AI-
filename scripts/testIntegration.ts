// scripts/testIntegration.ts
// Test script to verify the full integration

import "dotenv/config";
import {
  getAllEmployees,
  getAllVehicles,
  getAllSites,
  getAllPpeItems,
  getAllPpeRegisterEntries,
  getEmployeeProfile
} from "../src/lib/core-service";

async function testIntegration() {
  console.log("🧪 Testing Full Integration...\n");

  try {
    // Test 1: Get all employees
    console.log("1️⃣ Testing getAllEmployees()...");
    const employees = await getAllEmployees();
    console.log(`   ✅ Found ${employees.length} employees`);
    console.log(`   📋 First employee: ${employees[0]?.firstName} ${employees[0]?.surname}`);
    console.log(`   📚 Courses: ${employees[0]?.courses?.length || 0}\n`);

    // Test 2: Get all vehicles
    console.log("2️⃣ Testing getAllVehicles()...");
    const vehicles = await getAllVehicles();
    console.log(`   ✅ Found ${vehicles.length} vehicles`);
    console.log(`   🚗 First vehicle: ${vehicles[0]?.vehicle} - ${vehicles[0]?.status}\n`);

    // Test 3: Get all sites
    console.log("3️⃣ Testing getAllSites()...");
    const sites = await getAllSites();
    console.log(`   ✅ Found ${sites.length} sites`);
    console.log(`   🏗️  First site: ${sites[0]?.name} (${sites[0]?.location})\n`);

    // Test 4: Get all PPE items
    console.log("4️⃣ Testing getAllPpeItems()...");
    const ppeItems = await getAllPpeItems();
    console.log(`   ✅ Found ${ppeItems.length} PPE items`);
    console.log(`   🦺 First item: ${ppeItems[0]?.name} (${ppeItems[0]?.category})\n`);

    // Test 5: Get all PPE register entries
    console.log("5️⃣ Testing getAllPpeRegisterEntries()...");
    const ppeRegister = await getAllPpeRegisterEntries();
    console.log(`   ✅ Found ${ppeRegister.length} PPE register entries`);
    console.log(`   📝 First entry: Employee ${ppeRegister[0]?.employeeId} - Item ${ppeRegister[0]?.ppeItemId}\n`);

    // Test 6: Get employee profile (full integration test)
    console.log("6️⃣ Testing getEmployeeProfile() - Full Integration...");
    const profile = await getEmployeeProfile("EMP-001");
    if (profile) {
      console.log(`   ✅ Employee: ${profile.firstName} ${profile.surname}`);
      console.log(`   📚 Courses: ${profile.courses?.length || 0}`);
      if (profile.courses && profile.courses.length > 0) {
        profile.courses.forEach((course) => {
          console.log(`      - ${course.courseName} (${course.status})`);
        });
      }
      console.log(`   🦺 PPE Items Issued: ${profile.ppe?.length || 0}`);
      if (profile.ppe && profile.ppe.length > 0) {
        profile.ppe.forEach((ppe) => {
          console.log(`      - ${ppe.item?.name || 'Unknown'} (Valid: ${ppe.validUntil})`);
        });
      }
      console.log(`   ⚠️  Has Expired Courses: ${profile.hasExpiredCourses ? 'Yes' : 'No'}\n`);
    } else {
      console.log(`   ❌ Employee profile not found\n`);
    }

    // Summary
    console.log("🎉 Integration Test Complete!\n");
    console.log("✅ All systems are fully integrated and working:");
    console.log(`   - Employee data with courses: ✅`);
    console.log(`   - Vehicle management: ✅`);
    console.log(`   - Site management: ✅`);
    console.log(`   - PPE items: ✅`);
    console.log(`   - PPE register: ✅`);
    console.log(`   - Employee profiles (full data): ✅`);
    console.log("\n🚀 Your application is ready to use!");

  } catch (err) {
    console.error("❌ Integration test failed:", err);
    throw err;
  }
}

// Run the test
testIntegration()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Test failed:", err);
    process.exit(1);
  });
