
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";

// Mock data for existing clients
const clients = [
  { id: "CLIENT-001", name: "ConstructCo", contact: "info@constructco.com", status: "Active", userCount: 5 },
  { id: "CLIENT-002", name: "BuildIt Right", contact: "contact@buildit.com", status: "Active", userCount: 1 },
  { id: "CLIENT-003", name: "InfraWorks", contact: "projects@infraworks.co.za", status: "Pending", userCount: 12 },
];

export default function OnboardingPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Onboard New Client</CardTitle>
          <CardDescription>
            Add a new client company to the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" placeholder="Enter company name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                placeholder="Enter contact email"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                <Label htmlFor="clientId">Client ID</Label>
                <Input id="clientId" placeholder="e.g., CLIENT-004" />
                </div>
                <div className="grid gap-2">
                <Label htmlFor="userCount">Number of Users</Label>
                <Input id="userCount" type="number" placeholder="e.g., 5" />
                </div>
            </div>
            <Button type="submit" className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Client
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Existing Clients</CardTitle>
          <CardDescription>A list of all client companies.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client ID</TableHead>
                <TableHead>Company Name</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.id}</TableCell>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>{client.userCount}</TableCell>
                  <TableCell>{client.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
