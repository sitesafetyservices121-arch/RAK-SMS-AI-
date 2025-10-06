
// src/types/inspections.ts

export type InspectionStatus = "Passed" | "Failed" | "Awaiting Inspection";

export type DamageReport = { 
  x: number; 
  y: number; 
  description: string; 
};

export type Inspection = {
  id: string;
  vehicle: string;
  numberPlate: string;
  driverName: string;
  driverSurname: string;
  lastService: string;
  nextService: string;
  licenseDiscExpiry: string;
  date: string;
  inspector: string;
  status: InspectionStatus;
  damages: DamageReport[];
  createdAt?: any; // Allow Firestore Timestamps
  updatedAt?: any;
};
