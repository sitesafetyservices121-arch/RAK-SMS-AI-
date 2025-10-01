"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { generateShePlanAction } from "./actions";
import type { GenerateShePlanOutput } from "@/ai/flows/ai-she-plan-from-prompt";
import LoadingDots from "@/components/ui/loading-dots";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  projectLocation: z.string().min(1),
  scopeOfWork: z.string().min(1),
  employeeCount: z.string().min(1),
  hazards: z.string().min(1),
  safetyPersonnel: z.string().min(1),
  emergencyContacts: z.string().min(1),
  projectDates: z.object({
    from: z.date({ required_error: "A start date is required." }),
    to: z.date({ required_error: "An end date is required." }),
  }),
  logo: z.instanceof(File).optional(),
});

export default function ShePlanGeneratorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateShePlanOutput | null>(null);
  const { toast } = useToast();

  const normalizeContent = (value: unknown): string => {
    if (Array.isArray(value)) return value.join("\n• ");
    if (typeof value === "object" && value !== null) return JSON.stringify(value, null, 2);
    return String(value ?? "");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* LEFT FORM */}
      <Card className="lg:col-span-2">
        {/* ... form rendering same as before ... */}
      </Card>

      {/* RIGHT RESULT */}
      <div className="lg:col-span-3">
        <Card className="min-h-[600px] sticky top-20">
          <CardHeader>
            <CardTitle>Generated SHE Plan</CardTitle>
            <CardDescription>Review the AI-generated plan below.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && <LoadingDots />}
            {result && (
              <div className="space-y-4 text-sm">
                {Object.entries(result).map(([key, value]) => (
                  <div key={key}>
                    <h3 className="font-semibold text-base">
                      {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                    </h3>
                    <Separator className="my-1" />
                    <p className="whitespace-pre-wrap text-muted-foreground">
                      {normalizeContent(value)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
