
export type Inspection = {
  vehicle: string;
  date: string;
  inspector: string;
  status: "Passed" | "Failed";
  damages: number;
};

export const allInspections: Inspection[] = [
  {
    vehicle: "Bakkie 1 - HLU 456 GP",
    date: "2024-07-20",
    inspector: "John Doe",
    status: "Passed",
    damages: 0,
  },
  {
    vehicle: "Truck 5 - KJL 123 NW",
    date: "2024-07-20",
    inspector: "Jane Smith",
    status: "Failed",
    damages: 2,
  },
  {
    vehicle: "Crane 2 - GHY 789 LP",
    date: "2024-07-19",
    inspector: "John Doe",
    status: "Passed",
    damages: 0,
  },
  {
    vehicle: "Bakkie 3 - DFR 345 FS",
    date: "2024-07-18",
    inspector: "Mike Johnson",
    status: "Passed",
    damages: 1,
  },
   {
    vehicle: "Excavator 1 - TUV 987 MP",
    date: "2024-07-21",
    inspector: "Jane Smith",
    status: "Passed",
    damages: 0,
  },
];
