
// src/app/api/employees/[id]/courses/route.ts
import { NextResponse, NextRequest } from "next/server";
import { db, Timestamp } from "@/lib/firebase-admin";

interface CoursePayload {
  courseName: string;
  status: "Completed" | "Expired" | "Scheduled";
  expiryDate?: string | null;
}

/**
 * POST /api/employees/:id/courses
 * Add a new course to an employee
 */
export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const employeeId = context.params.id;
    const body: CoursePayload = await request.json();

    if (!body.courseName || !body.status) {
      return NextResponse.json(
        { success: false, error: "Missing course fields" },
        { status: 400 }
      );
    }

    const employeeRef = db.collection("employees").doc(employeeId);
    const employeeSnap = await employeeRef.get();

    if (!employeeSnap.exists) {
      return NextResponse.json(
        { success: false, error: "Employee not found" },
        { status: 404 }
      );
    }

    const employeeData = employeeSnap.data();
    const newCourse = {
      courseName: body.courseName,
      status: body.status,
      expiryDate: body.expiryDate || null,
      addedAt: Timestamp.now(),
    };

    const updatedCourses = [...(employeeData?.courses || []), newCourse];

    await employeeRef.update({
      courses: updatedCourses,
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      data: newCourse,
      message: "✅ Course added successfully",
    });
  } catch (error: unknown) {
    console.error("🔥 Failed to add course:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add course" },
      { status: 500 }
    );
  }
}
