"use server";

import { db, Timestamp } from "@/lib/firebase-admin";
import { storage } from "@/lib/firebase-admin";
import { getEmployeesWithTraining, getCompanyTrainingStats } from "@/lib/training-service";
import type { EmployeeWithTraining, TrainingCourse } from "@/types/training";

interface ReportOptions {
  companyId: string;
  userId: string;
  reportType: "all-employees" | "expiring-soon" | "expired" | "compliance";
  includeDetails?: boolean;
}

/**
 * Generate a CSV report of employee training data
 */
export async function generateTrainingReport(options: ReportOptions) {
  const { companyId, userId, reportType, includeDetails = true } = options;

  try {
    // Fetch the data
    const employees = await getEmployeesWithTraining(companyId);
    const stats = await getCompanyTrainingStats(companyId);

    // Filter based on report type
    let filteredEmployees = employees;
    let reportTitle = "";

    switch (reportType) {
      case "expiring-soon":
        filteredEmployees = employees.filter(emp => emp.expiringCoursesCount > 0);
        reportTitle = "Courses Expiring Soon Report";
        break;
      case "expired":
        filteredEmployees = employees.filter(emp => emp.expiredCoursesCount > 0);
        reportTitle = "Expired Courses Report";
        break;
      case "compliance":
        reportTitle = "Compliance Report";
        break;
      case "all-employees":
      default:
        reportTitle = "All Employees Training Report";
        break;
    }

    // Generate CSV content
    const csv = generateCSV(filteredEmployees, stats, reportTitle, includeDetails);

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").split("T")[0];
    const filename = `training-report-${reportType}-${timestamp}.csv`;

    // Upload to Firebase Storage in generated-documents folder
    const bucket = storage.bucket();
    const file = bucket.file(`generated-documents/${companyId}/${filename}`);

    await file.save(csv, {
      contentType: "text/csv",
      metadata: {
        contentType: "text/csv",
        metadata: {
          userId,
          companyId,
          reportType,
          generatedAt: new Date().toISOString(),
        },
      },
    });

    // Make file publicly accessible or get signed URL
    const [url] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Save report metadata to Firestore
    const reportRef = db.collection("training_reports").doc();
    await reportRef.set({
      companyId,
      userId,
      reportType,
      reportTitle,
      filename,
      downloadUrl: url,
      employeeCount: filteredEmployees.length,
      expiringCount: stats.expiringCourses,
      expiredCount: stats.expiredCourses,
      totalCourses: stats.totalCourses,
      generatedAt: Timestamp.now(),
      status: "completed",
    });

    return {
      success: true,
      reportId: reportRef.id,
      downloadUrl: url,
      filename,
      employeeCount: filteredEmployees.length,
    };
  } catch (error: any) {
    console.error("Error generating report:", error);
    throw new Error(error.message || "Failed to generate report");
  }
}

/**
 * Generate CSV content from employee training data
 */
function generateCSV(
  employees: EmployeeWithTraining[],
  stats: any,
  reportTitle: string,
  includeDetails: boolean
): string {
  const lines: string[] = [];

  // Header
  lines.push(reportTitle);
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push("");

  // Summary Statistics
  lines.push("SUMMARY STATISTICS");
  lines.push(`Total Employees,${stats.totalEmployees}`);
  lines.push(`Total Courses,${stats.totalCourses}`);
  lines.push(`Valid Courses,${stats.validCourses}`);
  lines.push(`Expiring Soon,${stats.expiringCourses}`);
  lines.push(`Expired,${stats.expiredCourses}`);
  lines.push(`Compliance Rate,${stats.complianceRate}%`);
  lines.push("");

  if (includeDetails) {
    // Detailed Employee and Training Data
    lines.push("EMPLOYEE TRAINING DETAILS");
    lines.push(
      "Employee Name,ID Number,Email,Cell Phone,Position,Department,Course Name,Provider,Certificate #,Completion Date,Expiry Date,Validity (months),Status"
    );

    for (const employee of employees) {
      if (employee.trainings.length === 0) {
        // Employee with no training
        lines.push(
          `"${employee.firstName} ${employee.lastName}","${employee.idNumber}","${employee.email}","${employee.cellphone}","${employee.position || ""}","${employee.department || ""}","No training recorded","","","","","",""`
        );
      } else {
        // Employee with training courses
        for (const training of employee.trainings) {
          const completionDate = formatDateForCSV(training.completionDate);
          const expiryDate = formatDateForCSV(training.expiryDate);

          lines.push(
            `"${employee.firstName} ${employee.lastName}","${employee.idNumber}","${employee.email}","${employee.cellphone}","${employee.position || ""}","${employee.department || ""}","${training.courseName}","${training.courseProvider || ""}","${training.certificateNumber || ""}","${completionDate}","${expiryDate}","${training.validityPeriod}","${training.status}"`
          );
        }
      }
    }
  } else {
    // Summary view only
    lines.push("EMPLOYEE SUMMARY");
    lines.push(
      "Employee Name,ID Number,Email,Cell Phone,Total Courses,Expiring Soon,Expired,Status"
    );

    for (const employee of employees) {
      const status = employee.expiredCoursesCount > 0
        ? "EXPIRED"
        : employee.expiringCoursesCount > 0
        ? "EXPIRING SOON"
        : "ALL VALID";

      lines.push(
        `"${employee.firstName} ${employee.lastName}","${employee.idNumber}","${employee.email}","${employee.cellphone}","${employee.trainings.length}","${employee.expiringCoursesCount}","${employee.expiredCoursesCount}","${status}"`
      );
    }
  }

  return lines.join("\n");
}

/**
 * Format Firestore Timestamp or Date for CSV
 */
function formatDateForCSV(date: any): string {
  if (!date) return "";
  const d = date.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString();
}

/**
 * Get all training reports for a company
 */
export async function getTrainingReports(companyId: string) {
  const snapshot = await db
    .collection("training_reports")
    .where("companyId", "==", companyId)
    .orderBy("generatedAt", "desc")
    .limit(50)
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

/**
 * Delete a training report
 */
export async function deleteTrainingReport(reportId: string) {
  const reportDoc = await db.collection("training_reports").doc(reportId).get();

  if (!reportDoc.exists) {
    throw new Error("Report not found");
  }

  const reportData = reportDoc.data();

  // Delete file from storage
  try {
    const bucket = storage.bucket();
    const file = bucket.file(`generated-documents/${reportData?.companyId}/${reportData?.filename}`);
    await file.delete();
  } catch (error) {
    console.error("Error deleting report file:", error);
    // Continue even if file deletion fails
  }

  // Delete Firestore document
  await reportDoc.ref.delete();

  return { success: true };
}
