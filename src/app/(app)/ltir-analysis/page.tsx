"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
import { analyzeLtirAction } from "./actions";
import type { AnalyzeLtirTrendOutput } from "@/ai/flows/ai-ltir-trend-analysis";
import LoadingDots from "@/components/ui/loading-dots";
import { useToast } from "@/hooks/use-toast";
import { CopyButton } from "@/components/copy-button";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  ltirData: z.string().min(20, {
    message: "LTIR data must be at least 20 characters.",
  }),
  additionalContext: z.string().optional(),
});

export default function LtirAnalysisPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeLtirTrendOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ltirData: "",
      additionalContext: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    const response = await analyzeLtirAction(values);
    setIsLoading(false);

    if (response.success && response.data) {
      setResult(response.data);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: response.error,
      });
    }
  }

  const fullTextResult = result ? `Trend Analysis:\n${result.trendAnalysis}\n\nImprovement Areas:\n${result.improvementAreas}\n\nRecommendations:\n${result.recommendations}` : "";

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>LTIR Trend Analysis</CardTitle>
          <CardDescription>
            Analyze Lost Time Injury Rate (LTIR) data with AI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="ltirData"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LTIR Data</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste historical LTIR data here, preferably in CSV format (e.g., Date,Injuries,HoursWorked)."
                        {...field}
                        rows={10}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="additionalContext"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Context (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Change in safety policies in Q2, new machinery introduced, etc."
                        {...field}
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Analyzing..." : "Analyze Data"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="lg:col-span-3">
        <Card className="min-h-[600px] sticky top-20">
          <CardHeader>
            <CardTitle>Analysis Result</CardTitle>
            <CardDescription>
              Review the AI-generated analysis below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && <LoadingDots />}
            {result && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <CopyButton textToCopy={fullTextResult} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Trend Analysis</h3>
                  <pre className="mt-2 w-full whitespace-pre-wrap rounded-md bg-secondary p-4 font-sans text-sm text-secondary-foreground">
                    {result.trendAnalysis}
                  </pre>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold text-lg">Improvement Areas</h3>
                  <pre className="mt-2 w-full whitespace-pre-wrap rounded-md bg-secondary p-4 font-sans text-sm text-secondary-foreground">
                    {result.improvementAreas}
                  </pre>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold text-lg">Recommendations</h3>
                  <pre className="mt-2 w-full whitespace-pre-wrap rounded-md bg-secondary p-4 font-sans text-sm text-secondary-foreground">
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
