import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Extract [id] from the context object
    const { id } = params;

    // Example: process request body
    const body = await request.json();

    // TODO: replace with your actual logic
    // e.g., save a course for the employee with this id
    return NextResponse.json({
      message: `Handled employee ${id}`,
      received: body,
    });
  } catch (error: any) {
    console.error("Error handling POST /employees/[id]/courses:", error);
    return NextResponse.json(
      { message: "Failed to handle request", error: error.message },
      { status: 500 }
    );
  }
}
