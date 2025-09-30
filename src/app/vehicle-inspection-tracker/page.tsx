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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { allInspections, type Inspection, type DamageReport } from "@/lib/vehicle-data";
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
import { PlusCircle, Car, X, Edit, Circle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

// Vehicle Diagram Component
const VehicleDiagram = ({ damages, onClick }: { damages: DamageReport[], onClick: (e: React.MouseEvent<SVGSVGElement>) => void }) => {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      <svg
        onClick={onClick}
        className="w-full h-auto cursor-crosshair"
        viewBox="0 0 800 300"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Bakkie Outline */}
        <path
          d="M100 200 L100 150 Q100 130, 120 130 L250 130 L300 90 L550 90 L600 130 L700 130 Q720 130, 720 150 L720 200 L700 200 Q680 200, 680 220 L620 220 Q620 200, 600 200 L200 200 Q180 200, 180 220 L120 220 Q120 200, 100 200 Z"
          stroke="hsl(var(--foreground))"
          strokeWidth="3"
          fill="hsl(var(--muted))"
        />
        <rect x="250" y="130" width="350" height="70" fill="hsl(var(--muted))" />
        <path d="M250 130 L300 90 L550 90 L600 130 Z" stroke="hsl(var(--foreground))" strokeWidth="2" fill="hsl(var(--card))" />
        {/* Wheels */}
        <circle cx="150" cy="220" r="25" fill="hsl(var(--foreground))" />
        <circle cx="650" cy="220" r="25" fill="hsl(var(--foreground))" />

        {/* Damage Points */}
        {damages.map((damage, index) => (
          <circle
            key={index}
            cx={damage.x}
            cy={damage.y}
            r="8"
            fill="hsl(var(--destructive))"
            stroke="hsl(var(--destructive-foreground))"
            strokeWidth="2"
          />
        ))}
      </svg>
    </div>
  );
};


export default function VehicleInspectionPage() {
  const [inspections, setInspections] = useState<Inspection[]>(allInspections);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isInspectOpen, setIsInspectOpen] = useState(false);
  const [isAddDamageOpen, setIsAddDamageOpen] = useState(false);
  const [currentInspection, setCurrentInspection] = useState<Inspection | null>(null);
  const [newDamagePoint, setNewDamagePoint] = useState<{ x: number; y: number } | null>(null);

  const { toast } = useToast();
  
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Passed":
        return "default";
      case "Failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const handleAddVehicle = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newInspection: Inspection = {
      vehicle: formData.get("vehicleName") as string,
      date: new Date().toISOString().split('T')[0],
      inspector: "System",
      status: "Awaiting Inspection",
      damages: [],
    };
    setInspections([newInspection, ...inspections]);
    toast({ title: "Vehicle Added", description: `${newInspection.vehicle} is ready for inspection.` });
    setIsAddVehicleOpen(false);
  };
  
  const startInspection = (vehicleId: string) => {
      const inspection = inspections.find(i => i.vehicle === vehicleId);
      if (inspection) {
          setCurrentInspection({...inspection});
          setIsInspectOpen(true);
      }
  };

  const handleDiagramClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const { x, y } = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    setNewDamagePoint({ x, y });
    setIsAddDamageOpen(true);
  };

  const handleAddDamage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentInspection || !newDamagePoint) return;
    
    const formData = new FormData(event.currentTarget);
    const newDamage: DamageReport = {
        ...newDamagePoint,
        description: formData.get('description') as string,
    };
    
    setCurrentInspection({
        ...currentInspection,
        damages: [...currentInspection.damages, newDamage]
    });

    setIsAddDamageOpen(false);
    setNewDamagePoint(null);
    event.currentTarget.reset();
  }

  const removeDamage = (index: number) => {
    if(!currentInspection) return;
    setCurrentInspection({
      ...currentInspection,
      damages: currentInspection.damages.filter((_, i) => i !== index)
    });
  }

  const saveInspection = (finalStatus: "Passed" | "Failed") => {
    if (!currentInspection) return;
    
    const updatedInspection = {
        ...currentInspection,
        status: finalStatus,
        date: new Date().toISOString().split('T')[0],
        // In a real app, inspector would be the logged-in user
        inspector: "Current User",
    };
    
    setInspections(inspections.map(i => i.vehicle === updatedInspection.vehicle ? updatedInspection : i));
    toast({ title: "Inspection Saved", description: `${updatedInspection.vehicle} status set to ${finalStatus}.` });
    setIsInspectOpen(false);
    setCurrentInspection(null);
  }

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
                <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Vehicle</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Vehicle</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddVehicle}>
                    <div className="py-4">
                        <Label htmlFor="vehicleName">Vehicle Name / Reg. No.</Label>
                        <Input id="vehicleName" name="vehicleName" placeholder="e.g., Bakkie 2 - ABC 123 GP" required />
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
                <TableHead>Last Inspection</TableHead>
                <TableHead>Inspector</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Damages</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inspections.map((item) => (
                <TableRow key={item.vehicle}>
                  <TableCell className="font-medium">{item.vehicle}</TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>{item.inspector}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(item.status) as any}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.damages.length}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => startInspection(item.vehicle)}>
                      <Edit className="mr-2 h-4 w-4"/>
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
                <DialogDescription>Click on the diagram to report damage. Review existing damages below.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div>
                   <Label>Damage Diagram</Label>
                   <VehicleDiagram damages={currentInspection?.damages || []} onClick={handleDiagramClick} />
                </div>
                <div className="space-y-4">
                    <Label>Reported Damages</Label>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {currentInspection?.damages.map((damage, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border rounded-md text-sm">
                                <span className="flex items-center gap-2"><Circle className="h-2 w-2 text-destructive fill-destructive" /> {damage.description}</span>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeDamage(index)}>
                                    <X className="h-4 w-4"/>
                                </Button>
                            </div>
                        ))}
                        {currentInspection?.damages.length === 0 && <p className="text-xs text-muted-foreground italic text-center py-4">No damages reported.</p>}
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button variant="destructive" onClick={() => saveInspection('Failed')}>Save as Failed</Button>
                <Button onClick={() => saveInspection('Passed')}>Save as Passed</Button>
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
                    <Textarea id="description" name="description" placeholder="e.g., Deep scratch on passenger door" required />
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
