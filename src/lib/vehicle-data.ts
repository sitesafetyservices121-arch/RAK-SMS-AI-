
export type DamageReport = {
  x: number;
  y: number;
  description: string;
};

export type Inspection = {
  vehicle: string;
  date: string;
  inspector: string;
  status: "Passed" | "Failed" | "Awaiting Inspection";
  damages: DamageReport[];
};

export const allInspections: Inspection[] = [
  {
    vehicle: "Bakkie 1 - HLU 456 GP",
    date: "2024-07-20",
    inspector: "John Doe",
    status: "Passed",
    damages: [],
  },
  {
    vehicle: "Truck 5 - KJL 123 NW",
    date: "2024-07-20",
    inspector: "Jane Smith",
    status: "Failed",
    damages: [
        { x: 680, y: 140, description: "Cracked right headlight" },
        { x: 350, y: 210, description: "Dent on driver side door" },
    ],
  },
  {
    vehicle: "Crane 2 - GHY 789 LP",
    date: "2024-07-19",
    inspector: "John Doe",
    status: "Passed",
    damages: [],
  },
  {
    vehicle: "Bakkie 3 - DFR 345 FS",
    date: "2024-07-18",
    inspector: "Mike Johnson",
    status: "Passed",
    damages: [
        { x: 140, y: 180, description: "Scratched front fender" }
    ],
  },
   {
    vehicle: "Excavator 1 - TUV 987 MP",
    date: "2024-07-21",
    inspector: "Jane Smith",
    status: "Passed",
    damages: [],
  },
];
