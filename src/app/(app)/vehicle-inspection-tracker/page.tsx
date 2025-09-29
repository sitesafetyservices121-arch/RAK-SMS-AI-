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

const inspections = [
  {
    vehicle: "Bakkie 1 - HLU 456 GP",
    date: "2024-07-20",
    inspector: "John Doe",
    status: "Passed",
    damages: 0,
  },
  {
    vehicle: "Truck 5 - KJL 123 NW",
    date: "2024-07-20",
    inspector: "Jane Smith",
    status: "Failed",
    damages: 2,
  },
  {
    vehicle: "Crane 2 - GHY 789 LP",
    date: "2024-07-19",
    inspector: "John Doe",
    status: "Passed",
    damages: 0,
  },
  {
    vehicle: "Bakkie 3 - DFR 345 FS",
    date: "2024-07-18",
    inspector: "Mike Johnson",
    status: "Passed",
    damages: 1,
  },
];

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
                <TableCell className="text-right">{item.damages}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
