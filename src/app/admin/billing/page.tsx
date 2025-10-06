"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { MoreHorizontal, FileText, Send, RefreshCw, ShieldCheck, Ban } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import type { BillingAccount, BillingStatus } from "@/types/billing";

async function fetchBillingAccounts(): Promise<BillingAccount[]> {
  const res = await fetch("/api/billing/accounts");
  if (!res.ok) throw new Error("Failed to load billing accounts");
  const payload = await res.json();
  return payload.data ?? [];
}

async function patchBillingAccount(
  id: string,
  data: Partial<BillingAccount>
): Promise<BillingAccount> {
  const res = await fetch(`/api/billing/accounts/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update billing account");
  const payload = await res.json();
  return payload.data as BillingAccount;
}

export default function BillingPage() {
  const { toast } = useToast();

  const [accounts, setAccounts] = useState<BillingAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchBillingAccounts();
        setAccounts(data);
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Unable to load accounts",
          description: "Please check your billing configuration.",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  const handleStatusChange = async (id: string, status: BillingStatus) => {
    try {
      const updated = await patchBillingAccount(id, { status });
      setAccounts((prev) => prev.map((acc) => (acc.id === id ? updated : acc)));
      toast({ title: "Status updated", description: `${updated.companyName} is now ${status}.` });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Failed to update status",
        description: "We could not update the account status.",
      });
    }
  };

  const handleAction = (action: string, account: BillingAccount) => {
    toast({
      title: `Action: ${action}`,
      description: `Performed for ${account.companyName}`,
    });
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const data = await fetchBillingAccounts();
      setAccounts(data);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Unable to refresh",
        description: "Could not reload billing data.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Map statuses to valid Badge variants
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "default"; // ✅ maps "Active" to a valid variant
      case "Suspended":
        return "destructive"; // ✅ red badge
      case "Trial":
        return "secondary";
      case "Past Due":
        return "destructive";
      default:
        return "outline"; // fallback
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Client Billing</CardTitle>
            <CardDescription>
              Manage subscriptions and billing status for clients
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Company Name</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Last Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Loading billing accounts…
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell>{account.id}</TableCell>
                    <TableCell>{account.companyName}</TableCell>
                    <TableCell>{account.userCount}</TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(account.status)}>
                        {account.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{account.subscriptionPlan}</TableCell>
                    <TableCell>
                      {account.currency ?? "ZAR"} {account.balanceDue.toFixed(2)}
                    </TableCell>
                    <TableCell>{account.lastPaymentDate ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleAction("View Invoice", account)}
                          >
                            <FileText className="mr-2 h-4 w-4" /> View Invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleAction("Send Reminder", account)}
                          >
                            <Send className="mr-2 h-4 w-4" /> Send Reminder
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(account.id, "Active")}
                          >
                            <ShieldCheck className="mr-2 h-4 w-4" /> Mark Active
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(account.id, "Suspended")}
                          >
                            <Ban className="mr-2 h-4 w-4" /> Suspend Account
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              {!loading && accounts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No billing accounts found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
