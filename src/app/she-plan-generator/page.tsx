"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import jsPDF from "jspdf";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Download, Eye, Save } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
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
import { CopyButton } from "@/components/copy-button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

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

type FormValues = z.infer<typeof formSchema>;

export default function ShePlanGeneratorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateShePlanOutput | null>(null);
  const [formValues, setFormValues] = useState<FormValues | null>(null);
  const [logoDataUri, setLogoDataUri] = useState<string | null>(null);
  const [pdfDataUri, setPdfDataUri] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectLocation: "",
      scopeOfWork: "",
      employeeCount: "",
      hazards: "",
      safetyPersonnel: "",
      emergencyContacts: "",
    },
  });

  const normalizeContent = (value: unknown): string => {
    if (Array.isArray(value)) return value.join("\n• ");
    if (typeof value === "object" && value !== null) return JSON.stringify(value, null, 2);
    return String(value ?? "");
  };

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setResult(null);
    setPdfDataUri(null);
    setFormValues(values);

    const projectDescription = `
      Project Location: ${values.projectLocation}
      Scope of Work: ${values.scopeOfWork}
      Number of Employees/Contractors: ${values.employeeCount}
      Expected Hazards: ${values.hazards}
      Appointed Safety Personnel: ${values.safetyPersonnel}
      Emergency Contacts: ${values.emergencyContacts}
      Project Dates: ${format(values.projectDates.from, "PPP")} to ${format(values.projectDates.to, "PPP")}
    `;

    const response = await generateShePlanAction({ projectDescription });
    setIsLoading(false);

    if (response.success) {
      setResult(response.data);
      toast({
        title: "Success",
        description: "SHE Plan generated successfully.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: response.error,
      });
    }
  }

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
