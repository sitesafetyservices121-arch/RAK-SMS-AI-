"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ClipboardList,
  UserPlus,
  Plus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  Search,
  Filter,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import AddEmployeeDialog from "@/components/training/add-employee-dialog";
import AddTrainingDialog from "@/components/training/add-training-dialog";
import EmployeeDetailsDialog from "@/components/training/employee-details-dialog";
import NotificationBell from "@/components/training/notification-bell";
import type { EmployeeWithTraining } from "@/types/training";
import { getEmployeesWithTraining, getCompanyTrainingStats } from "@/lib/training-service";
import { generateTrainingReport } from "@/lib/training-reports";
import { checkAndCreateNotifications } from "@/lib/training-notifications";

export default function EmployeeTrainingTrackerPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [employees, setEmployees] = useState<EmployeeWithTraining[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  const [addTrainingOpen, setAddTrainingOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithTraining | null>(null);
  const [exportingReport, setExportingReport] = useState(false);
  const [companyId, setCompanyId] = useState<string>("");
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalCourses: 0,
    validCourses: 0,
    expiringCourses: 0,
    expiredCourses: 0,
    complianceRate: 100,
  });

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      // Get user's company ID from their profile
      const userDoc = await fetch(`/api/users/${user.uid}`).then(res => res.json());
      const fetchedCompanyId = userDoc.companyId || "default-company";
      setCompanyId(fetchedCompanyId);

      const [employeesData, statsData] = await Promise.all([
        getEmployeesWithTraining(fetchedCompanyId),
        getCompanyTrainingStats(fetchedCompanyId),
        checkAndCreateNotifications(fetchedCompanyId), // Check for expiring courses
      ]);

      setEmployees(employeesData);
      setStats(statsData);
    } catch (error) {
      console.error("Error loading training data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load training data",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const filteredEmployees = employees.filter(emp =>
    `${emp.firstName} ${emp.lastName} ${emp.email} ${emp.idNumber}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const expiringEmployees = filteredEmployees.filter(emp => emp.expiringCoursesCount > 0);
  const expiredEmployees = filteredEmployees.filter(emp => emp.expiredCoursesCount > 0);

  const getStatusBadge = (employee: EmployeeWithTraining) => {
    if (employee.expiredCoursesCount > 0) {
      return <Badge variant="destructive" className="gap-1">
        <XCircle className="h-3 w-3" />
        {employee.expiredCoursesCount} Expired
      </Badge>;
    }
    if (employee.expiringCoursesCount > 0) {
      return <Badge variant="warning" className="gap-1 bg-yellow-500 text-white">
        <AlertTriangle className="h-3 w-3" />
        {employee.expiringCoursesCount} Expiring Soon
      </Badge>;
    }
    return <Badge variant="success" className="gap-1 bg-green-500 text-white">
      <CheckCircle className="h-3 w-3" />
      All Valid
    </Badge>;
  };

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString();
  };

  const handleExportReport = async () => {
    if (!user) return;

    setExportingReport(true);
    try {
      const userDoc = await fetch(`/api/users/${user.uid}`).then(res => res.json());
      const companyId = userDoc.companyId || "default-company";

      const result = await generateTrainingReport({
        companyId,
        userId: user.uid,
        reportType: "all-employees",
        includeDetails: true,
      });

      toast({
        title: "Report Generated",
        description: `Report saved to Generated Documents. ${result.employeeCount} employees included.`,
      });

      // Open download URL in new tab
      if (result.downloadUrl) {
        window.open(result.downloadUrl, "_blank");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate report",
      });
    } finally {
      setExportingReport(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Employee Training Tracker</h1>
        </div>
        <div className="flex gap-2">
          {companyId && <NotificationBell companyId={companyId} />}
          <Button onClick={() => setAddEmployeeOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.complianceRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.validCourses} of {stats.totalCourses} valid
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.expiringCourses}</div>
            <p className="text-xs text-muted-foreground">Within 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.expiredCourses}</div>
            <p className="text-xs text-muted-foreground">Needs renewal</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Training Records</CardTitle>
              <CardDescription>
                Manage employee training certificates and track expiry dates
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportReport}
              disabled={exportingReport || loading}
            >
              <Download className="mr-2 h-4 w-4" />
              {exportingReport ? "Generating..." : "Export Report"}
            </Button>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">
                All Employees ({filteredEmployees.length})
              </TabsTrigger>
              <TabsTrigger value="expiring">
                Expiring Soon ({expiringEmployees.length})
              </TabsTrigger>
              <TabsTrigger value="expired">
                Expired ({expiredEmployees.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : filteredEmployees.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No employees found. Click "Add Employee" to get started.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>ID Number</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Cell</TableHead>
                      <TableHead>Courses</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">
                          {employee.firstName} {employee.lastName}
                        </TableCell>
                        <TableCell>{employee.idNumber}</TableCell>
                        <TableCell>{employee.email}</TableCell>
                        <TableCell>{employee.cellphone}</TableCell>
                        <TableCell>{employee.trainings.length}</TableCell>
                        <TableCell>{getStatusBadge(employee)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedEmployee(employee)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="expiring" className="mt-4">
              {expiringEmployees.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No courses expiring soon
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Expiring Courses</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expiringEmployees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">
                          {employee.firstName} {employee.lastName}
                        </TableCell>
                        <TableCell>{employee.email}</TableCell>
                        <TableCell>
                          <Badge variant="warning" className="bg-yellow-500 text-white">
                            {employee.expiringCoursesCount} course(s)
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedEmployee(employee)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="expired" className="mt-4">
              {expiredEmployees.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No expired courses
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Expired Courses</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expiredEmployees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">
                          {employee.firstName} {employee.lastName}
                        </TableCell>
                        <TableCell>{employee.email}</TableCell>
                        <TableCell>
                          <Badge variant="destructive">
                            {employee.expiredCoursesCount} course(s)
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedEmployee(employee)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddEmployeeDialog
        open={addEmployeeOpen}
        onOpenChange={setAddEmployeeOpen}
        onSuccess={loadData}
      />

      <AddTrainingDialog
        open={addTrainingOpen}
        onOpenChange={setAddTrainingOpen}
        onSuccess={loadData}
        employees={employees}
      />

      {selectedEmployee && (
        <EmployeeDetailsDialog
          employee={selectedEmployee}
          open={!!selectedEmployee}
          onOpenChange={(open) => !open && setSelectedEmployee(null)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
