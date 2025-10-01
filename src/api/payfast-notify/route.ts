import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Helper function to generate signature
const generateSignature = (rawBody: string, passphrase?: string): string => {
  // PayFast docs: "The data is concatenated into a string of 'key=value&' pairs in the order received."
  let signatureString = rawBody;

  // Remove the existing signature parameter if present
  signatureString = signatureString.replace(/&?signature=[^&]*/i, "");

  // Append passphrase if configured
  if (passphrase) {
    signatureString += `&passphrase=${encodeURIComponent(
      passphrase.trim()
    ).replace(/%20/g, "+")}`;
  }

  return crypto.createHash("md5").update(signatureString).digest("hex");
};

export async function POST(request: NextRequest) {
  try {
    const bodyText = await request.text();
    if (!bodyText) {
      return new NextResponse("Empty request body", { status: 400 });
    }

    // Parse into key-value pairs
    const pfData = new URLSearchParams(bodyText);
    const pfDataObject: Record<string, string> = {};
    for (const [key, value] of pfData.entries()) {
      pfDataObject[key] = value;
    }

    const pfValidSignature = generateSignature(
      bodyText,
      process.env.PAYFAST_PASSPHRASE
    );

    const isSignatureValid = pfDataObject.signature === pfValidSignature;

    // TODO: implement proper PayFast IP validation
    const isIpValid = true;

    if (isSignatureValid && isIpValid) {
      // Payment was successful
      if (pfDataObject.payment_status === "COMPLETE") {
        const amount = parseFloat(pfDataObject.amount_gross);
        const paymentId = pfDataObject.m_payment_id;
        const userEmail = pfDataObject.email_address;
        
        const firestore = await db;
        await firestore.collection("payments").doc(paymentId).set({
          paymentId,
          userEmail,
          amount,
          status: "COMPLETE",
          timestamp: new Date().toISOString(),
          payfastData: pfDataObject, // optional: could also just save bodyText
        });
      }

      return new NextResponse(null, { status: 200 });
    } else {
      console.warn("PayFast ITN: Invalid signature or IP.");
      return new NextResponse("Invalid request", { status: 400 });
    }
  } catch (error) {
    console.error("PayFast ITN Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
