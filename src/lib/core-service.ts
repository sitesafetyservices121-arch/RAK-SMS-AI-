// src/lib/core-service.ts
'use server';

import { db } from "@/lib/firebase-admin";
import type { Employee, Vehicle, Site, InspectionStatus } from "@/mocks/core-data";

// Firestore document types
export type EmployeeDoc = Employee & { id: string };
export type VehicleDoc = Vehicle & { id: string };
export type SiteDoc = Site & { id: string };

// ==============================
// Employees
// ==============================
export async function getAllEmployees(): Promise<EmployeeDoc[]> {
  const snapshot = await db.collection("employees").get();
  return snapshot.docs.map((doc) => ({
    ...(doc.data() as Employee),
    id: doc.id,
  }));
}

export async function getEmployeeById(id: string): Promise<EmployeeDoc | null> {
  const docSnap = await db.collection("employees").doc(id).get();
  if (!docSnap.exists) return null;
  return { ...(docSnap.data() as Employee), id: docSnap.id };
}

// ==============================
// Vehicles
// ==============================
export async function getAllVehicles(): Promise<VehicleDoc[]> {
  const snapshot = await db.collection("vehicles").get();
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Vehicle),
  }));
}

export async function updateVehicleStatus(id: string, status: InspectionStatus) {
  await db.collection("vehicles").doc(id).update({ status });
  return { success: true };
}

// ==============================
// Sites
// ==============================
export async function getAllSites(): Promise<SiteDoc[]> {
  const snapshot = await db.collection("sites").get();
  return snapshot.docs.map((doc) => ({
    ...(doc.data() as Site),
    id: doc.id,
  }));
}

export async function getSiteById(id: string): Promise<SiteDoc | null> {
  const docSnap = await db.collection("sites").doc(id).get();
  if (!docSnap.exists) return null;
  return { ...(docSnap.data() as Site), id: docSnap.id };
}
