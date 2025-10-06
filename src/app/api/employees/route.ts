// src/app/api/employees/route.ts
import { NextResponse } from "next/server";
import { db, Timestamp } from "@/lib/firebase-admin";

interface Course {
  id: string;
  name: string;
  // Add other relevant course properties here if known
}

interface EmployeePayload {
  firstName: string;
  surname: string;
  idNumber: string;
  codeLicense?: string;
  courses?: Course[];
}

interface Employee {
  id: string;
  firstName: string;
  surname: string;
  idNumber: string;
  codeLicense?: string;
  courses?: Course[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export async function GET() {
  try {
    const snapshot = await db.collection("employees").get();
    const employees: Employee[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Employee[];

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
    const { firstName, surname, idNumber, codeLicense } = body;

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
      codeLicense: codeLicense || "",
      courses: [],
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
