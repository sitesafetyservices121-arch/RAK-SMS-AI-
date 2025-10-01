"use client";

import { useState } from "react";
import { useForm, useFieldArray, useWatch, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { generateHiraAction } from "./actions";
import LoadingDots from "@/components/ui/loading-dots";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Download, PlusCircle, Trash2, Wand2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

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
// ---------------- Types ----------------
//
type FormValues = z.infer<typeof formSchema>;
type Hazard = z.infer<typeof hazardSchema>;

type HiraAIResponse = {
  controlMeasures: string;
};

//
// ---------------- Risk Matrix ----------------
//
const riskMatrix: { [key: number]: { label: string; color: string; textColor: string } } = {
  1: { label: "Low", color: "bg-green-600", textColor: "text-white" },
  2: { label: "Low", color: "bg-green-600", textColor: "text-white" },
  3: { label: "Low", color: "bg-green-600", textColor: "text-white" },
  4: { label: "Low", color: "bg-green-600", textColor: "text-white" },
  5: { label: "Medium", color: "bg-yellow-500", textColor: "text-black" },
  6: { label: "Medium", color: "bg-yellow-500", textColor: "text-black" },
  8: { label: "Medium", color: "bg-yellow-500", textColor: "text-black" },
  9: { label: "Medium", color: "bg-yellow-500", textColor: "text-black" },
  10: { label: "High", color: "bg-orange-600", textColor: "text-white" },
  12: { label: "High", color: "bg-orange-600", textColor: "text-white" },
  15: { label: "High", color: "bg-orange-600", textColor: "text-white" },
  16: { label: "Extreme", color: "bg-red-700", textColor: "text-white" },
  20: { label: "Extreme", color: "bg-red-700", textColor: "text-white" },
  25: { label: "Extreme", color: "bg-red-700", textColor: "text-white" },
};

const getRiskRating = (severity?: number, likelihood?: number) => {
  if (!severity || !likelihood) {
    return {
      score: 0,
      label: "N/A",
      color: "bg-gray-400",
      textColor: "text-white",
    };
  }
  const score = severity * likelihood;
  const ratingKey = Object.keys(riskMatrix)
    .reverse()
    .find((key) => score >= parseInt(key));
  return {
    score,
    ...(riskMatrix[ratingKey as any] || {
      label: "Low",
      color: "bg-green-600",
      textColor: "text-white",
    }),
  };
};

//
// ---------------- HazardItem ----------------
//
function HazardItem({
  activityIndex,
  hazardIndex,
  control,
  removeHazard,
  generateControls,
}: {
  activityIndex: number;
  hazardIndex: number;
  control: Control<FormValues>;
  removeHazard: (index: number) => void;
  generateControls: (activityIndex: number, hazardIndex: number) => void;
}) {
  const hazard = useWatch({
    control,
    name: `activities.${activityIndex}.hazards.${hazardIndex}`,
  });

  const riskBefore = getRiskRating(hazard.severityBefore, hazard.likelihoodBefore);
  const riskAfter = getRiskRating(hazard.severityAfter, hazard.likelihoodAfter);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateClick = async () => {
    setIsLoading(true);
    await generateControls(activityIndex, hazardIndex);
    setIsLoading(false);
  };

  return (
    <Card className="bg-muted/50 p-4 space-y-4">
      {/* Hazard form fields */}
      {/* ... keep your JSX unchanged ... */}
    </Card>
  );
}

//
// ---------------- HiraGeneratorPage ----------------
//
export default function HiraGeneratorPage() {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: "",
      clientName: "",
      location: "",
      activities: [
        {
          activity: "",
          hazards: [
            {
              hazard: "",
              employeesExposed: 1,
              existingControls: "",
              severityBefore: 1,
              likelihoodBefore: 1,
              severityAfter: undefined,
              likelihoodAfter: undefined,
              additionalControls: "",
            },
          ],
        },
      ],
    },
  });

  const { fields: activityFields, append: appendActivity, remove: removeActivity } =
    useFieldArray({
      control: form.control,
      name: "activities",
    });

  const generateAIControls = async (activityIndex: number, hazardIndex: number) => {
    const activity = form.getValues(`activities.${activityIndex}`);
    const hazard = activity.hazards[hazardIndex];

    const prompt = `
      Project: ${form.getValues("projectName")}
      Client: ${form.getValues("clientName")}
      Location: ${form.getValues("location")}
      Activity: ${activity.activity}
      Hazard: ${hazard.hazard}
      Existing Controls: ${hazard.existingControls}
      Suggest additional controls under OHS Act & Construction Regs.
    `;

    try {
      const response = (await generateHiraAction({
        projectDetails: prompt,
        regulatoryRequirements: "OHS Act 85 of 1993, Construction Regulations 2014",
      })) as { success: boolean; data?: HiraAIResponse; error?: string };

      if (response.success && response.data) {
        form.setValue(
          `activities.${activityIndex}.hazards.${hazardIndex}.additionalControls`,
          response.data.controlMeasures
        );
        toast({ title: "AI suggestions generated." });
      } else {
        throw new Error(response.error || "Unknown error");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "AI Error",
        description: error.message,
      });
    }
  };

  const handleDownloadPdf = (values: FormValues) => {
    const doc = new jsPDF({ orientation: "landscape" });
    // ... keep your PDF logic unchanged ...
  };

  return (
    <Card>
      {/* ... your form JSX unchanged ... */}
    </Card>
  );
}
