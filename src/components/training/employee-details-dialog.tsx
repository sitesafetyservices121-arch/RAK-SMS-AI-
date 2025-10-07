"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Calendar,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deleteTrainingCourse } from "@/lib/training-service";
import AddTrainingDialog from "./add-training-dialog";
import type { EmployeeWithTraining, TrainingCourse } from "@/types/training";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface EmployeeDetailsDialogProps {
  employee: EmployeeWithTraining;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function EmployeeDetailsDialog({
  employee,
  open,
  onOpenChange,
  onSuccess,
}: EmployeeDetailsDialogProps) {
  const { toast } = useToast();
  const [addTrainingOpen, setAddTrainingOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "valid":
        return (
          <Badge variant="default" className="gap-1 bg-green-500 text-white">
            <CheckCircle className="h-3 w-3" />
            Valid
          </Badge>
        );
      case "expiring-soon":
        return (
          <Badge variant="secondary" className="gap-1 bg-yellow-500 text-white">
            <AlertTriangle className="h-3 w-3" />
            Expiring Soon
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Expired
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString();
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;

    setDeleting(true);
    try {
      await deleteTrainingCourse(courseToDelete);
      toast({
        title: "Success",
        description: "Training course has been deleted.",
      });
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
      onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete training course",
      });
    } finally {
      setDeleting(false);
    }
  };

  const confirmDelete = (courseId: string) => {
    setCourseToDelete(courseId);
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {employee.firstName} {employee.lastName}
            </DialogTitle>
            <DialogDescription>
              View and manage employee training records
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Employee Information */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">ID Number</p>
                <p className="font-medium">{employee.idNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{employee.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cell Phone</p>
                <p className="font-medium">{employee.cellphone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={employee.status === "active" ? "default" : "secondary"}>
                  {employee.status}
                </Badge>
              </div>
              {employee.position && (
                <div>
                  <p className="text-sm text-muted-foreground">Position</p>
                  <p className="font-medium">{employee.position}</p>
                </div>
              )}
              {employee.department && (
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">{employee.department}</p>
                </div>
              )}
            </div>

            {/* Training Courses */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Training Courses</h3>
                <Button
                  size="sm"
                  onClick={() => setAddTrainingOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Course
                </Button>
              </div>

              {employee.trainings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border rounded-lg">
                  No training courses recorded yet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course Name</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Certificate #</TableHead>
                      <TableHead>Completion Date</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employee.trainings.map((training) => (
                      <TableRow key={training.id}>
                        <TableCell className="font-medium">
                          {training.courseName}
                        </TableCell>
                        <TableCell>{training.courseProvider || "N/A"}</TableCell>
                        <TableCell>{training.certificateNumber || "N/A"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {formatDate(training.completionDate)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {formatDate(training.expiryDate)}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(training.status)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => confirmDelete(training.id!)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* Summary Statistics */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold">{employee.trainings.length}</p>
                <p className="text-sm text-muted-foreground">Total Courses</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {employee.expiringCoursesCount}
                </p>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {employee.expiredCoursesCount}
                </p>
                <p className="text-sm text-muted-foreground">Expired</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Training Dialog */}
      <AddTrainingDialog
        open={addTrainingOpen}
        onOpenChange={setAddTrainingOpen}
        onSuccess={() => {
          setAddTrainingOpen(false);
          onSuccess();
        }}
        employees={[employee]}
        preselectedEmployeeId={employee.id}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this training course record. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCourse}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
