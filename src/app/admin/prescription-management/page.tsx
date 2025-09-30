
"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { MoreHorizontal, PauseCircle, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

// Mock data for prescriptions
const initialPrescriptions = [
  {
    id: "PRE-001",
    clientId: "CLIENT-002",
    issue: "Incorrect use of scaffolding",
    prescription: "Mandatory scaffolding safety re-training for all site staff.",
    status: "Issued",
    date: "2024-07-15",
  },
  {
    id: "PRE-002",
    clientId: "CLIENT-003",
    issue: "Lack of proper PPE for welding",
    prescription: "Procure and distribute FR-rated welding jackets and gloves.",
    status: "Completed",
    date: "2024-06-28",
  },
];

export default function PrescriptionManagementPage() {
  const [prescriptions, setPrescriptions] = useState(initialPrescriptions);
  const { toast } = useToast();

  const handleDelete = (id: string) => {
    setPrescriptions(prescriptions.filter((p) => p.id !== id));
    toast({
      title: "Prescription Deleted",
      description: `Prescription ${id} has been removed.`,
    });
  };

  const handlePause = (id: string) => {
    setPrescriptions(
      prescriptions.map((p) =>
        p.id === id
          ? {
              ...p,
              status: p.status === "Paused" ? "Issued" : "Paused",
            }
          : p
      )
    );
    const newStatus = prescriptions.find(p => p.id === id)?.status === 'Paused' ? 'Resumed' : 'Paused';
    toast({
      title: `Prescription ${newStatus}`,
      description: `Prescription ${id} has been ${newStatus.toLowerCase()}.`,
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Completed":
        return "default";
      case "Issued":
        return "secondary";
      case "Paused":
        return "outline";
      default:
        return "outline";
    }
  };


  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Issue New Prescription</CardTitle>
          <CardDescription>
            Create a corrective action or safety prescription for a client.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="clientId">Client ID</Label>
              <Input id="clientId" placeholder="Enter client ID" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="issue">Identified Issue</Label>
              <Textarea id="issue" placeholder="Describe the safety issue or non-conformance" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="prescription">Prescription / Corrective Action</Label>
              <Textarea id="prescription" placeholder="Describe the required corrective action" />
            </div>
            <Button type="submit" className="w-full">
              Issue Prescription
            </Button>
          </form>
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
          <CardTitle>Outstanding Prescriptions</CardTitle>
          <CardDescription>
            List of all issued corrective actions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Client ID</TableHead>
                <TableHead>Issue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prescriptions.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.id}</TableCell>
                  <TableCell>{p.clientId}</TableCell>
                  <TableCell>{p.issue}</TableCell>
                  <TableCell>
                     <Badge variant={getStatusVariant(p.status) as any}>{p.status}</Badge>
                  </TableCell>
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
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handlePause(p.id)}>
                          <PauseCircle className="mr-2 h-4 w-4" />
                          {p.status === "Paused" ? "Resume" : "Pause"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(p.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
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
