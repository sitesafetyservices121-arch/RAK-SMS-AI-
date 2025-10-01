"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: {
    head: string[][];
    body: (string | number)[][];
    startY: number;
  }) => jsPDF;
}

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
  MoreHorizontal,
  PlusCircle,
  Download,
  UserPlus,
  Edit,
  CalendarIcon,
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { initialEmployees, type Employee, type Course } from "@/lib/employee-data";

export default function EmployeeTrainingTrackerPage() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const { toast } = useToast();

  const getStatusVariant = (
    status: string
  ): "default" | "destructive" | "secondary" | "outline" => {
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
      id: crypto.randomUUID(),
      firstName: formData.get("firstName") as string,
      surname: formData.get("surname") as string,
      idNumber: formData.get("idNumber") as string,
      codeLicense: formData.get("codeLicense") as string,
      courses: [],
    };
    setEmployees([...employees, newEmployee]);
    toast({
      title: "Employee Added",
      description: `${newEmployee.firstName} ${newEmployee.surname} has been added.`,
    });
    setIsAddEmployeeOpen(false);
    event.currentTarget.reset();
  };

  const handleAddCourse = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedEmployeeId) return;

    const formData = new FormData(event.currentTarget);
    const newCourse: Course = {
      courseName: formData.get("courseName") as string,
      status: formData.get("status") as "Completed" | "Expired" | "Scheduled",
      expiryDate: formData.get("expiryDate")
        ? format(new Date(formData.get("expiryDate") as string), "yyyy-MM-dd")
        : "N/A",
    };

    setEmployees(
      employees.map((emp) => {
        if (emp.id === selectedEmployeeId) {
          return { ...emp, courses: [...emp.courses, newCourse] };
        }
        return emp;
      })
    );

    toast({
      title: "Course Added",
      description: `Added '${newCourse.courseName}' to the selected employee.`,
    });

    setIsAddCourseOpen(false);
    setSelectedEmployeeId(null);
  };

  const handleDownloadReport = () => {
    const doc = new jsPDF({ orientation: "landscape" }) as jsPDFWithAutoTable;
    doc.text("Employee Training Report", 14, 15);

    const tableData = employees.flatMap((emp) =>
      emp.courses.length > 0
        ? emp.courses.map((course) => [
            emp.firstName,
            emp.surname,
            emp.idNumber,
            course.courseName,
            course.status,
            course.expiryDate,
          ])
        : [
            [
              emp.firstName,
              emp.surname,
              emp.idNumber,
              "No courses",
              "N/A",
              "N/A",
            ],
          ]
    );

    doc.autoTable({
      head: [
        [
          "First Name",
          "Surname",
          "ID Number",
          "Course",
          "Status",
          "Expiry Date",
        ],
      ],
      body: tableData,
      startY: 20,
    });

    doc.save("employee-training-report.pdf");
  };

  const openAddCourseDialog = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setIsAddCourseOpen(true);
  };

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
                <DialogDescription>
                  Enter the details for the new employee.
                </DialogDescription>
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

          <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Course</DialogTitle>
                <DialogDescription>
                  Add a new training record for the selected employee.
                </DialogDescription>
              </DialogHeader>
              <AddCourseForm onSubmit={handleAddCourse} />
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
              employee.courses.length > 0 ? (
                employee.courses.map((course, courseIndex) => (
                  <TableRow key={`${employee.id}-${courseIndex}`}>
                    {courseIndex === 0 && (
                      <TableCell
                        className="font-medium"
                        rowSpan={employee.courses.length}
                      >
                        {`${employee.firstName} ${employee.surname}`}
                        <div className="text-xs text-muted-foreground">
                          {employee.idNumber}
                        </div>
                      </TableCell>
                    )}
                    <TableCell>{course.courseName}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(course.status)}>
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
                          <DropdownMenuItem
                            onClick={() => openAddCourseDialog(employee.id)}
                          >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Course
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Record
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow key={`${employee.id}-no-courses`}>
                  <TableCell className="font-medium">
                    {`${employee.firstName} ${employee.surname}`}
                    <div className="text-xs text-muted-foreground">
                      {employee.idNumber}
                    </div>
                  </TableCell>
                  <TableCell
                    colSpan={3}
                    className="text-muted-foreground italic"
                  >
                    No courses recorded
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openAddCourseDialog(employee.id)}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Course
                    </Button>
                  </TableCell>
                </TableRow>
              )
            )}
            {employees.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No employees found. Add one to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function AddCourseForm({
  onSubmit,
}: {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  const [date, setDate] = useState<Date | undefined>(undefined);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    onSubmit(e);
    setDate(undefined); // reset date after submission
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="courseName">Course Name</Label>
        <Input
          id="courseName"
          name="courseName"
          required
          placeholder="e.g., First Aid Level 1"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select name="status" required>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Scheduled">Scheduled</SelectItem>
              <SelectItem value="Expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="expiryDate">Expiry Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {/* Hidden input to pass date to form */}
          <Input
            type="hidden"
            name="expiryDate"
            value={date ? date.toISOString() : ""}
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit">Add Course</Button>
      </DialogFooter>
    </form>
  );
}
