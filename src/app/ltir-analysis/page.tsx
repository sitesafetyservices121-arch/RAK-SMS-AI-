"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: {
    startY: number;
    head: string[][];
    body: (string | number)[][];
  }) => jsPDF;
  lastAutoTable: {
    finalY: number;
  };
}

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import { analyzeLtirAction, saveLtirReportAction } from "./actions";
import { type AnalyzeLtirTrendInput, type AnalyzeLtirTrendOutput } from "@/types/ltir-analysis";
import LoadingDots from "@/components/ui/loading-dots";
import { useToast } from "@/hooks/use-toast";
import { CopyButton } from "@/components/copy-button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Download, Save } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const formSchema = z.object({
  numberOfInjuries: z.coerce.number().min(0, "Cannot be negative."),
  totalHoursWorked: z.coerce.number().min(1, "Hours must be greater than zero."),
  additionalContext: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function LtirAnalysisPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<AnalyzeLtirTrendOutput | null>(null);
  const [calculatedLtir, setCalculatedLtir] = useState<number | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numberOfInjuries: 0,
      totalHoursWorked: 200000,
      additionalContext: "",
    },
  });

  const { numberOfInjuries, totalHoursWorked } = form.watch();

  useEffect(() => {
    if (totalHoursWorked > 0) {
      const ltir = (numberOfInjuries * 200000) / totalHoursWorked;
      setCalculatedLtir(ltir);
    } else {
      setCalculatedLtir(null);
    }
  }, [numberOfInjuries, totalHoursWorked]);

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setResult(null);
    const response = await analyzeLtirAction(values as AnalyzeLtirTrendInput);
    setIsLoading(false);

    if (response.success) {
      setResult(response.data);
    } else {
      if (!response.success) {
        toast({
          variant: "destructive",
          title: "Error",
          description: (response as { success: false; error: string }).error,
        });
      }
    }
  }

  const fullTextResult =
    result && calculatedLtir !== null
      ? `Calculated LTIR: ${calculatedLtir.toFixed(
          2
        )}\n\nTrend Analysis:\n${result.trendAnalysis}\n\nImprovement Areas:\n${
          result.improvementAreas
        }\n\nRecommendations:\n${result.recommendations}`
      : "";

  const handleDownloadReport = () => {
    if (calculatedLtir === null || !result) return;

    const doc = new jsPDF() as jsPDFWithAutoTable;
    doc.text("LTIR Analysis Report", 14, 15);

    doc.autoTable({
      startY: 25,
      head: [["Metric", "Value"]],
      body: [
        ["Number of Lost Time Injuries", numberOfInjuries],
        ["Total Hours Worked", totalHoursWorked.toLocaleString()],
        ["Calculated LTIR", calculatedLtir.toFixed(2)],
      ],
    });

    let finalY = doc.lastAutoTable.finalY + 10;

    const addSection = (title: string, content: string) => {
      doc.setFontSize(12);
      doc.text(title, 14, finalY);
      finalY += 6;
      doc.setFontSize(10);
      const splitContent = doc.splitTextToSize(content, 180);
      doc.text(splitContent, 14, finalY);
      finalY += splitContent.length * 5 + 10;
    };

    addSection("Trend Analysis", result.trendAnalysis);
    addSection("Improvement Areas", result.improvementAreas);
    addSection("Recommendations", result.recommendations);

    doc.save("LTIR_Analysis_Report.pdf");
  };

  const handleSave = async () => {
    if (!user || !result || calculatedLtir === null) {
      toast({
        variant: "destructive",
        title: "Cannot Save",
        description: "User not logged in or no report generated.",
      });
      return;
    }
    setIsSaving(true);
    const response = await saveLtirReportAction({
      userId: user.uid,
      calculatedLtir,
      formValues: form.getValues() as AnalyzeLtirTrendInput,
      analysisResult: result,
    });
    setIsSaving(false);

    if (response.success) {
      toast({
        title: "Report Saved",
        description:
          "The LTIR report has been saved and will appear in Generated Documents.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: (response as { success: false; error: string }).error,
      });
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Input Card */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>LTIR Calculator & Analysis</CardTitle>
          <CardDescription>
            Calculate your Lost Time Injury Rate and get AI-driven analysis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="numberOfInjuries"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lost Time Injuries (LTI)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="totalHoursWorked"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Hours Worked</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* LTIR Result */}
              <Card className="bg-muted/50 text-center">
                <CardHeader className="pb-2">
                  <CardDescription>Calculated LTIR</CardDescription>
                  <CardTitle className="text-4xl">
                    {calculatedLtir !== null
                      ? calculatedLtir.toFixed(2)
                      : "N/A"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground pb-4">
                  (LTI × 200,000) ÷ Hours Worked
                </CardContent>
              </Card>

              {/* Context Input */}
              <FormField
                control={form.control}
                name="additionalContext"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data & Context for AI Analysis</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide historical data or context. E.g., 'Q1: 2 LTI, 300k hours; Q2: 1 LTI, 320k hours. Implemented new training in Q2.'"
                        {...field}
                        rows={6}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Analyzing..." : "Generate AI Analysis"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Result Card */}
      <div className="lg:col-span-3">
        <Card className="min-h-[600px] sticky top-20">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Analysis Result</CardTitle>
              <CardDescription>
                Review the AI-generated analysis below.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {result && <CopyButton textToCopy={fullTextResult} />}
              {result && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving || !user}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadReport}
                  >
                    <Download className="mr-2 h-4 w-4" /> Download
                  </Button>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && <LoadingDots />}
            {result && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">Trend Analysis</h3>
                  <pre className="mt-2 whitespace-pre-wrap rounded-md bg-secondary p-4 font-sans text-sm text-secondary-foreground">
                    {result.trendAnalysis}
                  </pre>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold text-lg">Improvement Areas</h3>
                  <pre className="mt-2 whitespace-pre-wrap rounded-md bg-secondary p-4 font-sans text-sm text-secondary-foreground">
                    {result.improvementAreas}
                  </pre>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold text-lg">Recommendations</h3>
                  <pre className="mt-2 whitespace-pre-wrap rounded-md bg-secondary p-4 font-sans text-sm text-secondary-foreground">
                    {result.recommendations}
                  </pre>
                </div>
              </div>
            )}
            {!isLoading && !result && (
              <div className="flex h-[400px] items-center justify-center rounded-md border border-dashed">
                <p className="text-muted-foreground">
                  Your analysis will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
