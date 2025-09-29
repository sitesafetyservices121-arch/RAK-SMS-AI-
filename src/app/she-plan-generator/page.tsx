
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
import { Download, Eye, Save } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

const formSchema = z.object({
  clientCompanyId: z.string().min(1, "Client Company ID is required."),
  logo: z.instanceof(File).optional(),
  projectDescription: z.string().min(20, {
    message: "Project description must be at least 20 characters.",
  }),
});

export default function ShePlanGeneratorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateShePlanOutput | null>(null);
  const [logoDataUri, setLogoDataUri] = useState<string | null>(null);
  const [pdfDataUri, setPdfDataUri] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientCompanyId: "",
      projectDescription: "",
    },
  });
  
  const clientCompanyId = form.watch("clientCompanyId");

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setLogoDataUri(e.target?.result as string);
      reader.readAsDataURL(file);
      form.setValue("logo", file);
    }
  };


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    setPdfDataUri(null);
    const response = await generateShePlanAction(values);
    setIsLoading(false);

    if (response.success && response.data) {
      setResult(response.data);
      generatePdf(response.data, values.clientCompanyId, logoDataUri, true);
       toast({
        title: "Success",
        description: "SHE Plan generated successfully. You can now preview or download it.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: response.error,
      });
    }
  }
  
  const fullTextResult = result ? Object.entries(result).map(([key, value]) => `## ${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}\n\n${value}`).join("\n\n") : "";
  
  const generatePdf = (data: GenerateShePlanOutput, clientId: string, logo: string | null, setUri = false) => {
    if (!data || !clientId) return;
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    let y = 20;

    // Title Page
    doc.setFontSize(22);
    doc.text("Safety, Health, and Environment (SHE) Plan", 105, 120, { align: "center" });
    if (logo) {
      doc.addImage(logo, "PNG", 85, 40, 40, 40);
    }
    doc.setFontSize(16);
    doc.text(`Client: ${clientId}`, 105, 140, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 105, 150, { align: "center" });

    doc.addPage();
    y = 20;

    const addHeaderFooter = () => {
        doc.setFontSize(10);
        if (logo) {
            doc.addImage(logo, 'PNG', 10, 5, 15, 15);
        }
        doc.text("SHE Plan", logo ? 30 : 10, 10);
        doc.text(`Page ${doc.getNumberOfPages() - 1}`, pageWidth - 10, 10, { align: "right" });
    };

    addHeaderFooter();

    const sections = [
      { title: "Introduction and Scope", content: data.introduction },
      { title: "Safety Policy", content: data.safetyPolicy },
      { title: "Objectives", content: data.objectives },
      { title: "Roles and Responsibilities", content: data.rolesAndResponsibilities },
      { title: "Risk Management", content: data.riskManagement },
      { title: "Safe Work Procedures", content: data.safeWorkProcedures },
      { title: "Emergency Procedures", content: data.emergencyProcedures },
      { title: "Training and Competency", content: data.trainingAndCompetency },
      { title: "Incident Reporting", content: data.incidentReporting },
      { title: "Monitoring and Review", content: data.monitoringAndReview },
    ];

    sections.forEach(section => {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        const titleLines = doc.splitTextToSize(section.title, 180);
        if (y + (titleLines.length * 5) > pageHeight - 20) {
            doc.addPage();
            y = 20;
            addHeaderFooter();
        }
        doc.text(titleLines, 14, y);
        y += (titleLines.length * 5) + 2;

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        const contentLines = doc.splitTextToSize(section.content, 180);
        
        contentLines.forEach((line: string) => {
            if (y > pageHeight - 20) {
                doc.addPage();
                y = 20;
                addHeaderFooter();
            }
            doc.text(line, 14, y);
            y += 5;
        });
        y += 10;
    });

    if (setUri) {
      setPdfDataUri(doc.output('datauristring'));
    } else {
      doc.save(`SHE-Plan-${clientCompanyId}-${new Date().toISOString()}.pdf`);
    }
  };

  const handleDownloadPdf = () => {
    if (!result || !clientCompanyId) return;
    generatePdf(result, clientCompanyId, logoDataUri);
  }

  const handleSave = () => {
    // In a real app, this would upload the generated PDF or its data to a server.
    toast({
        title: "Document Saved",
        description: "The SHE Plan has been saved to the 'Generated Documents' library."
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>SHE Plan Generator</CardTitle>
          <CardDescription>
            Generate a Safety, Health, and Environment (SHE) plan using AI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                name="logo"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Company Logo (Optional)</FormLabel>
                        <FormControl>
                            <Input 
                                type="file" 
                                accept="image/png, image/jpeg"
                                onChange={handleLogoChange}
                             />
                        </FormControl>
                         <FormDescription>
                            Upload the client's logo for branded documents.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
                />
              <FormField
                control={form.control}
                name="projectDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your project in detail, including scope, location, and specific activities..."
                        {...field}
                        rows={8}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Generating..." : "Generate SHE Plan"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="lg:col-span-3">
        <Card className="min-h-[600px] sticky top-20">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Generated SHE Plan</CardTitle>
              <CardDescription>
                Review the AI-generated plan below.
              </CardDescription>
            </div>
             <div className="flex items-center gap-2">
                {result && <CopyButton textToCopy={fullTextResult} />}
                {result && (
                  <Dialog>
                    <DialogTrigger asChild>
                       <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl h-[90vh]">
                        <DialogHeader>
                            <DialogTitle>SHE Plan Preview</DialogTitle>
                        </DialogHeader>
                        <div className="h-full">
                           {pdfDataUri && <iframe src={pdfDataUri} width="100%" height="100%" />}
                        </div>
                        <DialogFooter>
                            <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" />Save to Generated Docs</Button>
                            <Button onClick={handleDownloadPdf} variant="outline"><Download className="mr-2 h-4 w-4" />Download PDF</Button>
                        </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
                {result && (
                  <Button onClick={handleDownloadPdf} variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                )}
              </div>
          </CardHeader>
          <CardContent>
            {isLoading && <LoadingDots />}
            {result && (
              <div className="space-y-4 text-sm">
                {Object.entries(result).map(([key, value]) => (
                  <div key={key}>
                     <h3 className="font-semibold text-base">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h3>
                     <Separator className="my-1" />
                     <p className="whitespace-pre-wrap font-sans text-muted-foreground">{value}</p>
                  </div>
                ))}
              </div>
            )}
            {!isLoading && !result && (
              <div className="flex h-[400px] items-center justify-center rounded-md border border-dashed">
                <p className="text-muted-foreground">
                  Your generated plan will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    
