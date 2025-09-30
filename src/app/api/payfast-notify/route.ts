
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Helper function to generate signature from PayFast data
const generateSignature = (data: URLSearchParams, passphrase?: string): string => {
    const tempParams = new URLSearchParams();
    // Re-create the URLSearchParams to ensure consistent order if needed, though for PayFast it's usually alphabetical.
    // PayFast actually requires the original order, but URLSearchParams sorts alphabetically.
    // So we need a different approach if order matters. Payfast docs say "The data is concatenated into a string..." which usually implies a specific order.
    // However, their examples often show alphabetical order. A more robust way is to rebuild the string from the original body.
    // Let's stick with a more direct string manipulation to avoid reordering issues.
    
    // The problem might be the parsing itself. Let's rebuild the signature string carefully.
    const dataObj: { [key: string]: any } = {};
    for (const [key, value] of data.entries()) {
        dataObj[key] = value;
    }

    let pfOutput = '';
    for (const key in dataObj) {
        if (dataObj.hasOwnProperty(key) && key !== 'signature') {
            pfOutput += `${key}=${encodeURIComponent(dataObj[key] || '').replace(/%20/g, '+')}&`;
        }
    }
    
    // Remove last ampersand
    let getString = pfOutput.slice(0, -1);
    if (passphrase) {
        getString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;
    }

    return crypto.createHash('md5').update(getString).digest('hex');
};


export async function POST(request: NextRequest) {
    try {
        const bodyText = await request.text();
        console.log("PayFast ITN bodyText:", bodyText);
        if (!bodyText) {
            return new NextResponse('Empty request body', { status: 400 });
        }
        
        // Using URLSearchParams is a more modern and reliable way to handle x-www-form-urlencoded data.
        const pfData = new URLSearchParams(bodyText);
        const pfDataObject: { [key: string]: any } = {};
        for(const [key, value] of pfData.entries()){
            pfDataObject[key] = value;
        }

        const pfValidSignature = generateSignature(pfData, process.env.PAYFAST_PASSPHRASE);
        
        const isSignatureValid = pfDataObject.signature === pfValidSignature;
        
        const isIpValid = true; // Placeholder for production IP checks

        if (isSignatureValid && isIpValid) {
            
            // Payment was successful
            if (pfDataObject.payment_status === "COMPLETE") {
                const amount = parseFloat(pfDataObject.amount_gross as string);
                const paymentId = pfDataObject.m_payment_id as string;
                const userEmail = pfDataObject.email_address as string; 

                 await db.collection('payments').doc(paymentId).set({
                     paymentId,
                     userEmail,
                     amount,
                     status: 'COMPLETE',
                     timestamp: new Date().toISOString(),
                     payfastData: pfDataObject
                 });
            }

            return new NextResponse(null, { status: 200 });

        } else {
            console.warn("PayFast ITN: Invalid signature or IP.");
            return new NextResponse('Invalid request', { status: 400 });
        }

    } catch (error) {
        console.error("PayFast ITN Error:", error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

