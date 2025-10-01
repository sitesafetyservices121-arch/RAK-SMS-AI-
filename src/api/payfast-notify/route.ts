import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "crypto";
export async function POST(request: NextRequest) {
  try {
    const { getDb } = await import("@/lib/firebase-admin");
    const bodyText = await request.text();
    if (!bodyText) {
      return new NextResponse("Empty request body", { status: 400 });
    }

    // Parse body into object
    const pfData = new URLSearchParams(bodyText);
    const pfDataObject: Record<string, string> = {};
    for (const [key, value] of pfData.entries()) {
      pfDataObject[key] = value;
    }

    // Validate signature
    const pfValidSignature = generateSignature(
      bodyText,
      process.env.PAYFAST_PASSPHRASE
    );
    const isSignatureValid = pfDataObject.signature === pfValidSignature;

    // TODO: Implement PayFast IP validation against their official IP list
    const isIpValid = true;

    if (isSignatureValid && isIpValid) {
      if (pfDataObject.payment_status === "COMPLETE") {
        const amount = parseFloat(pfDataObject.amount_gross || "0");
        const paymentId = pfDataObject.m_payment_id;
        const userEmail = pfDataObject.email_address;

        const firestore = getDb();
        await firestore.collection("payments").doc(paymentId).set({
          paymentId,
          userEmail,
          amount,
          status: "COMPLETE",
          timestamp: new Date().toISOString(),
          payfastData: pfDataObject, // optional: store raw data for auditing
        });
      }

      return new NextResponse(null, { status: 200 });
    } else {
      console.warn("PayFast ITN: Invalid signature or IP.", {
        pfDataObject,
        pfValidSignature,
      });
      return new NextResponse("Invalid request", { status: 400 });
    }
  } catch (error) {
    console.error("PayFast ITN Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
