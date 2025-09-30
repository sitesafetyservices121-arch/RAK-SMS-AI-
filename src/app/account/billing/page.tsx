
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, PlusCircle } from "lucide-react";
import Link from "next/link";

// In a real app, this balance would be fetched from your database
const currentBalance = "R250.00";

export default function UserBillingPage() {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Billing & Subscriptions</CardTitle>
        <CardDescription>
          View your account balance and top-up your subscription.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between p-6 bg-secondary rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Current Balance</p>
            <p className="text-4xl font-bold">{currentBalance}</p>
          </div>
          <DollarSign className="h-12 w-12 text-muted-foreground" />
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href="/account/billing/top-up">
            <PlusCircle className="mr-2 h-4 w-4" />
            Top-up Account
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
