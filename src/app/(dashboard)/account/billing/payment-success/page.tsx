"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader className="items-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
          <CardTitle className="mt-4">Payment Successful!</CardTitle>
          <CardDescription>
            Thank you for your payment. Your account balance will be updated
            shortly once the transaction is confirmed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/account/billing">Return to Billing</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
