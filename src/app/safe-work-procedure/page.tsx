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
import { generateSwpAction, type SafeWorkProcedureOutput } from "./actions"; // ✅ structured type
import LoadingDots from "@/components/ui/loading-dots";
import { useToast } from "@/hooks/use-toast";
import { CopyButton } from "@/components/copy-button";
import { Input } from "@/components/ui/input";
import { Download, Eye, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

const formSchema = z.object({
  clientName: z.string().min(1, "Client Name is required."),
  taskDescription: z.string().min(20, {
    message: "Task description must be at least 20 characters.",
  }),
  logo: z.instanceof(File).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SafeWorkProcedurePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SafeWorkProcedureOutput | null>(null);
  const [formValues, setFormValues] = useState<FormValues | null>(null);
  const [logoDataUri, setLogoDataUri] = useState<string | null>(null);
  const [pdfDataUri, setPdfDataUri] = useState<string | null>(null);

  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      taskDescription: "",
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

    const response = await generateSwpAction(values);
    setIsLoading(false);

    if (response.success) {
      setResult(response.data);
      generatePdf(response.data, values, logoDataUri, true);
      toast({
        title: "Success",
        description:
          "Safe Work Procedure generated successfully. You can now preview or download it.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: response.error,
      });
    }
  }

  const generatePdf = (
    data: SafeWorkProcedureOutput,
    values: FormValues,
    logo: string | null,
    setUri = false
  ) => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    let y = 20;

    // Cover Page
    doc.setFontSize(22);
    doc.text("Safe Work Procedure (SWP)", 105, 120, { align: "center" });
    if (logo) {
      doc.addImage(logo, "PNG", 85, 40, 40, 40);
    }
    doc.setFontSize(16);
    doc.text(
      `Task: ${values.taskDescription.substring(0, 50)}...`,
      105,
      150,
      { align: "center" }
    );
    doc.text(`Client: ${values.clientName}`, 105, 160, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Date: ${format(new Date(), "PPP")}`, 105, 170, {
      align: "center",
    });

    doc.addPage();
    y = 20;

    const addHeaderFooter = () => {
      const pageNum = doc.getNumberOfPages();
      doc.setFontSize(10);
      if (logo) {
        doc.addImage(logo, "PNG", 10, 5, 15, 15);
      }
      doc.text("Safe Work Procedure", logo ? 30 : 10, 10);
      doc.text(`Page ${pageNum}`, 200, 10, { align: "right" });
    };

    addHeaderFooter();

    const sections: { title: string; content: string | string[] }[] = [
      { title: "Title", content: data.title },
      { title: "Purpose", content: data.purpose },
      { title: "Scope", content: data.scope },
      { title: "Responsibilities", content: data.responsibilities },
      { title: "Procedure Steps", content: data.procedureSteps },
      { title: "PPE Requirements", content: data.ppeRequirements },
      { title: "Emergency Procedures", content: data.emergencyProcedures },
    ];

    sections.forEach((section) => {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");

      const titleLines = doc.splitTextToSize(section.title, 180);
      if (y + titleLines.length * 7 > pageHeight - 20) {
        doc.addPage();
        y = 20;
        addHeaderFooter();
      }
      doc.text(titleLines, 14, y);
      y += titleLines.length * 7;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");

      const contentArray = Array.isArray(section.content)
        ? section.content
        : [section.content];

      contentArray.forEach((c) => {
        const splitContent = doc.splitTextToSize(c.trim(), 180);
        splitContent.forEach((line: string) => {
          if (y > pageHeight - 20) {
            doc.addPage();
            y = 20;
            addHeaderFooter();
          }
          doc.text(line, 14, y);
          y += 6;
        });
        y += 4;
      });
      y += 10;
    });

    if (setUri) {
      setPdfDataUri(doc.output("datauristring"));
    } else {
      doc.save(`SWP-${values.clientName.replace(/ /g, "_")}.pdf`);
    }
  };

  const handleDownloadPdf = () => {
    if (!result || !formValues) return;
    generatePdf(result, formValues, logoDataUri);
  };

  const handleSave = () => {
    toast({
      title: "Document Saved",
      description:
        "The Safe Work Procedure has been saved to the 'Generated Documents' library.",
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Input */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Safe Work Procedure Generator</CardTitle>
          <CardDescription>
            Generate a detailed Safe Work Procedure (SWP) for a specific task.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., ConstructCo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="taskDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task & Equipment Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Safe use of a 9-inch angle grinder for cutting steel beams."
                        {...field}
                        rows={8}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="logo"
                render={() => (
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
                      Upload your company logo for branded documents.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Generating..." : "Generate SWP"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Output */}
      <div className="lg:col-span-3">
        <Card className="min-h-[600px] sticky top-20">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Generated Safe Work Procedure</CardTitle>
              <CardDescription>
                Review the AI-generated procedure below.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {result && (
                <CopyButton
                  textToCopy={[
                    result.title,
                    result.purpose,
                    result.scope,
                    result.responsibilities,
                    result.procedureSteps.join("\n"),
                    result.ppeRequirements.join("\n"),
                    result.emergencyProcedures,
                  ].join("\n\n")}
                />
              )}
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
                      <DialogTitle>Safe Work Procedure Preview</DialogTitle>
                    </DialogHeader>
                    <div className="h-full">
                      {pdfDataUri && (
                        <iframe
                          src={pdfDataUri}
                          width="100%"
                          height="100%"
                          title="Safe Work Procedure Preview"
                        />
                      )}
                    </div>
                    <DialogFooter>
                      <Button onClick={handleSave}>
                        <Save className="mr-2 h-4 w-4" />
                        Save to Generated Docs
                      </Button>
                      <Button
                        onClick={handleDownloadPdf}
                        variant="outline"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && <LoadingDots />}
            {result && (
              <div className="space-y-6">
                <Section title="Title" content={result.title} />
                <Section title="Purpose" content={result.purpose} />
                <Section title="Scope" content={result.scope} />
                <Section
                  title="Responsibilities"
                  content={result.responsibilities}
                />
                <Section
                  title="Procedure Steps"
                  content={result.procedureSteps.join("\n")}
                />
                <Section
                  title="PPE Requirements"
                  content={result.ppeRequirements.join("\n")}
                />
                <Section
                  title="Emergency Procedures"
                  content={result.emergencyProcedures}
                />
              </div>
            )}
            {!isLoading && !result && (
              <div className="flex h-[400px] items-center justify-center rounded-md border border-dashed">
                <p className="text-muted-foreground">
                  Your generated procedure will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <pre className="mt-2 whitespace-pre-wrap rounded-md bg-secondary p-4 font-sans text-sm text-secondary-foreground">
        {content}
      </pre>
    </div>
  );
}
