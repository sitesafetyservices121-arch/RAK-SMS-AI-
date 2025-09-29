
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
import { Textarea } from "@/components/ui/textarea";

// Mock data for prescriptions
const prescriptions = [
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
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prescriptions.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.id}</TableCell>
                  <TableCell>{p.clientId}</TableCell>
                  <TableCell>{p.issue}</TableCell>
                  <TableCell>{p.status}</TableCell>
                  <TableCell>{p.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
