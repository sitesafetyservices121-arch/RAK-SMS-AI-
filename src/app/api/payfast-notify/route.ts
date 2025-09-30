
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import crypto from 'crypto';
import querystring from 'querystring';
import { db } from '@/lib/firebase-admin';

// Helper function to generate signature from PayFast data
const generateSignature = (data: { [key: string]: any }, passphrase?: string): string => {
    // Create parameter string
    let pfOutput = '';
    for (const key in data) {
        if (data.hasOwnProperty(key) && key !== 'signature') {
            pfOutput += `${key}=${encodeURIComponent(data[key] || '').replace(/%20/g, '+')}&`;
        }
    }

    // Remove last ampersand
    let getString = pfOutput.slice(0, -1);
    if (passphrase) {
        getString +=`&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;
    }

    return crypto.createHash('md5').update(getString).digest('hex');
};


export async function POST(request: NextRequest) {
    try {
        const bodyText = await request.text();
        const pfData = querystring.parse(bodyText);

        const pfValidSignature = generateSignature(pfData, process.env.PAYFAST_PASSPHRASE);
        
        const isSignatureValid = pfData.signature === pfValidSignature;
        
        // Basic security check: Did the request come from a known PayFast IP range?
        // In production, you should maintain a list of valid PayFast server IPs.
        // This is a simplified check.
        // const requestIp = request.ip || request.headers.get('x-forwarded-for');
        // const isIpValid = requestIp && requestIp.startsWith('41.74.179.'); // Example, update with real ranges
        
        // For now, we'll rely mainly on the signature
        const isIpValid = true; // Placeholder for production IP checks

        if (isSignatureValid && isIpValid) {
            
            // Payment was successful
            if (pfData.payment_status === "COMPLETE") {
                const amount = parseFloat(pfData.amount_gross as string);
                const paymentId = pfData.m_payment_id as string;
                const userEmail = pfData.email_address as string; // Or link to a user ID

                 // TODO: In a real app, you would:
                 // 1. Check that the paymentId has not already been processed to prevent duplicates.
                 // 2. Verify that the amount paid matches the expected amount for the transaction.
                 // 3. Find the user by email/ID and update their account balance in Firestore.

                 // For demonstration, let's log it to Firestore
                 await db.collection('payments').doc(paymentId).set({
                     paymentId,
                     userEmail,
                     amount,
                     status: 'COMPLETE',
                     timestamp: new Date().toISOString(),
                     payfastData: pfData
                 });
            }

            return new NextResponse(null, { status: 200 });

        } else {
            // Invalid signature or IP
            console.warn("PayFast ITN: Invalid signature or IP.");
            return new NextResponse('Invalid request', { status: 400 });
        }

    } catch (error) {
        console.error("PayFast ITN Error:", error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
