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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { BillingAccount } from "@/types/billing";

async function fetchClients(): Promise<BillingAccount[]> {
  const res = await fetch("/api/billing/accounts");
  if (!res.ok) throw new Error("Failed to load clients");
  const payload = await res.json();
  return payload.data ?? [];
}

async function createClient(payload: {
  companyName: string;
  primaryContact: string;
  userCount: number;
}): Promise<BillingAccount> {
  const res = await fetch("/api/billing/accounts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      companyName: payload.companyName,
      primaryContact: payload.primaryContact,
      userCount: payload.userCount,
      status: "Pending",
      subscriptionPlan: "Starter",
      balanceDue: 0,
    }),
  });
  if (!res.ok) throw new Error("Failed to create client");
  const data = await res.json();
  return data.data as BillingAccount;
}

export default function OnboardingPage() {
  const [clients, setClients] = useState<BillingAccount[]>([]);
  const [newClient, setNewClient] = useState({
    name: "",
    contact: "",
    userCount: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchClients();
        setClients(data);
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Unable to load clients",
          description: "Could not fetch onboarding data.",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  const handleAddClient = async () => {
    if (!newClient.name || !newClient.contact) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please provide a name and contact email.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const created = await createClient({
        companyName: newClient.name,
        primaryContact: newClient.contact,
        userCount: newClient.userCount,
      });
      setClients((prev) => [created, ...prev]);
      setNewClient({ name: "", contact: "", userCount: 0 });
      toast({
        title: "Client added",
        description: `${created.companyName} is ready for onboarding.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Failed to add client",
        description: "We could not create the onboarding record.",
      });
    } finally {
      setIsSubmitting(false);
    }
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userCount">User Count</Label>
              <Input
                id="userCount"
                type="number"
                min={0}
                value={newClient.userCount}
                onChange={(e) =>
                  setNewClient({
                    ...newClient,
                    userCount: Number.parseInt(e.target.value, 10) || 0,
                  })
                }
                disabled={isSubmitting}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleAddClient}
                className="w-full flex items-center gap-2"
                disabled={isSubmitting}
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
              {loading && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Loading clients…
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>{client.id}</TableCell>
                    <TableCell>{client.companyName}</TableCell>
                    <TableCell>{client.primaryContact}</TableCell>
                    <TableCell>{client.status}</TableCell>
                    <TableCell>{client.userCount}</TableCell>
                  </TableRow>
                ))}
              {!loading && clients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No clients onboarded yet.
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
