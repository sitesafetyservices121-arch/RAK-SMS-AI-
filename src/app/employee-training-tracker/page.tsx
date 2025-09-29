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
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const trainingRecords = [
  {
    employee: "John Doe",
    course: "First Aid Level 1",
    status: "Completed",
    expiryDate: "2025-08-01",
  },
  {
    employee: "Jane Smith",
    course: "Working at Heights",
    status: "Completed",
    expiryDate: "2026-01-15",
  },
  {
    employee: "Mike Johnson",
    course: "Fire Fighting",
    status: "Expired",
    expiryDate: "2024-05-20",
  },
  {
    employee: "Sarah Williams",
    course: "HIRA",
    status: "Scheduled",
    expiryDate: "N/A",
  },
  {
    employee: "David Brown",
    course: "First Aid Level 1",
    status: "Completed",
    expiryDate: "2025-09-10",
  },
];

export default function EmployeeTrainingTrackerPage() {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Completed":
        return "default";
      case "Expired":
        return "destructive";
      case "Scheduled":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Training Tracker</CardTitle>
        <CardDescription>
          Track and manage employee training records and certifications.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Course / Certification</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trainingRecords.map((record, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{record.employee}</TableCell>
                <TableCell>{record.course}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(record.status) as any}>
                    {record.status}
                  </Badge>
                </TableCell>
                <TableCell>{record.expiryDate}</TableCell>
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
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit Record</DropdownMenuItem>
                      <DropdownMenuItem>Delete Record</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
