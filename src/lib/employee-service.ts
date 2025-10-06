// src/lib/employee-service.ts

export type Employee = {
    id: string;
    firstName: string;
    surname: string;
    idNumber: string;
    codeLicense?: string | null;
  };
  
  export type PpeItem = {
    id: string;
    name: string;
    category: string;
  };
  
  // Mock employees (replace with Firestore fetch later)
  export const initialEmployees: Employee[] = [
    { id: "EMP-001", firstName: "John", surname: "Doe", idNumber: "8501015000087", codeLicense: "C1" },
    { id: "EMP-002", firstName: "Jane", surname: "Smith", idNumber: "9003155111086", codeLicense: null },
    { id: "EMP-003", firstName: "Mike", surname: "Johnson", idNumber: "7811235222081", codeLicense: "EC1" },
  ];
  
  // Mock PPE register
  export type PpeRegisterEntry = {
    employeeId: string;
    ppeItemId: string;
    dateIssued: string;
    validUntil: string;
    signature: "Signed" | "Pending";
  };
  
  export const ppeRegister: PpeRegisterEntry[] = [
    {
      employeeId: "EMP-001",
      ppeItemId: "ppe-hd-01",
      dateIssued: "2025-01-01",
      validUntil: "2025-07-01",
      signature: "Signed",
    },
    {
      employeeId: "EMP-002",
      ppeItemId: "ppe-ft-01",
      dateIssued: "2025-02-15",
      validUntil: "2026-02-15",
      signature: "Signed",
    },
  ];
  
