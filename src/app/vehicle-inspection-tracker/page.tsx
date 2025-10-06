
"use client";

import { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, X, Edit, Circle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import type { Inspection, InspectionStatus, DamageReport } from "@/types/inspections";

// API helpers
async function fetchInspections(): Promise<Inspection[]> {
  const res = await fetch("/api/inspections");
  if (!res.ok) throw new Error("Failed to load inspections");
  return res.json();
}

async function addInspection(data: Partial<Inspection>): Promise<Inspection> {
  const res = await fetch("/api/inspections", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to add vehicle");
  return res.json();
}

async function updateInspection(
  id: string,
  data: Partial<Inspection>
): Promise<Inspection> {
  const res = await fetch(`/api/inspections/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update inspection");
  return res.json();
}

// Vehicle Diagram
const VehicleDiagram = ({
  damages,
  onClick,
}: {
  damages: DamageReport[];
  onClick: (e: React.MouseEvent<SVGSVGElement>) => void;
}) => (
  <div className="relative w-full max-w-lg mx-auto">
    <svg
      onClick={onClick}
      className="w-full h-auto cursor-crosshair"
      viewBox="0 0 800 300"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Vehicle Outline */}
      <path
        d="M100 200 L100 160 Q100 140 120 140 L280 140 L330 100 L550 100 L600 140 L700 140 Q720 140 720 160 L720 200 L700 200 Q680 200 680 220 L620 220 Q620 200 600 200 L200 200 Q180 200 180 220 L120 220 Q120 200 100 200 Z"
        stroke="hsl(var(--foreground))"
        strokeWidth="3"
        fill="hsl(var(--muted))"
      />
      {/* Cab */}
      <path
        d="M280 140 L330 100 L550 100 L600 140 L580 140 L550 115 L350 115 L300 140 Z"
        stroke="hsl(var(--foreground))"
        strokeWidth="2"
        fill="hsl(var(--card))"
      />
      {/* Wheels */}
      <circle cx="150" cy="220" r="25" fill="hsl(var(--foreground))" />
      <circle cx="650" cy="220" r="25" fill="hsl(var(--foreground))" />
      <circle cx="150" cy="220" r="12" fill="hsl(var(--muted))" />
      <circle cx="650" cy="220" r="12" fill="hsl(var(--muted))" />
      {/* Damages */}
      {damages.map((damage, index) => (
        <circle
          key={index}
          cx={damage.x}
          cy={damage.y}
          r="8"
          fill="hsl(var(--destructive))"
          stroke="hsl(var(--destructive-foreground))"
          strokeWidth="2"
        >
          <title>{damage.description}</title>
        </circle>
      ))}
    </svg>
  </div>
);

export default function VehicleInspectionPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isInspectOpen, setIsInspectOpen] = useState(false);
  const [isAddDamageOpen, setIsAddDamageOpen] = useState(false);

  const [currentInspection, setCurrentInspection] = useState<Inspection | null>(
    null
  );
  const [newDamagePoint, setNewDamagePoint] = useState<{ x: number; y: number } | null>(
    null
  );

  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchInspections();
        setInspections(data);
      } catch {
        toast({ title: "Error", description: "Could not load inspections." });
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  const getStatusVariant = (status: InspectionStatus) => {
    switch (status) {
      case "Passed":
        return "default";
      case "Failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const handleAddVehicle = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const newInspection: Partial<Inspection> = {
      vehicle: formData.get("vehicleName") as string,
      numberPlate: formData.get("numberPlate") as string,
      driverName: formData.get("driverName") as string,
      driverSurname: formData.get("driverSurname") as string,
      lastService: formData.get("lastService") as string,
      nextService: formData.get("nextService") as string,
      licenseDiscExpiry: formData.get("licenseDiscExpiry") as string,
      status: "Awaiting Inspection",
      inspector: "System",
      date: new Date().toISOString().split("T")[0],
      damages: [],
    };

    try {
      const saved = await addInspection(newInspection);
      setInspections([saved, ...inspections]);
      toast({ title: "Vehicle Added", description: `${saved.vehicle} ready for inspection.` });
      setIsAddVehicleOpen(false);
    } catch {
      toast({ title: "Error", description: "Could not add vehicle." });
    }
  };

  const startInspection = (id: string) => {
    const inspection = inspections.find((i) => i.id === id);
    if (inspection) {
      setCurrentInspection({ ...inspection });
      setIsInspectOpen(true);
    }
  };

  const handleDiagramClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const { x, y } = pt.matrixTransform(ctm.inverse());
    setNewDamagePoint({ x, y });
    setIsAddDamageOpen(true);
  };

  const handleAddDamage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentInspection || !newDamagePoint) return;

    const formData = new FormData(event.currentTarget);
    const newDamage: DamageReport = {
      ...newDamagePoint,
      description: formData.get("description") as string,
    };

    setCurrentInspection({
      ...currentInspection,
      damages: [...currentInspection.damages, newDamage],
    });

    setIsAddDamageOpen(false);
    setNewDamagePoint(null);
    event.currentTarget.reset();
  };

  const removeDamage = (index: number) => {
    if (!currentInspection) return;
    setCurrentInspection({
      ...currentInspection,
      damages: currentInspection.damages.filter((_, i) => i !== index),
    });
  };

  const saveInspection = async (finalStatus: InspectionStatus) => {
    if (!currentInspection) return;
    const updated: Inspection = {
      ...currentInspection,
      status: finalStatus,
      date: new Date().toISOString().split("T")[0],
      inspector: "Current User", // In a real app, get this from useAuth()
    };

    try {
      const saved = await updateInspection(updated.id, updated);
      setInspections(inspections.map((i) => (i.id === saved.id ? saved : i)));
      toast({ title: "Inspection Saved", description: `${saved.vehicle} marked ${finalStatus}.` });
      setIsInspectOpen(false);
      setCurrentInspection(null);
    } catch {
      toast({ title: "Error", description: "Could not save inspection." });
    }
  };

  if (loading) return <p className="p-6">Loading inspections…</p>;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Vehicle & Inspection Tracker</CardTitle>
            <CardDescription>
              Record and monitor vehicle inspections and damage reports.
            </CardDescription>
          </div>
          <Dialog open={isAddVehicleOpen} onOpenChange={setIsAddVehicleOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle>Add New Vehicle</DialogTitle>
                <DialogDescription>
                  Add a new vehicle to the fleet for tracking.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddVehicle} className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicleName">Vehicle Name</Label>
                    <Input id="vehicleName" name="vehicleName" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numberPlate">Number Plate</Label>
                    <Input id="numberPlate" name="numberPlate" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="driverName">Driver Name</Label>
                    <Input id="driverName" name="driverName" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="driverSurname">Driver Surname</Label>
                    <Input id="driverSurname" name="driverSurname" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lastService">Last Service</Label>
                    <Input id="lastService" name="lastService" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nextService">Next Service</Label>
                    <Input id="nextService" name="nextService" type="date" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licenseDiscExpiry">License Disc Expiry</Label>
                  <Input id="licenseDiscExpiry" name="licenseDiscExpiry" type="date" required />
                </div>
                <DialogFooter>
                  <Button type="submit">Add Vehicle</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>License Disc Expiry</TableHead>
                <TableHead>Inspector</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Damages</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inspections.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.vehicle}{" "}
                    <span className="text-xs text-muted-foreground">{item.numberPlate}</span>
                  </TableCell>
                  <TableCell>
                    {item.driverName} {item.driverSurname}
                  </TableCell>
                  <TableCell>{item.licenseDiscExpiry}</TableCell>
                  <TableCell>{item.inspector}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
                  </TableCell>
                  <TableCell>{item.damages.length}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startInspection(item.id)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Inspect
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Inspection Dialog */}
      <Dialog open={isInspectOpen} onOpenChange={setIsInspectOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Inspect: {currentInspection?.vehicle}</DialogTitle>
            <DialogDescription>
              Click on the diagram to report damage. Review existing damages below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div>
              <Label>Damage Diagram</Label>
              <VehicleDiagram
                damages={currentInspection?.damages || []}
                onClick={handleDiagramClick}
              />
            </div>
            <div className="space-y-4">
              <Label>Reported Damages</Label>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {currentInspection?.damages.map((damage, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 border rounded-md text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <Circle className="h-2 w-2 text-destructive fill-destructive" />
                      {damage.description}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeDamage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {currentInspection?.damages.length === 0 && (
                  <p className="text-xs text-muted-foreground italic text-center py-4">
                    No damages reported.
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="destructive" onClick={() => saveInspection("Failed")}>
              Save as Failed
            </Button>
            <Button onClick={() => saveInspection("Passed")}>Save as Passed</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Damage Dialog */}
      <Dialog open={isAddDamageOpen} onOpenChange={setIsAddDamageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Damage Report</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddDamage}>
            <div className="py-4">
              <Label htmlFor="description">Damage Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="e.g., Deep scratch on passenger door"
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit">Add Damage</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
