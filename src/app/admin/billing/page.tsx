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

// Mock data for client subscriptions
const clientData = [
  {
    clientId: "CLIENT-001",
    companyName: "ConstructCo",
    userCount: 5,
    status: "Active",
    lastPayment: "2024-07-15",
  },
  {
    clientId: "CLIENT-002",
    companyName: "BuildIt Right",
    userCount: 1,
    status: "Overdue",
    lastPayment: "2024-06-10",
  },
  {
    clientId: "CLIENT-003",
    companyName: "InfraWorks",
    userCount: 12,
    status: "Active",
    lastPayment: "2024-07-20",
  },
];

// Calculate subscription based on user count
const calculateSubscription = (userCount: number) => {
  if (userCount === 1) {
    return { plan: "Solo", amount: 1500 };
  } else if (userCount > 1 && userCount <= 5) {
    return { plan: "Team", amount: 6000 };
  } else {
    return { plan: "Enterprise", amount: 10000 };
  }
};

export default function AdminBillingPage() {
  const { toast } = useToast();

  const handleSendReminder = (companyName: string) => {
    toast({
      title: "Reminder Sent",
      description: `A payment reminder has been sent to ${companyName}.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Billing & Subscriptions</CardTitle>
        <CardDescription>
          Manage client subscriptions and view billing status.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client ID</TableHead>
              <TableHead>Company Name</TableHead>
              <TableHead>Subscription Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Monthly Amount</TableHead>
              <TableHead>Last Payment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientData.map((client) => {
              const { plan, amount } = calculateSubscription(client.userCount);
              return (
                <TableRow key={client.clientId}>
                  <TableCell className="font-medium">
                    {client.clientId}
                  </TableCell>
                  <TableCell>{client.companyName}</TableCell>
                  <TableCell>{plan}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        client.status === "Overdue" ? "destructive" : "default"
                      }
                    >
                      {client.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    R
                    {client.status === "Overdue"
                      ? amount.toFixed(2)
                      : "0.00"}
                  </TableCell>
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
                        <DropdownMenuItem
                          onClick={() =>
                            handleSendReminder(client.companyName)
                          }
                          disabled={client.status !== "Overdue"}
                        >
                          <Send className="mr-2 h-4 w-4" /> Send Reminder
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" /> View Invoice
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
