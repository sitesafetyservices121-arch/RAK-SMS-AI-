"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { addTrainingCourse } from "@/lib/training-service";
import type { Employee } from "@/types/training";
import { Timestamp } from "firebase/firestore";

const trainingSchema = z.object({
  employeeId: z.string().min(1, "Please select an employee"),
  courseName: z.string().min(3, "Course name must be at least 3 characters"),
  courseProvider: z.string().optional(),
  certificateNumber: z.string().optional(),
  completionDate: z.string().min(1, "Completion date is required"),
  validityPeriod: z.string().min(1, "Validity period is required"),
  notes: z.string().optional(),
});

type TrainingFormValues = z.infer<typeof trainingSchema>;

interface AddTrainingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  employees: Employee[];
  preselectedEmployeeId?: string;
}

export default function AddTrainingDialog({
  open,
  onOpenChange,
  onSuccess,
  employees,
  preselectedEmployeeId,
}: AddTrainingDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const form = useForm<TrainingFormValues>({
    resolver: zodResolver(trainingSchema),
    defaultValues: {
      employeeId: preselectedEmployeeId || "",
      courseName: "",
      courseProvider: "",
      certificateNumber: "",
      completionDate: "",
      validityPeriod: "",
      notes: "",
    },
  });

  const onSubmit = async (values: TrainingFormValues) => {
    if (!user) return;

    setLoading(true);
    try {
      // Get user's company ID
      const userDoc = await fetch(`/api/users/${user.uid}`).then(res => res.json());
      const companyId = userDoc.companyId || "default-company";

      // Calculate expiry date
      const completionDate = new Date(values.completionDate);
      const validityMonths = parseInt(values.validityPeriod);
      const expiryDate = new Date(completionDate);
      expiryDate.setMonth(expiryDate.getMonth() + validityMonths);

      await addTrainingCourse({
        employeeId: values.employeeId,
        companyId,
        courseName: values.courseName,
        courseProvider: values.courseProvider,
        certificateNumber: values.certificateNumber,
        completionDate: Timestamp.fromDate(completionDate),
        expiryDate: Timestamp.fromDate(expiryDate),
        validityPeriod: validityMonths,
        notes: values.notes,
      });

      toast({
        title: "Success",
        description: "Training course has been added.",
      });

      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add training course",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Training Course</DialogTitle>
          <DialogDescription>
            Record a completed training course and its expiry date
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an employee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id!}>
                          {emp.firstName} {emp.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="courseName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., First Aid Level 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="courseProvider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Provider</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Red Cross" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="certificateNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certificate Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="completionDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Completion Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="validityPeriod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Validity Period *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select validity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="12">12 Months</SelectItem>
                        <SelectItem value="24">24 Months (2 Years)</SelectItem>
                        <SelectItem value="36">36 Months (3 Years)</SelectItem>
                        <SelectItem value="60">60 Months (5 Years)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Certificate expires after this period
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Input placeholder="Additional information (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Training"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
