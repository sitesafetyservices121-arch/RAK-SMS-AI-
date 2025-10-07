"use server";

import { db, Timestamp } from "@/lib/firebase-admin";
import type { Employee, TrainingCourse, Company, EmployeeWithTraining } from "@/types/training";

// ==============================
// Company Management
// ==============================

export async function createCompany(data: Omit<Company, "id" | "createdAt" | "updatedAt">) {
  const companyRef = db.collection("companies").doc();
  const company: Company = {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
  await companyRef.set(company);
  return { id: companyRef.id, ...company };
}

export async function getCompaniesByUser(userId: string) {
  // For now, get user's company from user document
  const userDoc = await db.collection("users").doc(userId).get();
  const userData = userDoc.data();

  if (!userData?.companyId) {
    return [];
  }

  const companyDoc = await db.collection("companies").doc(userData.companyId).get();
  if (!companyDoc.exists) {
    return [];
  }

  return [{ id: companyDoc.id, ...companyDoc.data() as Company }];
}

export async function getAllCompanies() {
  const snapshot = await db.collection("companies").get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Company }));
}

// ==============================
// Employee Management
// ==============================

export async function createEmployee(data: Omit<Employee, "id" | "createdAt" | "updatedAt">) {
  const employeeRef = db.collection("employees").doc();
  const employee: Employee = {
    ...data,
    status: data.status || "active",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
  await employeeRef.set(employee);
  return { id: employeeRef.id, ...employee };
}

export async function updateEmployee(id: string, data: Partial<Employee>) {
  await db.collection("employees").doc(id).update({
    ...data,
    updatedAt: Timestamp.now(),
  });
  return { success: true };
}

export async function deleteEmployee(id: string) {
  // Also delete all training records for this employee
  const trainings = await db.collection("training_courses")
    .where("employeeId", "==", id)
    .get();

  const batch = db.batch();
  batch.delete(db.collection("employees").doc(id));
  trainings.docs.forEach(doc => batch.delete(doc.ref));

  await batch.commit();
  return { success: true };
}

export async function getEmployeesByCompany(companyId: string): Promise<Employee[]> {
  const snapshot = await db.collection("employees")
    .where("companyId", "==", companyId)
    .where("status", "==", "active")
    .orderBy("lastName")
    .get();

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Employee }));
}

export async function getEmployeeById(id: string): Promise<Employee | null> {
  const doc = await db.collection("employees").doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() as Employee };
}

// ==============================
// Training Course Management
// ==============================

export async function addTrainingCourse(data: Omit<TrainingCourse, "id" | "status" | "createdAt" | "updatedAt">) {
  const courseRef = db.collection("training_courses").doc();

  // Calculate status based on expiry date
  const expiryDate = data.expiryDate instanceof Date ? data.expiryDate : data.expiryDate.toDate();
  const now = new Date();
  const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  let status: "valid" | "expiring-soon" | "expired" = "valid";
  if (daysUntilExpiry < 0) {
    status = "expired";
  } else if (daysUntilExpiry <= 30) {
    status = "expiring-soon";
  }

  const course: TrainingCourse = {
    ...data,
    status,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await courseRef.set(course);
  return { id: courseRef.id, ...course };
}

export async function updateTrainingCourse(id: string, data: Partial<TrainingCourse>) {
  // Recalculate status if expiry date is being updated
  let updateData: any = { ...data, updatedAt: Timestamp.now() };

  if (data.expiryDate) {
    const expiryDate = data.expiryDate instanceof Date ? data.expiryDate : data.expiryDate.toDate();
    const now = new Date();
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      updateData.status = "expired";
    } else if (daysUntilExpiry <= 30) {
      updateData.status = "expiring-soon";
    } else {
      updateData.status = "valid";
    }
  }

  await db.collection("training_courses").doc(id).update(updateData);
  return { success: true };
}

export async function deleteTrainingCourse(id: string) {
  await db.collection("training_courses").doc(id).delete();
  return { success: true };
}

export async function getTrainingCoursesByEmployee(employeeId: string): Promise<TrainingCourse[]> {
  const snapshot = await db.collection("training_courses")
    .where("employeeId", "==", employeeId)
    .orderBy("expiryDate", "desc")
    .get();

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as TrainingCourse }));
}

export async function getEmployeesWithTraining(companyId: string): Promise<EmployeeWithTraining[]> {
  const employees = await getEmployeesByCompany(companyId);

  const employeesWithTraining = await Promise.all(
    employees.map(async (employee) => {
      const trainings = await getTrainingCoursesByEmployee(employee.id!);

      const expiringCoursesCount = trainings.filter(t => t.status === "expiring-soon").length;
      const expiredCoursesCount = trainings.filter(t => t.status === "expired").length;

      return {
        ...employee,
        trainings,
        expiringCoursesCount,
        expiredCoursesCount,
      };
    })
  );

  return employeesWithTraining;
}

// ==============================
// Notifications & Expiry Tracking
// ==============================

export async function getExpiringCourses(companyId: string, daysThreshold: number = 30) {
  const now = new Date();
  const thresholdDate = new Date(now.getTime() + (daysThreshold * 24 * 60 * 60 * 1000));

  const snapshot = await db.collection("training_courses")
    .where("companyId", "==", companyId)
    .where("expiryDate", "<=", Timestamp.fromDate(thresholdDate))
    .where("expiryDate", ">=", Timestamp.fromDate(now))
    .get();

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as TrainingCourse }));
}

export async function getExpiredCourses(companyId: string) {
  const now = new Date();

  const snapshot = await db.collection("training_courses")
    .where("companyId", "==", companyId)
    .where("expiryDate", "<", Timestamp.fromDate(now))
    .get();

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as TrainingCourse }));
}

// ==============================
// Statistics
// ==============================

export async function getCompanyTrainingStats(companyId: string) {
  const employees = await getEmployeesByCompany(companyId);
  const allCourses = await Promise.all(
    employees.map(emp => getTrainingCoursesByEmployee(emp.id!))
  );
  const courses = allCourses.flat();

  const expiringCourses = courses.filter(c => c.status === "expiring-soon");
  const expiredCourses = courses.filter(c => c.status === "expired");
  const validCourses = courses.filter(c => c.status === "valid");

  return {
    totalEmployees: employees.length,
    totalCourses: courses.length,
    validCourses: validCourses.length,
    expiringCourses: expiringCourses.length,
    expiredCourses: expiredCourses.length,
    complianceRate: courses.length > 0
      ? Math.round((validCourses.length / courses.length) * 100)
      : 100,
  };
}
