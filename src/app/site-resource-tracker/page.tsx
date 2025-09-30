
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, MapPin } from "lucide-react";
import { initialEmployees, type Employee } from "@/lib/employee-data";
import { Badge } from "@/components/ui/badge";

type Site = {
  id: string;
  name: string;
  location: string;
};

const sites: Site[] = [
    { id: "site-01", name: "Sasolburg Main Site", location: "Sasolburg, Free State" },
    { id: "site-02", name: "Secunda Expansion Project", location: "Secunda, Mpumalanga" },
];

export default function SiteResourceTrackerPage() {
  const [assignments, setAssignments] = useState<Record<string, string>>({}); // employeeId -> siteId

  const handleAssign = (employeeId: string, siteId: string) => {
    setAssignments(prev => ({
        ...prev,
        [employeeId]: prev[employeeId] === siteId ? "" : siteId
    }));
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Employee List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Available Employees</CardTitle>
          <CardDescription>Drag employees to a site.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {initialEmployees.map((employee) => (
            <Card key={employee.id} className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                        <p className="font-semibold">{employee.firstName} {employee.surname}</p>
                        <p className="text-xs text-muted-foreground">{employee.idNumber}</p>
                    </div>
                </div>
                {assignments[employee.id] && <Badge variant="secondary">Assigned</Badge>}
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Site List */}
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
        {sites.map(site => (
            <Card key={site.id}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-muted-foreground"/> {site.name}</CardTitle>
                    <CardDescription>{site.location}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p className="text-sm font-medium mb-2">Assigned Personnel:</p>
                    {initialEmployees.filter(emp => assignments[emp.id] === site.id).map(emp => (
                        <div key={emp.id} className="text-sm text-muted-foreground p-2 border rounded-md">
                           {emp.firstName} {emp.surname}
                        </div>
                    ))}
                    {initialEmployees.filter(emp => assignments[emp.id] === site.id).length === 0 && (
                        <p className="text-xs text-muted-foreground italic">No employees assigned.</p>
                    )}

                    <div className="pt-4 space-x-2">
                        {initialEmployees.filter(emp => assignments[emp.id] !== site.id).map(emp => (
                            <Button key={emp.id} size="sm" variant="outline" onClick={() => handleAssign(emp.id, site.id)}>
                                Assign {emp.firstName}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
}
