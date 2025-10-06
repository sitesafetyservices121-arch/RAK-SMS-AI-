
"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { generateSwpAction } from "./actions";
import { SafeWorkProcedureOutput } from "@/types/safe-work-procedure";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import LoadingDots from "@/components/ui/loading-dots";
import { useToast } from "@/hooks/use-toast";
import { CopyButton } from "@/components/copy-button";
import { FileText } from "lucide-react";

export default function SafeWorkProcedureTool() {
  const [clientName, setClientName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SafeWorkProcedureOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!clientName || !taskDescription) {
      setError("Client Name and Task Description are required.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    if (!user) {
      setError("User not authenticated.");
      setLoading(false);
      return;
    }

    try {
      const response = await generateSwpAction({
        values: { clientName, taskDescription },
        userId: user.uid,
      });

      if (response.success) {
        setResult(response.data);
        toast({ title: "Success", description: "Safe Work Procedure generated."});
      } else {
        setError(response.error);
        toast({ variant: "destructive", title: "Error", description: response.error });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      toast({ variant: "destructive", title: "Error", description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Safe Work Procedure Generator</CardTitle>
          <CardDescription>Create a detailed SWP for a specific task, focusing on tools and equipment.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="client-name">Client Name</Label>
              <Input
                id="client-name"
                type="text"
                placeholder="e.g., ConstructCo"
                className="w-full"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="task-description">Task Description</Label>
              <Textarea
                id="task-description"
                placeholder="e.g., Use of a 9-inch angle grinder to cut steel pipes on site."
                className="w-full h-32"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
              />
            </div>
            <Button
              onClick={handleGenerate}
              disabled={loading || !user}
              className="w-full"
            >
              {loading ? <LoadingDots /> : "Generate Procedure"}
            </Button>
             {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
          </div>
        </CardContent>
      </Card>
       <div className="lg:col-span-3">
        <Card className="min-h-[600px] sticky top-20">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Generated Procedure</CardTitle>
              <CardDescription>Review the AI-generated SWP.</CardDescription>
            </div>
            {result && <CopyButton textToCopy={result.procedure} />}
          </CardHeader>
          <CardContent>
            {loading && <LoadingDots />}
            {result && (
              <pre className="whitespace-pre-wrap mt-2 bg-secondary p-3 rounded-md font-sans text-sm">
                {result.procedure}
              </pre>
            )}
            {!loading && !result && (
              <div className="flex h-64 items-center justify-center rounded-md border border-dashed">
                 <div className="text-center text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-2" />
                    <p>Your generated procedure will appear here.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
