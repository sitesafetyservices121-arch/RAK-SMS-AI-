
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
import { generateHiraAction } from "./actions";
import LoadingDots from "@/components/ui/loading-dots";
import { useToast } from "@/hooks/use-toast";
import { CopyButton } from "@/components/copy-button";
import { useAuth } from "@/hooks/use-auth";

const formSchema = z.object({
  projectDetails: z.string().min(20, "Please provide more project details."),
  regulatoryRequirements: z.string().min(1, "Regulations are required."),
});

type FormValues = z.infer<typeof formSchema>;
type HiraResult = { controlMeasures: string };

export default function HiraGeneratorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<HiraResult | null>(null);
  const { toast } = useToast();
  const { user } = useAuth(); // Get authenticated user

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectDetails: "",
      regulatoryRequirements: "OHS Act & Construction Regulations",
    },
  });

  async function onSubmit(values: FormValues) {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to generate a HIRA.",
      });
      return;
    }
    setIsLoading(true);
    setResult(null);
    const response = await generateHiraAction({ values, userId: user.uid });
    setIsLoading(false);

    if (response.success) {
      setResult(response.data as HiraResult);
      toast({
        title: "HIRA Controls Generated",
        description: `Please review the suggested measures.`,
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
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>HIRA Assistant</CardTitle>
          <CardDescription>
            Generate additional control measures for a specific hazard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="projectDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project & Hazard Details</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the activity, hazard, and existing controls. e.g., 'Task: Bricklaying on a 2-story building. Hazard: Falling objects from height. Existing controls: Hard hat area.'"
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
                name="regulatoryRequirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Applicable Regulations</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., OHS Act & Construction Regulations"
                        {...field}
                        rows={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={isLoading || !user}
                className="w-full"
              >
                {isLoading ? <LoadingDots/> : "Generate Control Measures"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="lg:col-span-3">
        <Card className="min-h-[500px] sticky top-20">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>AI-Suggested Control Measures</CardTitle>
              <CardDescription>
                Additional controls based on your input and SA law.
              </CardDescription>
            </div>
            {result && <CopyButton textToCopy={result.controlMeasures} />}
          </CardHeader>
          <CardContent>
            {isLoading && <LoadingDots />}
            {result && (
              <pre className="mt-2 whitespace-pre-wrap rounded-md bg-secondary p-4 font-sans text-sm text-secondary-foreground">
                {result.controlMeasures}
              </pre>
            )}
            {!isLoading && !result && (
              <div className="flex h-64 items-center justify-center rounded-md border border-dashed">
                <p className="text-muted-foreground">
                  Your generated measures will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
