
"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
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
import { MoreHorizontal, PlusCircle, Download, UserPlus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

type Course = {
  courseName: string;
  status: "Completed" | "Expired" | "Scheduled";
  expiryDate: string;
};

type Employee = {
  id: string;
  firstName: string;
  surname: string;
  idNumber: string;
  codeLicense: string;
  courses: Course[];
};

const initialEmployees: Employee[] = [
  {
    id: "EMP-001",
    firstName: "John",
    surname: "Doe",
    idNumber: "8501015000087",
    codeLicense: "C1",
    courses: [
      { courseName: "First Aid Level 1", status: "Completed", expiryDate: "2025-08-01" },
      { courseName: "Working at Heights", status: "Completed", expiryDate: "2026-01-15" },
    ],
  },
  {
    id: "EMP-002",
    firstName: "Jane",
    surname: "Smith",
    idNumber: "9003155111086",
    codeLicense: "N/A",
    courses: [
        { courseName: "HIRA", status: "Scheduled", expiryDate: "N/A" },
        { courseName: "Fire Fighting", status: "Expired", expiryDate: "2024-05-20" },
    ],
  },
];


export default function EmployeeTrainingTrackerPage() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const { toast } = useToast();

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

  const handleAddEmployee = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newEmployee: Employee = {
      id: `EMP-${String(employees.length + 1).padStart(3, '0')}`,
      firstName: formData.get("firstName") as string,
      surname: formData.get("surname") as string,
      idNumber: formData.get("idNumber") as string,
      codeLicense: formData.get("codeLicense") as string,
      courses: [],
    };
    setEmployees([...employees, newEmployee]);
    toast({
        title: "Employee Added",
        description: `${newEmployee.firstName} ${newEmployee.surname} has been added.`
    })
    setIsAddEmployeeOpen(false);
  }
  
  const handleDownloadReport = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.text("Employee Training Report", 14, 15);
    
    const tableData = employees.flatMap(emp => 
        emp.courses.map(course => [
            emp.firstName,
            emp.surname,
            emp.idNumber,
            course.courseName,
            course.status,
            course.expiryDate
        ])
    );

    (doc as any).autoTable({
        head: [['First Name', 'Surname', 'ID Number', 'Course', 'Status', 'Expiry Date']],
        body: tableData,
        startY: 20,
    });
    
    doc.save("employee-training-report.pdf");
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Employee Training Tracker</CardTitle>
            <CardDescription>
            Track and manage employee training records and certifications.
            </CardDescription>
        </div>
        <div className="flex gap-2">
            <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <UserPlus className="mr-2 h-4 w-4" /> Add Employee
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Employee</DialogTitle>
                        <DialogDescription>Enter the details for the new employee.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddEmployee} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input id="firstName" name="firstName" required />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="surname">Surname</Label>
                                <Input id="surname" name="surname" required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="idNumber">ID Number</Label>
                            <Input id="idNumber" name="idNumber" required />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="codeLicense">Code / License No.</Label>
                            <Input id="codeLicense" name="codeLicense" />
                        </div>
                        <DialogFooter>
                            <Button type="submit">Save Employee</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
             <Button variant="outline" onClick={handleDownloadReport}>
                <Download className="mr-2 h-4 w-4" /> Download Report
            </Button>
        </div>
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
            {employees.flatMap((employee) =>
              employee.courses.map((course, courseIndex) => (
                <TableRow key={`${employee.id}-${courseIndex}`}>
                  <TableCell className="font-medium">{`${employee.firstName} ${employee.surname}`}</TableCell>
                  <TableCell>{course.courseName}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(course.status) as any}>
                      {course.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{course.expiryDate}</TableCell>
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
                        <DropdownMenuItem>Add Course</DropdownMenuItem>
                        <DropdownMenuItem>Edit Record</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete Record</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
            {employees.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">No employees found. Add one to get started.</TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
