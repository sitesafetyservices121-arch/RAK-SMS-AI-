
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, CreditCard } from "lucide-react";

const subscriptionDetails = {
  plan: "Pro Tier",
  status: "Active",
  nextBillingDate: "2024-08-01",
  amount: "R5000.00",
};

const paymentHistory = [
  {
    invoiceId: "INV-2024-07-001",
    date: "2024-07-01",
    amount: "R5000.00",
    status: "Paid",
  },
  {
    invoiceId: "INV-2024-06-001",
    date: "2024-06-01",
    amount: "R5000.00",
    status: "Paid",
  },
  {
    invoiceId: "INV-2024-05-001",
    date: "2024-05-01",
    amount: "R5000.00",
    status: "Paid",
  },
];

export default function ClientBillingPage() {
  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>My Subscription</CardTitle>
            <CardDescription>
              Your current plan and billing details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-semibold">{subscriptionDetails.plan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge>{subscriptionDetails.status}</Badge>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Next Billing Date</span>
              <span className="font-semibold">{subscriptionDetails.nextBillingDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Next Invoice Amount</span>
              <span className="font-semibold">{subscriptionDetails.amount}</span>
            </div>
             <Separator />
             <div className="flex items-center justify-between pt-2">
                <span className="text-muted-foreground">Payment Provider</span>
                 <img src="https://www.payfast.io/assets/images/payfast_logo_2-1.png" alt="PayFast Logo" className="h-6" />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" disabled>
              <CreditCard className="mr-2 h-4 w-4" />
              PayFast Integration Pending
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>
              A record of your past invoices and payments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentHistory.map((payment) => (
                  <TableRow key={payment.invoiceId}>
                    <TableCell className="font-medium">{payment.invoiceId}</TableCell>
                    <TableCell>{payment.date}</TableCell>
                    <TableCell>{payment.amount}</TableCell>
                    <TableCell>
                      <Badge variant="default">{payment.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" asChild>
                        <a href="#" download>
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Download Invoice</span>
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
