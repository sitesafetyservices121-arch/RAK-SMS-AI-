'use server';

// src/lib/payfast.ts

import crypto from "crypto";

/**
 * Generates a PayFast signature from a data object.
 * @param data The payment data object.
 * @param passphrase The PayFast passphrase.
 * @returns The MD5 signature string.
 */
export async function generateSignature(
  data: Record<string, string>,
  passphrase?: string
): Promise<string> {
  // Filter out the signature key itself
  const keys = Object.keys(data)
    .filter((k) => k !== "signature")
    .sort();

  // Create the URL-encoded string
  let signatureString = keys
    .map((key) => `${key}=${encodeURIComponent(data[key]).replace(/%20/g, "+")}`)
    .join("&");

  // Append passphrase if it exists
  if (passphrase) {
    signatureString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(
      /%20/g,
      "+"
    )}`;
  }

  // Create MD5 hash
  return crypto.createHash("md5").update(signatureString).digest("hex");
}
