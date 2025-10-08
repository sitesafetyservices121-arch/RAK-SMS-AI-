// src/types/core-types.ts
// Type definitions for the application data models

// ==============================
// Employee Types
// ==============================

export type CourseStatus = "Completed" | "Expired" | "Scheduled";

export type Course = {
  courseName: string;
  status: CourseStatus;
  expiryDate: string | null; // ISO date string or null if not applicable
};

export type Employee = {
  id: string;
  firstName: string;
  surname: string;
  idNumber: string;
  codeLicense: string | null;
  courses: Course[];
};

// ==============================
// PPE Types
// ==============================

export type PpeCategory = "Head" | "Feet" | "Body" | "Hands" | "Other";

export type PpeItem = {
  id: string;
  name: string;
  category: PpeCategory;
};

export type PpeRegisterEntry = {
  employeeId: string;
  ppeItemId: string;
  dateIssued: string; // ISO date string
  validUntil: string; // ISO date string
  signature: "Signed" | "Pending";
};

// ==============================
// Vehicle Types
// ==============================

export type InspectionStatus = "Passed" | "Failed" | "Awaiting Inspection";

export type Vehicle = {
  vehicle: string;
  status: InspectionStatus;
};

// ==============================
// Site Types
// ==============================

export type Site = {
  id: string;
  name: string;
  location: string;
};
