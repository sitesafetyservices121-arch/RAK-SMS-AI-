import { NextResponse } from "next/server";
import crypto from "crypto";
import { PayFastSignatureData } from "@/types/payfast";

// Helper: regenerate signature from fields
function generateSignature(data: Record<string, string>, passphrase: string): string {
  // 1. Sort keys alphabetically
  const keys = Object.keys(data).sort();

  // 2. Build query string
  const queryString = keys
    .filter((key) => key !== "signature") // exclude received signature
    .map((key) => `${key}=${encodeURIComponent(data[key] ?? "").replace(/%20/g, "+")}`)
    .join("&");

  // 3. Append passphrase if configured
  const stringToHash = passphrase ? `${queryString}&passphrase=${passphrase}` : queryString;

  // 4. MD5 hash
  return crypto.createHash("md5").update(stringToHash).digest("hex");
}

export async function POST(req: Request) {
  try {
    // Parse PayFast POST body (form-encoded)
    const formData = await req.formData();
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    // Extract received signature
    const receivedSignature = data["signature"];
    if (!receivedSignature) {
      return NextResponse.json({ success: false, error: "Missing signature" }, { status: 400 });
    }

    // Generate signature on our side
    const passphrase = process.env.PAYFAST_PASSPHRASE ?? "";
    const generatedSignature = generateSignature(data, passphrase);

    // Verify signature
    if (receivedSignature !== generatedSignature) {
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 });
    }

    // ✅ Signature valid → process transaction here
    // Example: mark invoice as paid, credit user’s balance, log to DB, etc.
    // Add your persistence logic here (e.g., update database, send notifications)


    // Always return 200 OK so PayFast knows you got it
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PayFast ITN handler error:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
