// ==============================
// Employee & PPE Data Structures
// ==============================

export type Course = {
  courseName: string;
  status: "Completed" | "Expired" | "Scheduled";
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

export type PpeItem = {
  id: string;
  name: string;
  category: "Head" | "Feet" | "Body" | "Hands" | "Other";
};

export type PpeRegisterEntry = {
  employeeId: string;
  ppeItemId: string;
  dateIssued: string; // ISO date string
  validUntil: string; // ISO date string
  signature: "Signed" | "Pending";
};

// ==============================
// Initial Data
// ==============================

export const initialEmployees: Employee[] = [
  {
    id: "EMP-001",
    firstName: "John",
    surname: "Doe",
    idNumber: "8501015000087",
    codeLicense: "C1",
    courses: [
      {
        courseName: "First Aid Level 1",
        status: "Completed",
        expiryDate: "2025-08-01",
      },
      {
        courseName: "Working at Heights",
        status: "Completed",
        expiryDate: "2026-01-15",
      },
    ],
  },
  {
    id: "EMP-002",
    firstName: "Jane",
    surname: "Smith",
    idNumber: "9003155111086",
    codeLicense: null,
    courses: [
      {
        courseName: "HIRA",
        status: "Scheduled",
        expiryDate: null,
      },
      {
        courseName: "Fire Fighting",
        status: "Expired",
        expiryDate: "2024-05-20",
      },
    ],
  },
  {
    id: "EMP-003",
    firstName: "Mike",
    surname: "Johnson",
    idNumber: "7811235222081",
    codeLicense: "EC1",
    courses: [
      {
        courseName: "Forklift Operator",
        status: "Completed",
        expiryDate: "2025-11-10",
      },
    ],
  },
];

export const ppeItems: PpeItem[] = [
  { id: "ppe-hd-01", name: "Hard Hat", category: "Head" },
  { id: "ppe-ft-01", name: "Safety Boots", category: "Feet" },
  { id: "ppe-bd-01", name: "Reflective Vest", category: "Body" },
  { id: "ppe-hg-01", name: "Gloves", category: "Hands" },
];

export const ppeRegister: PpeRegisterEntry[] = [
  {
    employeeId: "EMP-001",
    ppeItemId: "ppe-hd-01",
    dateIssued: "2024-01-10",
    validUntil: "2025-01-10",
    signature: "Signed",
  },
  {
    employeeId: "EMP-002",
    ppeItemId: "ppe-ft-01",
    dateIssued: "2024-02-15",
    validUntil: "2025-02-15",
    signature: "Signed",
  },
  {
    employeeId: "EMP-003",
    ppeItemId: "ppe-bd-01",
    dateIssued: "2024-03-01",
    validUntil: "2025-03-01",
    signature: "Signed",
  },
  {
    employeeId: "EMP-001",
    ppeItemId: "ppe-hg-01",
    dateIssued: "2024-05-20",
    validUntil: "2024-11-20",
    signature: "Signed",
  },
];

// ==============================
// Helper Functions
// ==============================

/**
 * Get PPE issued to a specific employee.
 */
export function getEmployeePpe(employeeId: string) {
  return ppeRegister
    .filter((entry) => entry.employeeId === employeeId)
    .map((entry) => ({
      ...entry,
      item: ppeItems.find((i) => i.id === entry.ppeItemId) || null,
    }));
}

/**
 * Check if an employee has any expired courses.
 */
export function hasExpiredCourses(employee: Employee) {
  return employee.courses.some((c) => c.status === "Expired");
}

/**
 * Get a complete employee profile with PPE and course status.
 */
export function getEmployeeProfile(employeeId: string) {
  const employee = initialEmployees.find((e) => e.id === employeeId);
  if (!employee) return null;

  return {
    ...employee,
    ppe: getEmployeePpe(employeeId),
    hasExpiredCourses: hasExpiredCourses(employee),
  };
}
