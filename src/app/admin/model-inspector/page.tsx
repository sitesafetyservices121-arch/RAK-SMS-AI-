"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listModels, ModelInfo } from "@/ai/flows/ai-model-inspector";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ModelInspectorPage() {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchModels() {
      try {
        setLoading(true);
        setError(null);

        const result = await listModels();
        // ✅ Fix: unpack the array from { models: [...] }
        setModels(result?.models ?? []);
      } catch (err: unknown) {
        console.error(err);
        setError("Failed to fetch models. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchModels();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Model Inspector</CardTitle>
          <CardDescription>
            Explore available AI models and their capabilities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading models...</span>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="my-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!loading && !error && models.length === 0 && (
            <p className="text-muted-foreground">No models available.</p>
          )}

          {!loading && !error && models.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Input Token Limit</TableHead>
                  <TableHead>Output Token Limit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {models.map((model) => (
                  <TableRow key={model.name}>
                    <TableCell className="font-medium">{model.name}</TableCell>
                    <TableCell>{model.description}</TableCell>
                    <TableCell>{model.inputTokenLimit}</TableCell>
                    <TableCell>{model.outputTokenLimit}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
