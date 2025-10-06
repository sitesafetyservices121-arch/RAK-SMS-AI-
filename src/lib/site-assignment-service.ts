"use server";

import { db, Timestamp } from "@/lib/firebase-admin";
import type { Employee, Vehicle, Site } from "@/types/core-data";

const EMPLOYEE_ASSIGNMENTS_COLLECTION = "employeeAssignments";
const VEHICLE_ASSIGNMENTS_COLLECTION = "vehicleAssignments";

export type SiteAssignments = {
  employees: Record<string, string>;
  vehicles: Record<string, string>;
};

export async function getSiteResources(): Promise<{
  sites: Site[];
  employees: Employee[];
  vehicles: Vehicle[];
  assignments: SiteAssignments;
}> {
  const [sitesSnap, employeesSnap, vehiclesSnap, employeeAssignmentsSnap, vehicleAssignmentsSnap] =
    await Promise.all([
      db.collection("sites").get(),
      db.collection("employees").get(),
      db.collection("vehicles").get(),
      db.collection(EMPLOYEE_ASSIGNMENTS_COLLECTION).get(),
      db.collection(VEHICLE_ASSIGNMENTS_COLLECTION).get(),
    ]);

  const assignments: SiteAssignments = {
    employees: {},
    vehicles: {},
  };

  employeeAssignmentsSnap.forEach((doc) => {
    const data = doc.data() as { employeeId: string; siteId: string };
    assignments.employees[data.employeeId] = data.siteId;
  });

  vehicleAssignmentsSnap.forEach((doc) => {
    const data = doc.data() as { vehicleId: string; siteId: string };
    assignments.vehicles[data.vehicleId] = data.siteId;
  });

  return {
    sites: sitesSnap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Site) })),
    employees: employeesSnap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Employee) })),
    vehicles: vehiclesSnap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Vehicle) })),
    assignments,
  };
}

export async function assignEmployeeToSite(employeeId: string, siteId: string) {
  await db.collection(EMPLOYEE_ASSIGNMENTS_COLLECTION).doc(employeeId).set({
    employeeId,
    siteId,
    assignedAt: Timestamp.now(),
  });
}

export async function assignVehicleToSite(vehicleId: string, siteId: string) {
  await db.collection(VEHICLE_ASSIGNMENTS_COLLECTION).doc(vehicleId).set({
    vehicleId,
    siteId,
    assignedAt: Timestamp.now(),
  });
}
