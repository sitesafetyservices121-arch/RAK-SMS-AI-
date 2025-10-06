import { NextResponse } from "next/server";
import { listGeneratedDocumentsByCompany } from "@/lib/generated-documents";
import { ensureCompanyId } from "@/lib/company-context";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyIdParam = searchParams.get("companyId");

  try {
    const companyId = ensureCompanyId(
      companyIdParam,
      "Generated documents API request"
    );
    const documents = await listGeneratedDocumentsByCompany(companyId);
    return NextResponse.json({ documents });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "companyId query parameter is required.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
