// src/lib/core-service.ts
'use server';

import { db } from "@/lib/firebase-admin";
import type {
  Employee,
  Course,
  PpeItem,
  PpeRegisterEntry,
  Vehicle,
  Site,
  InspectionStatus
} from "@/types/core-types";

// Firestore document types
export type EmployeeDoc = Employee & { id: string };
export type VehicleDoc = Vehicle & { id: string };
export type SiteDoc = Site & { id: string };
export type PpeItemDoc = PpeItem & { id: string };
export type PpeRegisterDoc = PpeRegisterEntry & { id: string };

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

// ==============================
// PPE Items
// ==============================
export async function getAllPpeItems(): Promise<PpeItemDoc[]> {
  const snapshot = await db.collection("ppeItems").get();
  return snapshot.docs.map((doc) => ({
    ...(doc.data() as PpeItem),
    id: doc.id,
  }));
}

export async function getPpeItemById(id: string): Promise<PpeItemDoc | null> {
  const docSnap = await db.collection("ppeItems").doc(id).get();
  if (!docSnap.exists) return null;
  return { ...(docSnap.data() as PpeItem), id: docSnap.id };
}

// ==============================
// PPE Register
// ==============================
export async function getAllPpeRegisterEntries(): Promise<PpeRegisterDoc[]> {
  const snapshot = await db.collection("ppeRegister").get();
  return snapshot.docs.map((doc) => ({
    ...(doc.data() as PpeRegisterEntry),
    id: doc.id,
  }));
}

export async function getPpeRegisterByEmployeeId(employeeId: string): Promise<PpeRegisterDoc[]> {
  const snapshot = await db.collection("ppeRegister")
    .where("employeeId", "==", employeeId)
    .get();

  return snapshot.docs.map((doc) => ({
    ...(doc.data() as PpeRegisterEntry),
    id: doc.id,
  }));
}

/**
 * Get PPE issued to a specific employee with item details
 */
export async function getEmployeePpeWithDetails(employeeId: string) {
  const ppeEntries = await getPpeRegisterByEmployeeId(employeeId);
  const ppeItems = await getAllPpeItems();

  return ppeEntries.map((entry) => ({
    ...entry,
    item: ppeItems.find((item) => item.id === entry.ppeItemId) || null,
  }));
}

/**
 * Get complete employee profile with PPE and course information
 */
export async function getEmployeeProfile(employeeId: string) {
  const employee = await getEmployeeById(employeeId);
  if (!employee) return null;

  const ppe = await getEmployeePpeWithDetails(employeeId);

  // Check if any courses are expired
  const hasExpiredCourses = employee.courses?.some((c: Course) => c.status === "Expired") || false;

  return {
    ...employee,
    ppe,
    hasExpiredCourses,
  };
}
