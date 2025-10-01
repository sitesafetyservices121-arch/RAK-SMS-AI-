"use server";

import crypto from "crypto";

type PayFastPaymentData = {
  amount: string;
  item_name: string;
  [key: string]: string;
};

type PayFastFormData = {
  [key: string]: string;
};

type PayFastSignatureData = {
  merchant_id: string;
  merchant_key: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  signature: string;
};

export async function generatePayFastSignatureAction(
  paymentData: PayFastPaymentData
): Promise<{ success: boolean; data?: PayFastSignatureData; error?: string }> {
  try {
    const merchantId = process.env.PAYFAST_MERCHANT_ID;
    const merchantKey = process.env.PAYFAST_MERCHANT_KEY;
    const passphrase = process.env.PAYFAST_PASSPHRASE;
    const appBaseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "https://raksms.services";

    if (!merchantId || !merchantKey || !passphrase) {
      throw new Error(
        "PayFast credentials are not configured in the environment variables."
      );
    }

    const data: PayFastFormData = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: `${appBaseUrl}/account/billing/payment-success`,
      cancel_url: `${appBaseUrl}/account/billing/payment-cancelled`,
      notify_url: `${appBaseUrl}/api/payfast-notify`, // Needs to be created
      ...paymentData,
    };

    const queryString = Object.keys(data)
      .filter((key) => data[key] !== "")
      .map(
        (key) =>
          `${key}=${encodeURIComponent(
            (data[key] ?? "").trim()
          ).replace(/%20/g, "+")}`
      )
      .join("&");

    const signatureString = `${queryString}&passphrase=${encodeURIComponent(
      passphrase.trim()
    ).replace(/%20/g, "+")}`;

    const signature = crypto
      .createHash("md5")
      .update(signatureString)
      .digest("hex");

    return {
      success: true,
      data: {
        merchant_id: merchantId,
        merchant_key: merchantKey,
        return_url: data.return_url,
        cancel_url: data.cancel_url,
        notify_url: data.notify_url,
        signature,
      },
    };
  } catch (e: unknown) {
    console.error("PayFast Signature Error:", e);
    const error = e instanceof Error ? e.message : "An unknown error occurred.";
    return {
      success: false,
      error,
    };
  }
}
