// /home/user/studio/src/app/site-resource-tracker/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Car, MapPin, Save, Download } from "lucide-react";
import type { Employee, Vehicle, Site } from "@/types/core-data";
import type { SiteAssignments } from "@/lib/site-assignment-service";

// API Helpers
async function fetchSiteResources(): Promise<{
  sites: Site[];
  employees: Employee[];
  vehicles: Vehicle[];
  assignments: SiteAssignments;
}> {
  const res = await fetch("/api/site-resources");
  if (!res.ok) throw new Error("Failed to load resources");
  const payload = await res.json();
  return payload.data;
}

async function assignEmployee(employeeId: string, siteId: string) {
  await fetch("/api/assign/employee", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employeeId, siteId }),
  });
}

async function assignVehicle(vehicleId: string, siteId: string) {
  await fetch("/api/assign/vehicle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vehicleId, siteId }),
  });
}

async function saveReportToBackend(reportId: string) {
  await fetch("/api/report/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reportId }),
  });
}

export default function SiteResourceTrackerPage() {
  const { toast } = useToast();

  const [sites, setSites] = useState<Site[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [employeeAssignments, setEmployeeAssignments] = useState<
    Record<string, string>
  >({});
  const [vehicleAssignments, setVehicleAssignments] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchSiteResources();
        setSites(data.sites);
        setEmployees(data.employees);
        setVehicles(data.vehicles.filter((v) => v.status === "Passed"));
        setEmployeeAssignments(data.assignments.employees || {});
        setVehicleAssignments(data.assignments.vehicles || {});
      } catch (e) {
        toast({ title: "Error", description: "Could not load resources." });
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  const handleAssignEmployee = async (employeeId: string, siteId: string) => {
    try {
      await assignEmployee(employeeId, siteId);
      setEmployeeAssignments((prev) => ({ ...prev, [employeeId]: siteId }));
    } catch {
      toast({ title: "Error", description: "Failed to assign employee." });
    }
  };

  const handleAssignVehicle = async (vehicleId: string, siteId: string) => {
    try {
      await assignVehicle(vehicleId, siteId);
      setVehicleAssignments((prev) => ({ ...prev, [vehicleId]: siteId }));
    } catch {
      toast({ title: "Error", description: "Failed to assign vehicle." });
    }
  };

  const handleDownloadReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Site Resource Allocation Report", 14, 22);

    let y = 30;

    sites.forEach((site, index) => {
      doc.setFontSize(14);
      doc.text(`${site.name} - ${site.location}`, 14, y);
      y += 8;

      const employeesOnSite = employees.filter(
        (emp) => employeeAssignments[emp.id] === site.id
      );
      const vehiclesOnSite = vehicles.filter((v) => {
        const key = String(v.id ?? v.vehicle);
        return vehicleAssignments[key] === site.id;
      });

      if (employeesOnSite.length > 0) {
        autoTable(doc, {
          head: [["Assigned Personnel"]],
          body: employeesOnSite.map((e) => [`${e.firstName} ${e.surname}`]),
          startY: y,
          theme: "grid",
        });
        y = (doc as any).lastAutoTable.finalY + 10;
      }

      if (vehiclesOnSite.length > 0) {
        autoTable(doc, {
          head: [["Assigned Vehicles"]],
          body: vehiclesOnSite.map((v) => [v.vehicle]),
          startY: y,
          theme: "grid",
        });
        y = (doc as any).lastAutoTable.finalY + 10;
      }

      if (employeesOnSite.length === 0 && vehiclesOnSite.length === 0) {
        doc.setFontSize(10);
        doc.text("No resources assigned.", 14, y);
        y += 10;
      }

      if (index < sites.length - 1) {
        y += 5;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      }
    });

    doc.save("Site_Resource_Report.pdf");
  };

  const handleSaveToGenerated = async () => {
    try {
      await saveReportToBackend("site-resource-report");
      toast({
        title: "Report Saved",
        description:
          "The resource allocation report has been saved to Generated Documents.",
      });
    } catch {
      toast({ title: "Error", description: "Failed to save report." });
    }
  };

  if (loading) {
    return <p className="p-6">Loading site resources…</p>;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Available Resources Column */}
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Available Employees</CardTitle>
            <CardDescription>Assign employees to a site.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[300px] overflow-y-auto">
            {employees.map((employee) => (
              <Card
                key={employee.id}
                className="p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">
                      {employee.firstName} {employee.surname}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {employee.idNumber}
                    </p>
                  </div>
                </div>
                {employeeAssignments[employee.id] && (
                  <Badge variant="secondary">Assigned</Badge>
                )}
              </Card>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Vehicles</CardTitle>
            <CardDescription>
              Assign vehicles with passed inspections.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[300px] overflow-y-auto">
            {vehicles.map((vehicle) => {
              const vehicleKey = String(vehicle.id ?? vehicle.vehicle);
              return (
                <Card
                  key={vehicleKey}
                  className="p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Car className="h-5 w-5 text-primary" />
                    <p className="font-semibold">{vehicle.vehicle}</p>
                  </div>
                  {vehicleAssignments[vehicleKey] && (
                    <Badge variant="secondary">Assigned</Badge>
                  )}
                </Card>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Sites Column */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Site Assignments</CardTitle>
            <CardDescription>
              Manage resource allocation for each site.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {sites.map((site) => (
              <Card key={site.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />{" "}
                    {site.name}
                  </CardTitle>
                  <CardDescription>{site.location}</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Assigned Personnel */}
                  <div>
                    <p className="text-sm font-medium mb-2">
                      Assigned Personnel:
                    </p>
                    <div className="space-y-2">
                      {employees
                        .filter((emp) => employeeAssignments[emp.id] === site.id)
                        .map((emp) => (
                          <div
                            key={emp.id}
                            className="text-sm text-muted-foreground p-2 border rounded-md"
                          >
                            {emp.firstName} {emp.surname}
                          </div>
                        ))}
                      {employees.filter(
                        (emp) => employeeAssignments[emp.id] === site.id
                      ).length === 0 && (
                        <p className="text-xs text-muted-foreground italic">
                          No employees assigned.
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Assigned Vehicles */}
                  <div>
                    <p className="text-sm font-medium mb-2">
                      Assigned Vehicles:
                    </p>
                    <div className="space-y-2">
                      {vehicles
                        .filter(
                          (v) =>
                            vehicleAssignments[String(v.id ?? v.vehicle)] === site.id
                        )
                        .map((v) => {
                          const vehicleKey = String(v.id ?? v.vehicle);
                          return (
                            <div
                              key={vehicleKey}
                              className="text-sm text-muted-foreground p-2 border rounded-md"
                            >
                              {v.vehicle}
                            </div>
                          );
                        })}
                      {vehicles.filter(
                        (v) =>
                          vehicleAssignments[String(v.id ?? v.vehicle)] === site.id
                      ).length === 0 && (
                        <p className="text-xs text-muted-foreground italic">
                          No vehicles assigned.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2 pt-4">
                  <p className="text-xs font-semibold w-full text-muted-foreground">
                    Assign Resources:
                  </p>
                  {employees
                    .filter((emp) => employeeAssignments[emp.id] !== site.id)
                    .map((emp) => (
                      <Button
                        key={`assign-emp-${emp.id}`}
                        size="sm"
                        variant="outline"
                        onClick={() => handleAssignEmployee(emp.id, site.id)}
                      >
                        <User className="mr-2 h-4 w-4" /> {emp.firstName}
                      </Button>
                    ))}
                  {vehicles
                    .filter(
                      (v) =>
                        vehicleAssignments[String(v.id ?? v.vehicle)] !== site.id
                    )
                    .map((v) => {
                      const vehicleKey = String(v.id ?? v.vehicle);
                      return (
                        <Button
                          key={`assign-veh-${vehicleKey}`}
                          size="sm"
                          variant="outline"
                          onClick={() => handleAssignVehicle(vehicleKey, site.id)}
                        >
                          <Car className="mr-2 h-4 w-4" /> {v.vehicle}
                        </Button>
                      );
                    })}
                </CardFooter>
              </Card>
            ))}
          </CardContent>
          <Separator />
          <CardFooter className="justify-end gap-2 pt-6">
            <Button variant="secondary" onClick={handleSaveToGenerated}>
              <Save className="mr-2 h-4 w-4" /> Save to Generated Docs
            </Button>
            <Button onClick={handleDownloadReport}>
              <Download className="mr-2 h-4 w-4" /> Download Report
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
