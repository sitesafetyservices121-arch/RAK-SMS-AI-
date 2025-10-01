// Vehicle inspection related types

export type InspectionStatus = "Passed" | "Failed" | "Awaiting Inspection";

export type DamageReport = {
  x: number;
  y: number;
  description: string;
};

export type Inspection = {
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
};

// Mock data
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
