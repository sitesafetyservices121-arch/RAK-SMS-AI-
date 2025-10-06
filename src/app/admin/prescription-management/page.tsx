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
import { MoreHorizontal, PauseCircle, Trash2, CheckCircle } from "lucide-react";
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

type Prescription = {
  id: string;
  patient: string;
  medication: string;
  dosage: string;
  notes: string;
  status: "Pending" | "Active" | "Paused";
};

// Initial sample prescriptions
const initialPrescriptions: Prescription[] = [
  {
    id: "RX-001",
    patient: "John Doe",
    medication: "Amoxicillin",
    dosage: "500mg twice daily",
    notes: "For 7 days",
    status: "Active",
  },
  {
    id: "RX-002",
    patient: "Jane Smith",
    medication: "Ibuprofen",
    dosage: "200mg as needed",
    notes: "Take after meals",
    status: "Pending",
  },
];

export default function PrescriptionManagementPage() {
  const { toast } = useToast();
  const [prescriptions, setPrescriptions] =
    useState<Prescription[]>(initialPrescriptions);

  const [newPrescription, setNewPrescription] = useState({
    patient: "",
    medication: "",
    dosage: "",
    notes: "",
  });

  const handleAddPrescription = () => {
    if (
      !newPrescription.patient ||
      !newPrescription.medication ||
      !newPrescription.dosage
    ) {
      toast({
        title: "Validation Error",
        description: "Patient, medication, and dosage are required.",
        variant: "destructive",
      });
      return;
    }

    const newEntry: Prescription = {
      id: `RX-${String(prescriptions.length + 1).padStart(3, "0")}`,
      ...newPrescription,
      status: "Pending",
    };

    setPrescriptions([...prescriptions, newEntry]);
    setNewPrescription({ patient: "", medication: "", dosage: "", notes: "" });

    toast({
      title: "Prescription Added",
      description: `Prescription for ${newEntry.patient} created successfully.`,
    });
  };

  const updateStatus = (id: string, status: Prescription["status"]) => {
    setPrescriptions((prev) =>
      prev.map((rx) => (rx.id === id ? { ...rx, status } : rx))
    );

    toast({
      title: "Status Updated",
      description: `Prescription ${id} marked as ${status}.`,
    });
  };

  const deletePrescription = (id: string) => {
    setPrescriptions((prev) => prev.filter((rx) => rx.id !== id));
    toast({
      title: "Deleted",
      description: `Prescription ${id} has been deleted.`,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Prescription Management</CardTitle>
          <CardDescription>
            Manage patient prescriptions and their statuses.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New Prescription Form */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="patient">Patient</Label>
              <Input
                id="patient"
                placeholder="Enter patient name"
                value={newPrescription.patient}
                onChange={(e) =>
                  setNewPrescription({
                    ...newPrescription,
                    patient: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medication">Medication</Label>
              <Input
                id="medication"
                placeholder="Enter medication"
                value={newPrescription.medication}
                onChange={(e) =>
                  setNewPrescription({
                    ...newPrescription,
                    medication: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dosage">Dosage</Label>
              <Input
                id="dosage"
                placeholder="Enter dosage"
                value={newPrescription.dosage}
                onChange={(e) =>
                  setNewPrescription({
                    ...newPrescription,
                    dosage: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes..."
                value={newPrescription.notes}
                onChange={(e) =>
                  setNewPrescription({
                    ...newPrescription,
                    notes: e.target.value,
                  })
                }
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button onClick={handleAddPrescription}>Add Prescription</Button>
            </div>
          </div>

          {/* Prescriptions Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Medication</TableHead>
                <TableHead>Dosage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prescriptions.map((rx) => (
                <TableRow key={rx.id}>
                  <TableCell>{rx.id}</TableCell>
                  <TableCell>{rx.patient}</TableCell>
                  <TableCell>{rx.medication}</TableCell>
                  <TableCell>{rx.dosage}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        rx.status === "Active"
                          ? "default"
                          : rx.status === "Paused"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {rx.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => updateStatus(rx.id, "Active")}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" /> Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateStatus(rx.id, "Paused")}
                        >
                          <PauseCircle className="mr-2 h-4 w-4" /> Pause
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deletePrescription(rx.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
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
