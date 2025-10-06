
// ==============================
// Vehicle Inspection Data (Production-ready)
// ==============================
import type { Inspection } from '@/types/inspections';

// ==============================
// Mock Data
// ==============================

export const allInspections: Omit<Inspection, 'id'>[] = [
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
