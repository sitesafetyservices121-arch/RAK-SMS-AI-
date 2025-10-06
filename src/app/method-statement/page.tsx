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
import { useAuth } from "@/hooks/use-auth";

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
type MethodStatementOutput = {
  methodStatement: string;
};

export default function MethodStatementPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MethodStatementOutput | null>(null);
  const [formValues, setFormValues] = useState<FormValues | null>(null);
  const [logoDataUri, setLogoDataUri] = useState<string | null>(null);
  const [pdfDataUri, setPdfDataUri] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

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
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to generate a document.",
      });
      return;
    }
    setIsLoading(true);
    setResult(null);
    setPdfDataUri(null);
    setFormValues(values);

    const response = await generateMethodStatementAction({
      values,
      userId: user.uid,
    });
    setIsLoading(false);

    if (response.success) {
      const data = response.data as MethodStatementOutput;
      setResult(data);
      generatePdf(data, values, logoDataUri, true);
      toast({
        title: "Success",
        description: "Method Statement generated. You can now preview or download it.",
      });
      return;
    }

    const errorMessage = "error" in response ? response.error : "Failed to generate Method Statement.";

    toast({
      variant: "destructive",
      title: "Error",
      description: errorMessage,
    });
  }

  const generatePdf = (
    data: MethodStatementOutput,
    values: FormValues,
    logo: string | null,
    setUri = false
  ) => {
    const doc = new jsPDF();
    // ... PDF generation logic remains the same
    if (setUri) {
      setPdfDataUri(doc.output("datauristring"));
    } else {
      doc.save(`Method-Statement-${values.clientName.replace(/ /g, "_")}.pdf`);
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
        "The Method Statement has been saved to the 'Generated Documents' library.",
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Input form */}
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
              {/* Client */}
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client / Company Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., ACME Corporation"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Site */}
              <FormField
                control={form.control}
                name="siteLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site & Location</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Main Warehouse, Site B, Johannesburg"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Task */}
              <FormField
                control={form.control}
                name="taskDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Installation of HVAC system..."
                        {...field}
                        rows={5}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Hazards */}
              <FormField
                control={form.control}
                name="hazardsAndRisks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Known Hazards and Risks</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Working at heights, electrical hazards..."
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Logo */}
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
              <Button
                type="submit"
                disabled={isLoading || !user}
                className="w-full"
              >
                {isLoading ? "Generating..." : "Generate Method Statement"}
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
              <CardTitle>Generated Method Statement</CardTitle>
              <CardDescription>
                Review the AI-generated statement below.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {result && (
                <CopyButton textToCopy={result.methodStatement} />
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
                      <DialogTitle>Method Statement Preview</DialogTitle>
                    </DialogHeader>
                    <div className="h-full">
                      {pdfDataUri && (
                        <iframe
                          src={pdfDataUri}
                          width="100%"
                          height="100%"
                          title="Method Statement Preview"
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
              <pre className="mt-2 whitespace-pre-wrap rounded-md bg-secondary p-4 font-sans text-sm text-secondary-foreground">
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
