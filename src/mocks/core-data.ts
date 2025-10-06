// src/mocks/core-data.ts

// ==============================
// Employee Data
// ==============================

export type Employee = {
  id: string;
  firstName: string;
  surname: string;
  idNumber: string;
};

export const initialEmployees: Employee[] = [
  { id: "EMP-001", firstName: "John", surname: "Doe", idNumber: "8501015000087" },
  { id: "EMP-002", firstName: "Jane", surname: "Smith", idNumber: "9003155111086" },
  { id: "EMP-003", firstName: "Mike", surname: "Johnson", idNumber: "7811235222081" },
  { id: "EMP-004", firstName: "Sarah", surname: "Williams", idNumber: "9207185333089" },
];

// ==============================
// Vehicle Data
// ==============================

export type InspectionStatus = "Passed" | "Failed" | "Awaiting Inspection";

export type Vehicle = {
  vehicle: string;
  status: InspectionStatus;
};

export const initialVehicles: Vehicle[] = [
  { vehicle: "Bakkie 1", status: "Awaiting Inspection" },
  { vehicle: "Truck 2", status: "Passed" },
  { vehicle: "Van 3", status: "Failed" },
  { vehicle: "Bakkie 4", status: "Passed" },
];

// ==============================
// Site Data
// ==============================

export type Site = {
  id: string;
  name: string;
  location: string;
};

export const initialSites: Site[] = [
  { id: "site-01", name: "ConstructCo HQ", location: "Johannesburg" },
  { id: "site-02", name: "BuildIt Site B", location: "Pretoria" },
  { id: "site-03", name: "InfraWorks Project", location: "Cape Town" },
];
