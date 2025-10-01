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
import { useState } from "react";

type Client = {
  id: string;
  name: string;
  contact: string;
  status: string;
  userCount: number;
};

// Initial mock data
const initialClients: Client[] = [
  {
    id: "CLIENT-001",
    name: "ConstructCo",
    contact: "info@constructco.com",
    status: "Active",
    userCount: 5,
  },
  {
    id: "CLIENT-002",
    name: "BuildIt Right",
    contact: "contact@builditright.com",
    status: "Pending",
    userCount: 3,
  },
];

export default function OnboardingPage() {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [newClient, setNewClient] = useState({
    name: "",
    contact: "",
    status: "Pending",
    userCount: 0,
  });

  const handleAddClient = () => {
    if (!newClient.name || !newClient.contact) return;

    const newEntry: Client = {
      id: `CLIENT-${String(clients.length + 1).padStart(3, "0")}`,
      ...newClient,
    };

    setClients([...clients, newEntry]);
    setNewClient({ name: "", contact: "", status: "Pending", userCount: 0 });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Client Onboarding</CardTitle>
          <CardDescription>
            Manage onboarding process for new clients.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New Client Form */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="name">Client Name</Label>
              <Input
                id="name"
                placeholder="Enter client name"
                value={newClient.name}
                onChange={(e) =>
                  setNewClient({ ...newClient, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact">Contact Email</Label>
              <Input
                id="contact"
                type="email"
                placeholder="client@example.com"
                value={newClient.contact}
                onChange={(e) =>
                  setNewClient({ ...newClient, contact: e.target.value })
                }
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleAddClient}
                className="w-full flex items-center gap-2"
              >
                <PlusCircle className="h-4 w-4" /> Add Client
              </Button>
            </div>
          </div>

          {/* Clients Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>User Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>{client.id}</TableCell>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>{client.contact}</TableCell>
                  <TableCell>{client.status}</TableCell>
                  <TableCell>{client.userCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
