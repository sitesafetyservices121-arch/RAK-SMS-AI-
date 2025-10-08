// src/app/api/employees/route.ts
import { NextResponse } from "next/server";
import { db, Timestamp } from "@/lib/firebase-admin";
import type { Employee, Course } from "@/types/core-types";

interface EmployeePayload {
  firstName: string;
  surname: string;
  idNumber: string;
  codeLicense?: string | null;
  courses?: Course[];
}

interface EmployeeDoc extends Employee {
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export async function GET() {
  try {
    const snapshot = await db.collection("employees").get();
    const employees: EmployeeDoc[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as EmployeeDoc[];

    return NextResponse.json({ success: true, data: employees });
  } catch (error: unknown) {
    console.error("🔥 Failed to fetch employees:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: EmployeePayload = await request.json();
    const { firstName, surname, idNumber, codeLicense, courses } = body;

    if (!firstName || !surname || !idNumber) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const docRef = db.collection("employees").doc();
    const employee = {
      id: docRef.id,
      firstName,
      surname,
      idNumber,
      codeLicense: codeLicense || null,
      courses: courses || [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await docRef.set(employee);

    return NextResponse.json({ success: true, id: docRef.id, data: employee });
  } catch (error: unknown) {
    console.error("🔥 Failed to create employee:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create employee" },
      { status: 500 }
    );
  }
}
