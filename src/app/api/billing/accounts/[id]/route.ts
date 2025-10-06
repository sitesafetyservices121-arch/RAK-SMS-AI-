import { NextResponse } from "next/server";
import { updateBillingAccount } from "@/lib/billing-service";
import type { BillingAccount } from "@/types/billing";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = (await request.json()) as Partial<BillingAccount>;
    const updated = await updateBillingAccount(params.id, body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error(`Failed to update billing account ${params.id}`, error);
    return NextResponse.json(
      { success: false, error: "Failed to update billing account" },
      { status: 500 }
    );
  }
}
