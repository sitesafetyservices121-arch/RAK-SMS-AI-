"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Download } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function AccountBillingPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <CreditCard className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            Manage your subscription and billing information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <h3 className="font-semibold">Professional Plan</h3>
              <p className="text-sm text-muted-foreground">
                Full access to all features
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">Active</p>
              <p className="text-sm text-muted-foreground">Managed by admin</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Plan Features</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>✓ Unlimited document uploads</li>
              <li>✓ AI-powered document generation</li>
              <li>✓ Advanced analytics and reporting</li>
              <li>✓ Priority support</li>
              <li>✓ Custom integrations</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            View and download your invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            No billing history available. Contact your administrator for billing information.
          </p>
          <Button variant="outline" disabled>
            <Download className="mr-2 h-4 w-4" />
            Download Invoices
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
