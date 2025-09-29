"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import jsPDF from "jspdf";

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
} from "@/components/ui/card";
import { generateHiraAction } from "./actions";
import type { HiraOutput } from "@/ai/flows/ai-hira-generator";
import LoadingDots from "@/components/ui/loading-dots";
import { useToast } from "@/hooks/use-toast";
import { CopyButton } from "@/components/copy-button";
import { Separator } from "@/components/ui/separator";
import { Download } from "lucide-react";

const formSchema = z.object({
  clientCompanyId: z.string().min(1, "Client Company ID is required."),
  projectDetails: z.string().min(20, {
    message: "Project details must be at least 20 characters.",
  }),
  regulatoryRequirements: z.string().min(10, {
    message: "Regulatory requirements must be at least 10 characters.",
  }),
  existingSafetyData: z.string().optional(),
});

export default function HiraGeneratorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<HiraOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientCompanyId: "",
      projectDetails: "",
      regulatoryRequirements: "",
      existingSafetyData: "",
    },
  });
  
  const clientCompanyId = form.watch("clientCompanyId");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    const response = await generateHiraAction(values);
    setIsLoading(false);

    if (response.success && response.data) {
      setResult(response.data);
      toast({
        title: "Success",
        description: "HIRA generated successfully. You can now download it as a PDF.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: response.error,
      });
    }
  }
  
  const fullTextResult = result ? `Hazard Identification:\n${result.hazardIdentification}\n\nRisk Assessment:\n${result.riskAssessment}\n\nControl Measures:\n${result.controlMeasures}` : "";

  const handleDownloadPdf = () => {
    if (!result || !clientCompanyId) return;
    const doc = new jsPDF();
    
    doc.text("HIRA Report", 10, 10);
    doc.text(`Client Company ID: ${clientCompanyId}`, 10, 20);
    doc.text("---", 10, 25)

    const splitTitle = doc.splitTextToSize(`Hazard Identification:\n${result.hazardIdentification}\n\nRisk Assessment:\n${result.riskAssessment}\n\nControl Measures:\n${result.controlMeasures}`, 180);
    doc.text(splitTitle, 10, 35);
    
    doc.save(`HIRA-Report-${clientCompanyId}-${new Date().toISOString()}.pdf`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>HIRA Generator</CardTitle>
          <CardDescription>
            Generate a Hazard Identification and Risk Assessment using AI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="clientCompanyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Company ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., CLIENT-001"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="projectDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Details</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Construction of a 10-story office building in Sandton, including excavation and crane operations."
                        {...field}
                        rows={5}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="regulatoryRequirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Regulatory Requirements</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., OHS Act 85 of 1993, Construction Regulations 2014"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="existingSafetyData"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Existing Safety Data (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Previous incident reports, near-miss data..."
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Generating..." : "Generate HIRA"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="lg:col-span-3">
        <Card className="min-h-[600px] sticky top-20">
          <CardHeader>
             <div className="flex justify-between items-center">
              <div>
                <CardTitle>Generated HIRA</CardTitle>
                <CardDescription>
                  Review the AI-generated assessment below.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {result && <CopyButton textToCopy={fullTextResult} />}
                {result && (
                  <Button onClick={handleDownloadPdf} variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && <LoadingDots />}
            {result && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">Hazard Identification</h3>
                  <pre className="mt-2 w-full whitespace-pre-wrap rounded-md bg-secondary p-4 font-sans text-sm text-secondary-foreground">
                    {result.hazardIdentification}
                  </pre>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold text-lg">Risk Assessment</h3>
                  <pre className="mt-2 w-full whitespace-pre-wrap rounded-md bg-secondary p-4 font-sans text-sm text-secondary-foreground">
                    {result.riskAssessment}
                  </pre>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold text-lg">Control Measures</h3>
                  <pre className="mt-2 w-full whitespace-pre-wrap rounded-md bg-secondary p-4 font-sans text-sm text-secondary-foreground">
                    {result.controlMeasures}
                  </pre>
                </div>
              </div>
            )}
            {!isLoading && !result && (
              <div className="flex h-[400px] items-center justify-center rounded-md border border-dashed">
                <p className="text-muted-foreground">
                  Your generated assessment will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
