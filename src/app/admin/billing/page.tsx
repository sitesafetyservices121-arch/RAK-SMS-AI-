
"use client";

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
import { MoreHorizontal, FileText, Send } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

// Mock data for client billing
const billingData = [
  {
    clientId: "CLIENT-001",
    companyName: "ConstructCo",
    plan: "Pro Tier",
    status: "Paid",
    amountDue: "R0.00",
    lastPayment: "2024-07-01",
  },
  {
    clientId: "CLIENT-002",
    companyName: "BuildIt Right",
    plan: "Pro Tier",
    status: "Paid",
    amountDue: "R0.00",
    lastPayment: "2024-07-01",
  },
  {
    clientId: "CLIENT-003",
    companyName: "InfraWorks",
    plan: "Starter Tier",
    status: "Overdue",
    amountDue: "R1500.00",
    lastPayment: "2024-05-30",
  },
];

export default function AdminBillingPage() {
    const { toast } = useToast();

    const handleSendReminder = (clientName: string) => {
        toast({
            title: "Reminder Sent",
            description: `A payment reminder has been sent to ${clientName}.`,
        });
    }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>Client Billing Management</CardTitle>
                <CardDescription>
                Track and manage client subscriptions and payments via PayFast.
                </CardDescription>
            </div>
             <div className="flex items-center gap-2">
                 <img src="https://www.payfast.io/assets/images/payfast_logo_2-1.png" alt="PayFast Logo" className="h-8" />
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client ID</TableHead>
              <TableHead>Company Name</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount Due</TableHead>
              <TableHead>Last Payment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {billingData.map((client) => (
              <TableRow key={client.clientId}>
                <TableCell className="font-medium">{client.clientId}</TableCell>
                <TableCell>{client.companyName}</TableCell>
                <TableCell>{client.plan}</TableCell>
                <TableCell>
                  <Badge variant={client.status === "Overdue" ? "destructive" : "default"}>
                    {client.status}
                  </Badge>
                </TableCell>
                <TableCell>{client.amountDue}</TableCell>
                <TableCell>{client.lastPayment}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleSendReminder(client.companyName)}>
                         <Send className="mr-2 h-4 w-4" /> Send Reminder
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <FileText className="mr-2 h-4 w-4" /> View Invoice
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
