import crypto from "crypto";

function generateSignature(data, passphrase = "") {
  const keys = Object.keys(data).filter(k => k !== "signature").sort();

  let signatureString = keys
    .map(key => `${key}=${encodeURIComponent(data[key]).replace(/%20/g, "+")}`)
    .join("&");

  if (passphrase) {
    signatureString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, "+")}`;
  }

  return crypto.createHash("md5").update(signatureString).digest("hex");
}

const payload = {
  m_payment_id: "TEST123",
  pf_payment_id: "PF456",
  payment_status: "COMPLETE",
  amount_gross: "100.00",
  email_address: "test@example.com",
};

const signature = generateSignature(payload, process.env.PAYFAST_PASSPHRASE || "");
console.log("Signature:", signature);

