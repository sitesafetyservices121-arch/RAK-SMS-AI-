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
    companyName: "MedixHealth",
    userCount: 12,
    status: "Suspended",
    lastPayment: "2024-06-10",
  },
  {
    clientId: "CLIENT-003",
    companyName: "AgroFarm",
    userCount: 8,
    status: "Active",
    lastPayment: "2024-07-20",
  },
];

export default function BillingPage() {
  const { toast } = useToast();

  const handleAction = (action: string, clientId: string) => {
    toast({
      title: `Action: ${action}`,
      description: `Performed on client ${clientId}`,
    });
  };

  // Map statuses to valid Badge variants
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "default"; // ✅ maps "Active" to a valid variant
      case "Suspended":
        return "destructive"; // ✅ red badge
      default:
        return "secondary"; // fallback
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Client Billing</CardTitle>
          <CardDescription>
            Manage subscriptions and billing status for clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client ID</TableHead>
                <TableHead>Company Name</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientData.map((client) => (
                <TableRow key={client.clientId}>
                  <TableCell>{client.clientId}</TableCell>
                  <TableCell>{client.companyName}</TableCell>
                  <TableCell>{client.userCount}</TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(client.status)}>
                      {client.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{client.lastPayment}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() =>
                            handleAction("View Invoice", client.clientId)
                          }
                        >
                          <FileText className="mr-2 h-4 w-4" /> View Invoice
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleAction("Send Reminder", client.clientId)
                          }
                        >
                          <Send className="mr-2 h-4 w-4" /> Send Reminder
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
    </div>
  );
}
