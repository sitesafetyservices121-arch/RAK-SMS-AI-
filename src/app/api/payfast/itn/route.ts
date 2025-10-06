// src/app/api/payfast/itn/route.ts
import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/firebase-admin";
import { generateSignature } from "@/lib/payfast"; // Corrected import

// PayFast IP ranges (simplified list)
const validIpRanges = [
  "197.97.145.145",
    "196.33.227.",
      "41.74.179.",
      ];


// Helper: Validate source IP
function isIpAllowed(ip: string | null): boolean {
  if (!ip) return false;
    return validIpRanges.some((prefix) => ip.startsWith(prefix));
}

export async function POST(request: NextRequest) {
  try {
    const bodyText = await request.text();
    if (!bodyText) {
      return new NextResponse("Empty request body", { status: 400 });
    }

    // Parse form data
    const pfData = new URLSearchParams(bodyText);
    const pfDataObject: Record<string, string> = {};
    for (const [key, value] of pfData.entries()) {
      pfDataObject[key] = value;
    }

    // Validate signature
    const pfValidSignature = generateSignature(
      pfDataObject,
      process.env.PAYFAST_PASSPHRASE
    );
    const isSignatureValid =
      pfDataObject.signature?.toLowerCase() === pfValidSignature.toLowerCase();

    // Validate IP (only via x-forwarded-for header in Next.js)
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
    const isIpValid = isIpAllowed(ip);

    if (isSignatureValid && isIpValid) {
      const paymentId = pfDataObject.m_payment_id || crypto.randomUUID();
      const pfPaymentId = pfDataObject.pf_payment_id;
      const amount = parseFloat(pfDataObject.amount_gross || "0");
      const userEmail = pfDataObject.email_address;

      try {
        await db.collection("payments").doc(paymentId).set(
          {
            paymentId,
            pfPaymentId,
            userEmail,
            amount,
            status: pfDataObject.payment_status,
            timestamp: new Date().toISOString(),
            payfastData: pfDataObject,
          },
          { merge: true }
        );
        return new NextResponse("OK", { status: 200 });
      } catch (error) {
        console.error("🔥 Failed to save payment data:", error);
        return new NextResponse("Error saving payment data", { status: 500 });
      }
    } else {
      return new NextResponse("Invalid request", { status: 400 });
    }
  } catch (error) {
    console.error("🔥 Failed to process ITN:", error);
    return new NextResponse("OK", { status: 200 }); // Always 200 for PayFast
  }
}
