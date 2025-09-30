
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
  date: string; // Inspection Date
  inspector: string;
  status: "Passed" | "Failed" | "Awaiting Inspection";
  damages: DamageReport[];
};

export const allInspections: Inspection[] = [
  {
    vehicle: "Bakkie 1",
    numberPlate: "HLU 456 GP",
    driverName: "John",
    driverSurname: "Doe",
    lastService: "2024-06-01",
    nextService: "2025-06-01",
    licenseDiscExpiry: "2025-05-31",
    date: "2024-07-20",
    inspector: "John Doe",
    status: "Passed",
    damages: [],
  },
  {
    vehicle: "Truck 5",
    numberPlate: "KJL 123 NW",
    driverName: "Mike",
    driverSurname: "Johnson",
    lastService: "2024-05-15",
    nextService: "2024-11-15",
    licenseDiscExpiry: "2024-10-31",
    date: "2024-07-20",
    inspector: "Jane Smith",
    status: "Failed",
    damages: [
        { x: 680, y: 140, description: "Cracked right headlight" },
        { x: 350, y: 210, description: "Dent on driver side door" },
    ],
  },
  {
    vehicle: "Crane 2",
    numberPlate: "GHY 789 LP",
    driverName: "Jane",
    driverSurname: "Smith",
    lastService: "2024-07-01",
    nextService: "2025-01-01",
    licenseDiscExpiry: "2025-06-30",
    date: "2024-07-19",
    inspector: "John Doe",
    status: "Passed",
    damages: [],
  },
  {
    vehicle: "Bakkie 3",
    numberPlate: "DFR 345 FS",
    driverName: "Peter",
    driverSurname: "Jones",
    lastService: "2024-04-10",
    nextService: "2025-04-10",
    licenseDiscExpiry: "2025-02-28",
    date: "2024-07-18",
    inspector: "Mike Johnson",
    status: "Passed",
    damages: [
        { x: 140, y: 180, description: "Scratched front fender" }
    ],
  },
   {
    vehicle: "Excavator 1",
    numberPlate: "TUV 987 MP",
    driverName: "David",
    driverSurname: "Williams",
    lastService: "2024-07-05",
    nextService: "2025-01-05",
    licenseDiscExpiry: "2025-07-31",
    date: "2024-07-21",
    inspector: "Jane Smith",
    status: "Passed",
    damages: [],
  },
];
