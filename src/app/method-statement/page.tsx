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
import { Download } from "lucide-react";

const formSchema = z.object({
  clientCompanyId: z.string().min(1, "Client Company ID is required."),
  taskDescription: z.string().min(20, {
    message: "Task description must be at least 20 characters.",
  }),
});

export default function MethodStatementPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateMethodStatementOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientCompanyId: "",
      taskDescription: "",
    },
  });

  const clientCompanyId = form.watch("clientCompanyId");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    const response = await generateMethodStatementAction(values);
    setIsLoading(false);

    if (response.success && response.data) {
      setResult(response.data);
      toast({
        title: "Success",
        description: "Method Statement generated successfully. You can now download it as a PDF.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: response.error,
      });
    }
  }

  const handleDownloadPdf = () => {
    if (!result || !clientCompanyId) return;
    const doc = new jsPDF();
    
    doc.text("Method Statement", 10, 10);
    doc.text(`Client Company ID: ${clientCompanyId}`, 10, 20);
    doc.text("---", 10, 25)

    const splitText = doc.splitTextToSize(result.methodStatement, 180);
    doc.text(splitText, 10, 35);
    
    doc.save(`Method-Statement-${clientCompanyId}-${new Date().toISOString()}.pdf`);
  };

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
                name="taskDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Installation of HVAC system on the rooftop of the new mall, including crane lifting of units."
                        {...field}
                        rows={8}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
