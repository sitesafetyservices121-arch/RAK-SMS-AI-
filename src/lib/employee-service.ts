// src/lib/employee-service.ts
// Re-export types from core types (types can be re-exported)
export type {
  Employee,
  Course,
  CourseStatus,
  PpeItem,
  PpeCategory,
  PpeRegisterEntry
} from "@/types/core-types";

// For server functions, import them directly from core-service instead of re-exporting
// Example usage:
// import { getAllEmployees, getEmployeeById } from "@/lib/core-service";
