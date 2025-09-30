
export type Course = {
  courseName: string;
  status: "Completed" | "Expired" | "Scheduled";
  expiryDate: string;
};

export type Employee = {
  id: string;
  firstName: string;
  surname: string;
  idNumber: string;
  codeLicense: string;
  courses: Course[];
};

export const initialEmployees: Employee[] = [
  {
    id: "EMP-001",
    firstName: "John",
    surname: "Doe",
    idNumber: "8501015000087",
    codeLicense: "C1",
    courses: [
      { courseName: "First Aid Level 1", status: "Completed", expiryDate: "2025-08-01" },
      { courseName: "Working at Heights", status: "Completed", expiryDate: "2026-01-15" },
    ],
  },
  {
    id: "EMP-002",
    firstName: "Jane",
    surname: "Smith",
    idNumber: "9003155111086",
    codeLicense: "N/A",
    courses: [
        { courseName: "HIRA", status: "Scheduled", expiryDate: "N/A" },
        { courseName: "Fire Fighting", status: "Expired", expiryDate: "2024-05-20" },
    ],
  },
  {
    id: "EMP-003",
    firstName: "Mike",
    surname: "Johnson",
    idNumber: "7811235222081",
    codeLicense: "EC1",
    courses: [
        { courseName: "Forklift Operator", status: "Completed", expiryDate: "2025-11-10" },
    ],
  },
];

export const ppeRegister = [
  {
    employeeId: "EMP-001",
    item: "Hard Hat",
    dateIssued: "2024-01-10",
    signature: "Signed",
  },
  {
    employeeId: "EMP-002",
    item: "Safety Boots",
    dateIssued: "2024-02-15",
    signature: "Signed",
  },
  {
    employeeId: "EMP-003",
    item: "Reflective Vest",
    dateIssued: "2024-03-01",
    signature: "Signed",
  },
  {
    employeeId: "EMP-001",
    item: "Safety Gloves",
    dateIssued: "2024-05-20",
    signature: "Signed",
  },
];
