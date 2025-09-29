
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  clientName: z.string().min(1, "Client Name is required."),
  projectLocation: z.string().min(1, "Project/Site Location is required."),
  scopeOfWork: z.string().min(1, "Scope of Work is required."),
  employeeCount: z.string().min(1, "Number of employees is required."),
  hazards: z.string().min(1, "Please list expected hazards."),
  safetyPersonnel: z.string().min(1, "Appointed safety personnel are required."),
  emergencyContacts: z.string().min(1, "Emergency contacts are required."),
  projectDates: z.object({
      from: z.date({ required_error: "A start date is required."}),
      to: z.date({ required_error: "An end date is required."}),
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
      clientName: "",
      projectLocation: "",
      scopeOfWork: "",
      employeeCount: "",
      hazards: "",
      safetyPersonnel: "",
      emergencyContacts: "",
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

    const projectDescription = `
      Client Name: ${values.clientName}
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

    if (response.success && response.data) {
      setResult(response.data);
      generatePdf(response.data, values, logoDataUri, true);
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
  
  const generatePdf = (data: GenerateShePlanOutput, values: FormValues, logo: string | null, setUri = false) => {
    if (!data || !values) return;
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
    doc.text(`Client: ${values.clientName}`, 105, 140, { align: "center" });
    doc.text(`Project: ${values.projectLocation}`, 105, 150, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 105, 160, { align: "center" });

    doc.addPage();
    y = 20;

    const addHeaderFooter = () => {
        const pageNum = doc.getNumberOfPages() -1;
        doc.setFontSize(10);
        if (logo) {
            doc.addImage(logo, 'PNG', 10, 5, 15, 15);
        }
        doc.text("SHE Plan", logo ? 30 : 10, 10);
        doc.text(`Page ${pageNum}`, pageWidth - 10, 10, { align: "right" });
    };

    addHeaderFooter();

    const addSection = (title: string, content: string) => {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        const titleLines = doc.splitTextToSize(title, 180);
        if (y + (titleLines.length * 5) > pageHeight - 20) {
            doc.addPage();
            y = 20;
            addHeaderFooter();
        }
        doc.text(titleLines, 14, y);
        y += (titleLines.length * 5) + 2;

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        const contentLines = doc.splitTextToSize(content, 180);
        
        contentLines.forEach((line: string) => {
            if (y > pageHeight - 20) {
                doc.addPage();
                y = 20;
                addHeaderFooter();
            }
            doc.text(line, 14, y);
            y += 6; // Increased spacing
        });
        y += 10;
    };
    
    // Project Details Section
    const projectDetailsContent = `
Client Name: ${values.clientName}
Project Location: ${values.projectLocation}
Scope of Work: ${values.scopeOfWork}
Number of Employees/Contractors: ${values.employeeCount}
Expected Hazards: ${values.hazards}
Appointed Safety Personnel: ${values.safetyPersonnel}
Emergency Contacts: ${values.emergencyContacts}
Project Dates: ${format(values.projectDates.from, "PPP")} to ${format(values.projectDates.to, "PPP")}
    `;
    addSection("Project Details", projectDetailsContent);


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
        addSection(section.title, section.content);
    });

    if (setUri) {
      setPdfDataUri(doc.output('datauristring'));
    } else {
      doc.save(`SHE-Plan-${values.clientName}-${new Date().toISOString()}.pdf`);
    }
  };

  const handleDownloadPdf = () => {
    if (!result || !formValues) return;
    generatePdf(result, formValues, logoDataUri);
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
            Provide project details to generate a comprehensive SHE plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField name="clientName" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Client Name</FormLabel><FormControl><Input placeholder="e.g., Mittal, Sasol, Omnia" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="projectLocation" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Project / Site Location</FormLabel><FormControl><Input placeholder="e.g., Secunda, Sasolburg" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
               <FormField name="scopeOfWork" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Scope of Work</FormLabel><FormControl><Input placeholder="e.g., Construction, Maintenance, Logistics" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="employeeCount" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Number of employees + contractors</FormLabel><FormControl><Input type="number" placeholder="e.g., 50" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="hazards" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Types of hazards expected</FormLabel><FormControl><Textarea placeholder="e.g., Chemicals, working at heights, machinery, traffic" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="safetyPersonnel" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Appointed Safety Officer & Supervisors</FormLabel><FormControl><Input placeholder="e.g., John Doe (Officer), Jane Smith (Supervisor)" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="emergencyContacts" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Emergency contacts</FormLabel><FormControl><Textarea placeholder="e.g., Nearest Hospital: 123-456-7890, Fire Dept: 911" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
               <FormField control={form.control} name="projectDates" render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Project Start & End Dates</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value?.from && "text-muted-foreground"
                          )}
                        >
                          {field.value?.from ? (
                            field.value.to ? (
                              <>
                                {format(field.value.from, "PPP")} -{" "}
                                {format(field.value.to, "PPP")}
                              </>
                            ) : (
                              format(field.value.from, "PPP")
                            )
                          ) : (
                            <span>Pick a date range</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={{ from: field.value?.from!, to: field.value?.to }}
                        onSelect={(range) => field.onChange({ from: range?.from!, to: range?.to })}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )} />

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
                           {pdfDataUri && <iframe src={pdfDataUri} width="100%" height="100%" title="SHE Plan Preview" />}
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

    
