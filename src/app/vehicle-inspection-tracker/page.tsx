
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
import { Badge } from "@/components/ui/badge";
import { allInspections, type Inspection } from "@/lib/vehicle-data";

export default function VehicleInspectionPage() {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicle & Inspection Tracker</CardTitle>
        <CardDescription>
          Record and monitor vehicle inspections and damage reports.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>Inspection Date</TableHead>
              <TableHead>Inspector</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Damages Reported</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allInspections.map((item) => (
              <TableRow key={item.vehicle}>
                <TableCell className="font-medium">{item.vehicle}</TableCell>
                <TableCell>{item.date}</TableCell>
                <TableCell>{item.inspector}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(item.status) as any}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{item.damages}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
