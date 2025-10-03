import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import crypto from 'crypto';
import {db} from '@/lib/firebase-admin';

export const dynamic = "force-static"; // Ensures this API route is compatible with static export

// Helper function to generate a PayFast signature from the request body.
const generateSignature = (
  requestBody: string,
  passphrase?: string
): string => {
  // Create a string by concatenating key-value pairs
  let signatureString = requestBody;

  // Remove the existing signature from the string, if it exists
  signatureString = signatureString.replace(/&?signature=[^&]*/i, '');

  // Append the passphrase if it's provided
  if (passphrase) {
    signatureString += `&passphrase=${encodeURIComponent(
      passphrase.trim()
    ).replace(/%20/g, '+')}`;
  }

  // Hash the string using MD5 and return the hex digest
  return crypto.createHash('md5').update(signatureString).digest('hex');
};

export async function POST(request: NextRequest) {
  try {
    const bodyText = await request.text();
    if (!bodyText) {
      return new NextResponse('Empty request body', {status: 400});
    }

    // Parse the request body into a key-value object
    const pfData = new URLSearchParams(bodyText);
    const pfDataObject: Record<string, string> = {};
    for (const [key, value] of pfData.entries()) {
      pfDataObject[key] = value;
    }

    // Generate a signature for validation
    const pfValidSignature = generateSignature(
      bodyText,
      process.env.PAYFAST_PASSPHRASE
    );

    const isSignatureValid = pfDataObject.signature === pfValidSignature;
    const isIpValid = true; // Placeholder for IP validation

    if (isSignatureValid && isIpValid) {
      if (pfDataObject.payment_status === 'COMPLETE') {
        const amount = parseFloat(pfDataObject.amount_gross || '0');
        const paymentId = pfDataObject.m_payment_id;
        const userEmail = pfDataObject.email_address;

        // Save payment details to Firestore
        await db.collection('payments').doc(paymentId).set({
          paymentId,
          userEmail,
          amount,
          status: 'COMPLETE',
          timestamp: new Date().toISOString(),
          payfastData: pfDataObject,
        });
      }
      // Respond with a 200 OK to acknowledge receipt
      return new NextResponse(null, {status: 200});
    } else {
      // Log and reject invalid requests
      console.warn('PayFast ITN: Invalid signature or IP.', {
        pfDataObject,
        pfValidSignature,
      });
      return new NextResponse('Invalid request', {status: 400});
    }
  } catch (error) {
    console.error('PayFast ITN Error:', error);
    return new NextResponse('Internal Server Error', {status: 500});
  }
}
