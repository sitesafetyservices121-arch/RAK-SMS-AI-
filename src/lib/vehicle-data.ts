// ==============================
// Vehicle Inspection Data
// ==============================

/**
 * Possible inspection statuses for vehicles.
 */
export type InspectionStatus = "Passed" | "Failed" | "Awaiting Inspection";

/**
 * Represents a specific damage report with position and description.
 */
export type DamageReport = {
  x: number; // X-coordinate (e.g., on vehicle diagram)
  y: number; // Y-coordinate
  description: string; // Description of the damage
};

/**
 * Represents a vehicle inspection record.
 */
export type Inspection = {
  vehicle: string;
  numberPlate: string;
  driverName: string;
  driverSurname: string;
  lastService: string; // ISO date string
  nextService: string; // ISO date string
  licenseDiscExpiry: string; // ISO date string
  date: string; // Inspection date (ISO)
  inspector: string;
  status: InspectionStatus;
  damages: DamageReport[];
};

// ==============================
// Mock Data
// ==============================

export const allInspections: Inspection[] = [
  {
    vehicle: "Bakkie 1",
    numberPlate: "ABC 123 GP",
    driverName: "John",
    driverSurname: "Doe",
    lastService: "2024-06-01",
    nextService: "2024-12-01",
    licenseDiscExpiry: "2025-03-15",
    date: "2024-07-01",
    inspector: "System",
    status: "Awaiting Inspection",
    damages: [],
  },
  {
    vehicle: "Truck 2",
    numberPlate: "XYZ 987 GP",
    driverName: "Jane",
    driverSurname: "Smith",
    lastService: "2024-05-15",
    nextService: "2024-11-15",
    licenseDiscExpiry: "2025-02-20",
    date: "2024-07-05",
    inspector: "System",
    status: "Passed",
    damages: [
      { x: 300, y: 160, description: "Scratch on door" },
    ],
  },
];
