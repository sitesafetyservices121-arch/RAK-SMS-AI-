
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import jsPDF from "jspdf";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { generateMethodStatementAction } from "./actions";
import type { GenerateMethodStatementOutput } from "@/ai/flows/ai-method-statement-generator";
import LoadingDots from "@/components/ui/loading-dots";
import { useToast } from "@/hooks/use-toast";
import { CopyButton } from "@/components/copy-button";
import { Input } from "@/components/ui/input";
import { Download, Eye, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

const formSchema = z.object({
  clientName: z.string().min(1, "Client Name is required."),
  siteLocation: z.string().min(1, "Site Location is required."),
  taskDescription: z.string().min(20, {
    message: "Task description must be at least 20 characters.",
  }),
  hazardsAndRisks: z.string().min(1, "Please list known hazards and risks."),
  logo: z.instanceof(File).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function MethodStatementPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateMethodStatementOutput | null>(null);
  const [formValues, setFormValues] = useState<FormValues | null>(null);
  const [logoDataUri, setLogoDataUri] = useState<string | null>(null);
  const [pdfDataUri, setPdfDataUri] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      siteLocation: "",
      taskDescription: "",
      hazardsAndRisks: "",
    },
  });
  
  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setLogoDataUri(e.target?.result as string);
      reader.readAsDataURL(file);
      form.setValue("logo", file);
    }
  };


  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setResult(null);
    setPdfDataUri(null);
    setFormValues(values);

    const response = await generateMethodStatementAction(values);
    setIsLoading(false);

    if (response.success && response.data) {
      setResult(response.data);
      generatePdf(response.data, values, logoDataUri, true);
      toast({
        title: "Success",
        description: "Method Statement generated. You can now preview or download it.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: response.error,
      });
    }
  }

  const generatePdf = (data: GenerateMethodStatementOutput, values: FormValues, logo: string | null, setUri = false) => {
    if (!data || !values) return;
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    let y = 20;

    // Cover Page
    doc.setFontSize(22);
    doc.text("Method Statement", 105, 120, { align: "center" });
    if (logo) {
      doc.addImage(logo, "PNG", 85, 40, 40, 40);
    }
    doc.setFontSize(16);
    doc.text(`Project: ${values.taskDescription.substring(0, 50)}...`, 105, 150, { align: "center" });
    doc.text(`Client: ${values.clientName}`, 105, 160, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Date: ${format(new Date(), "PPP")}`, 105, 170, { align: "center" });
    
    doc.addPage();
    y = 20;

    const addHeaderFooter = () => {
        const pageNum = doc.getNumberOfPages() -1;
        doc.setFontSize(10);
        if (logo) {
            doc.addImage(logo, 'PNG', 10, 5, 15, 15);
        }
        doc.text("Method Statement", logo ? 30 : 10, 10);
        doc.text(`Page ${pageNum}`, pageHeight - 10, 10, { align: "right" });
    };

    addHeaderFooter();

    const sections = data.methodStatement.split('## ').slice(1);
    
    sections.forEach(section => {
        const [title, ...contentLines] = section.split('\n');
        
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        
        const titleLines = doc.splitTextToSize(title.trim(), 180);
        if (y + (titleLines.length * 7) > pageHeight - 20) {
            doc.addPage();
            y = 20;
            addHeaderFooter();
        }
        doc.text(titleLines, 14, y);
        y += (titleLines.length * 7);

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        const content = contentLines.join('\n').trim();
        const splitContent = doc.splitTextToSize(content, 180);

        splitContent.forEach((line: string) => {
            if (y > pageHeight - 20) {
                doc.addPage();
                y = 20;
                addHeaderFooter();
            }
            doc.text(line, 14, y);
            y += 6;
        });
        y += 10;
    });


    if (setUri) {
      setPdfDataUri(doc.output('datauristring'));
    } else {
      doc.save(`Method-Statement-${values.clientName.replace(/ /g, '_')}.pdf`);
    }
  };

  const handleDownloadPdf = () => {
    if (!result || !formValues) return;
    generatePdf(result, formValues, logoDataUri);
  }

  const handleSave = () => {
    toast({
        title: "Document Saved",
        description: "The Method Statement has been saved to the 'Generated Documents' library."
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Method Statement Generator</CardTitle>
          <CardDescription>
            Generate a detailed Method Statement for a specific task.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
               <FormField control={form.control} name="clientName" render={({ field }) => (
                  <FormItem><FormLabel>Client / Company Name</FormLabel><FormControl><Input placeholder="e.g., ACME Corporation" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
               <FormField control={form.control} name="siteLocation" render={({ field }) => (
                  <FormItem><FormLabel>Site & Location</FormLabel><FormControl><Input placeholder="e.g., Main Warehouse, Site B, Johannesburg" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField
                control={form.control}
                name="taskDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Installation of HVAC system on the rooftop of the new mall, including crane lifting of units."
                        {...field}
                        rows={5}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField control={form.control} name="hazardsAndRisks" render={({ field }) => (
                  <FormItem><FormLabel>Known Hazards and Risks</FormLabel><FormControl><Textarea placeholder="e.g., Working at heights, electrical hazards, crane operation, public interface." {...field} rows={3}/></FormControl><FormMessage /></FormItem>
              )} />
               <FormField control={form.control} name="logo" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Company Logo (Optional)</FormLabel>
                        <FormControl>
                            <Input 
                                type="file" 
                                accept="image/png, image/jpeg"
                                onChange={handleLogoChange}
                             />
                        </FormControl>
                        <FormDescription>Upload your company logo for branded documents.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Generating..." : "Generate Method Statement"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="lg:col-span-3">
        <Card className="min-h-[600px] sticky top-20">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Generated Method Statement</CardTitle>
              <CardDescription>
                Review the AI-generated statement below.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {result && <CopyButton textToCopy={result.methodStatement} />}
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
                            <DialogTitle>Method Statement Preview</DialogTitle>
                        </DialogHeader>
                        <div className="h-full">
                           {pdfDataUri && <iframe src={pdfDataUri} width="100%" height="100%" title="Method Statement Preview" />}
                        </div>
                        <DialogFooter>
                            <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" />Save to Generated Docs</Button>
                            <Button onClick={handleDownloadPdf} variant="outline"><Download className="mr-2 h-4 w-4" />Download PDF</Button>
                        </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && <LoadingDots />}
            {result && (
              <pre className="mt-2 w-full whitespace-pre-wrap rounded-md bg-secondary p-4 font-sans text-sm text-secondary-foreground">
                {result.methodStatement}
              </pre>
            )}
            {!isLoading && !result && (
              <div className="flex h-[400px] items-center justify-center rounded-md border border-dashed">
                <p className="text-muted-foreground">
                  Your generated statement will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
