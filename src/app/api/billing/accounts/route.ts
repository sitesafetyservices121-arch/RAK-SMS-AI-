import { NextResponse } from "next/server";
import {
  createBillingAccount,
  listBillingAccounts,
} from "@/lib/billing-service";
import type { BillingAccount } from "@/types/billing";

export async function GET() {
  try {
    const accounts = await listBillingAccounts();
    return NextResponse.json({ success: true, data: accounts });
  } catch (error) {
    console.error("Failed to fetch billing accounts", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch billing accounts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Omit<BillingAccount, "id">;
    if (!body.companyName || !body.primaryContact || !body.subscriptionPlan) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const saved = await createBillingAccount({
      ...body,
      balanceDue: body.balanceDue ?? 0,
      userCount: body.userCount ?? 0,
      status: body.status ?? "Active",
      currency: body.currency ?? "ZAR",
    });

    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error) {
    console.error("Failed to create billing account", error);
    return NextResponse.json(
      { success: false, error: "Failed to create billing account" },
      { status: 500 }
    );
  }
}
