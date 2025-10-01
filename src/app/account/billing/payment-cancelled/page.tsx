"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { XCircle } from "lucide-react";
import Link from "next/link";

export default function PaymentCancelledPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader className="items-center">
          <XCircle className="h-16 w-16 text-destructive" />
          <CardTitle className="mt-4">Payment Cancelled</CardTitle>
          <CardDescription>
            Your transaction was not completed. Your account has not been
            charged. You can try topping up again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/account/billing/top-up">Try Again</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
