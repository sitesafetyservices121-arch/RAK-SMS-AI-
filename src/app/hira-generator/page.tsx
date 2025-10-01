"use client";

import { z } from "zod";
import "jspdf-autotable";

import {
  Card,
} from "@/components/ui/card";

//
// ---------------- Zod Schema ----------------
//
const hazardSchema = z.object({
  hazard: z.string().min(1, "Hazard description is required."),
  employeesExposed: z.coerce
    .number()
    .min(1, "At least one employee must be exposed."),
  existingControls: z.string().min(1, "Existing controls are required."),
  severityBefore: z.coerce.number().min(1).max(5),
  likelihoodBefore: z.coerce.number().min(1).max(5),
  additionalControls: z.string().optional(),
  severityAfter: z.coerce.number().min(1).max(5).optional(),
  likelihoodAfter: z.coerce.number().min(1).max(5).optional(),
});

const activitySchema = z.object({
  activity: z.string().min(1, "Activity description is required."),
  hazards: z
    .array(hazardSchema)
    .min(1, "At least one hazard is required for each activity."),
});

const formSchema = z.object({
  projectName: z.string().min(1, "Project Name is required."),
  clientName: z.string().min(1, "Client Name is required."),
  location: z.string().min(1, "Location is required."),
  activities: z
    .array(activitySchema)
    .min(1, "At least one activity is required."),
});

//
// ---------------- HiraGeneratorPage ----------------
//
export default function HiraGeneratorPage() {
  return (
    <Card>
      {/* ... your form JSX unchanged ... */}
    </Card>
  );
}
