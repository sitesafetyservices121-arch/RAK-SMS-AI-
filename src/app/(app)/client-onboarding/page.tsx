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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const clients = [
  {
    companyName: "ABC Construction",
    clientId: "CLIENT-001",
    status: "Active",
    onboardedOn: "2024-06-15",
  },
  {
    companyName: "XYZ Logistics",
    clientId: "CLIENT-002",
    status: "Active",
    onboardedOn: "2024-05-20",
  },
  {
    companyName: "Pro Engineering",
    clientId: "CLIENT-003",
    status: "Inactive",
    onboardedOn: "2023-11-10",
  },
];

export default function ClientOnboardingPage() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Client Onboarding</CardTitle>
            <CardDescription>
            Onboard new clients and manage their access.
            </CardDescription>
        </div>
        <Button>Onboard New Client</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company Name</TableHead>
              <TableHead>Client ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Onboarded On</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.clientId}>
                <TableCell className="font-medium">{client.companyName}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{client.clientId}</Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={client.status === "Active" ? "default" : "destructive"}
                  >
                    {client.status}
                  </Badge>
                </TableCell>
                <TableCell>{client.onboardedOn}</TableCell>
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
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit Client</DropdownMenuItem>
                      <DropdownMenuItem>Deactivate Client</DropdownMenuItem>
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
