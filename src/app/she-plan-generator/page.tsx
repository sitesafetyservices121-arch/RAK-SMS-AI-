"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { GenerateShePlanOutput } from "@/ai/flows/ai-she-plan-from-prompt";
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
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { generateShePlanAction } from "./actions";
import LoadingDots from "@/components/ui/loading-dots";
import { useToast } from "@/hooks/use-toast";
import { CopyButton } from "@/components/copy-button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { Download } from "lucide-react";

const formSchema = z.object({
  projectDescription: z
    .string()
    .min(20, "Please provide a more detailed project description."),
});

type FormValues = z.infer<typeof formSchema>;

export default function ShePlanGeneratorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateShePlanOutput | null>(null);
  const [logoDataUri, setLogoDataUri] = useState<string | null>(null);
  const [generatedDocument, setGeneratedDocument] = useState<
    { fileName: string; downloadUrl: string; storagePath: string } | null
  >(null);
  const { toast } = useToast();
  const { user } = useAuth(); // Get authenticated user

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { projectDescription: "" },
  });

  async function onSubmit(values: FormValues) {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to generate a SHE plan.",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);
    setGeneratedDocument(null);
    const response = await generateShePlanAction({
      values,
      userId: user.uid,
      companyId: user.companyId,
      companyName: user.companyName,
      logoDataUri: logoDataUri || undefined,
    });
    setIsLoading(false);

    if (response.success) {
      setResult(response.data);
      setGeneratedDocument({
        fileName: response.fileName,
        downloadUrl: response.downloadUrl,
        storagePath: response.storagePath,
      });
      toast({
        title: "SHE Plan Generated",
        description: `Word document stored at ${response.storagePath}.`,
      });
      return;
    }

    const errorMessage = "error" in response ? response.error : "Failed to generate SHE Plan.";

    toast({
      variant: "destructive",
      title: "Error",
      description: errorMessage,
    });
  }

  const fullTextResult = result
    ? Object.entries(result)
        .map(
          ([key, value]) =>
            `${key
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase())}:\n${value}`
        )
        .join("\n\n")
    : "";

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>SHE Plan Generator</CardTitle>
          <CardDescription>
            Generate a comprehensive Safety, Health, and Environment (SHE) plan
            from a simple project description.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="projectDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Construction of a double-story residential house in Sandton, including foundation, brickwork, roofing, and electrical installation."
                        {...field}
                        rows={10}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <FormLabel htmlFor="logo-upload">Company Logo (Optional)</FormLabel>
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) =>
                        setLogoDataUri(e.target?.result as string);
                      reader.readAsDataURL(file);
                    } else {
                      setLogoDataUri(null);
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Uploaded logos are embedded into the ISO-compliant SHE plan.
                </p>
              </div>
              <Button
                type="submit"
                disabled={isLoading || !user}
                className="w-full"
              >
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
              {generatedDocument && (
                <Button asChild variant="outline" size="sm">
                  <a
                    href={generatedDocument.downloadUrl}
                    download={generatedDocument.fileName}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Word Document
                  </a>
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
                    <h3 className="font-semibold text-base">
                      {key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}
                    </h3>
                    <Separator className="my-1" />
                    <p className="whitespace-pre-wrap text-muted-foreground">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            )}
            {!isLoading && !result && (
              <div className="flex h-64 items-center justify-center rounded-md border border-dashed">
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
