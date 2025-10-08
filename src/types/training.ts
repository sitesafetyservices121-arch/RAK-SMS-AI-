import { Timestamp } from "firebase/firestore";

export interface Employee {
  id?: string;
  companyId: string; // Links to company for multi-tenant separation
  firstName: string;
  lastName: string;
  idNumber: string;
  cellphone: string;
  email: string;
  position?: string;
  department?: string;
  status: "active" | "inactive";
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface TrainingCourse {
  id?: string;
  employeeId: string;
  companyId: string;
  courseName: string;
  courseProvider?: string;
  certificateNumber?: string;
  completionDate: Timestamp | Date;
  expiryDate: Timestamp | Date;
  validityPeriod: number; // in months
  status: "valid" | "expiring-soon" | "expired";
  documents?: string[]; // URLs to uploaded certificates
  notes?: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface Company {
  id?: string;
  name: string;
  registrationNumber?: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  address?: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface TrainingReport {
  id?: string;
  companyId: string;
  reportType: "expiring-soon" | "expired" | "all-employees" | "compliance";
  generatedBy: string; // User ID
  generatedAt: Timestamp | Date;
  dateRange?: {
    from: Date;
    to: Date;
  };
  employeeCount: number;
  expiringCount: number;
  expiredCount: number;
  downloadUrl?: string;
  status: "generating" | "completed" | "failed";
}

export interface EmployeeWithTraining extends Employee {
  trainings: TrainingCourse[];
  expiringCoursesCount: number;
  expiredCoursesCount: number;
}

export type TrainingStatus = "valid" | "expiring-soon" | "expired";

export interface TrainingNotification {
  id?: string;
  companyId: string;
  employeeId: string;
  courseId: string;
  type: "expiring-30" | "expiring-14" | "expiring-7" | "expired";
  sentAt?: Timestamp | Date;
  read: boolean;
  createdAt: Timestamp | Date;
}
