import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest
) {
  try {
    const id = request.nextUrl.pathname.split('/')[3];
    const body = await request.json();

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
