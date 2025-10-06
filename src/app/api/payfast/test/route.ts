import { NextResponse } from "next/server";
import crypto from "crypto";

const generateSignature = (
  data: Record<string, string>,
  passphrase?: string
): string => {
  const keys = Object.keys(data).filter((k) => k !== "signature").sort();

  let signatureString = keys
    .map((key) => `${key}=${encodeURIComponent(data[key]).replace(/%20/g, "+")}`)
    .join("&");

  if (passphrase) {
    signatureString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, "+")}`;
  }

  return crypto.createHash("md5").update(signatureString).digest("hex");
};

export async function GET() {
  try {
    const sampleData: Record<string, string> = {
      m_payment_id: "TEST123",
      pf_payment_id: "PFTEST456",
      payment_status: "COMPLETE",
      amount_gross: "199.99",
      email_address: "testuser@example.com",
    };

    // Sign with your passphrase (from env)
    const signature = generateSignature(sampleData, process.env.PAYFAST_PASSPHRASE);
    sampleData.signature = signature;

    return NextResponse.json({
      success: true,
      message: "Simulated ITN payload ready",
      simulatedPayload: sampleData,
      curlCommand: `curl -X POST http://localhost:3000/api/payfast/itn \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d '${Object.entries(sampleData)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join("&")}'`,
    });
  } catch (error) {
    console.error("⚠️ Failed to generate test payload:", error);
    return NextResponse.json({ success: false, error: "Test route failed" }, { status: 500 });
  }
}
