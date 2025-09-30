
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { listModels } from '@/ai/flows/ai-model-inspector';
import { useEffect, useState } from 'react';

type ModelInfo = {
  name: string;
  description: string;
  inputTokenLimit: number;
  outputTokenLimit: number;
};

export default function ModelInspectorPage() {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchModels() {
      try {
        setLoading(true);
        setError(null);
        const { models } = await listModels();
        setModels(models);
      } catch (e: any) {
        setError(e.message || 'Failed to fetch models.');
      } finally {
        setLoading(false);
      }
    }
    fetchModels();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Model Inspector</CardTitle>
        <CardDescription>
          A list of available generative models from the AI provider.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading models...</p>
        ) : error ? (
          <p className="text-destructive">{error}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model Name</TableHead>
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
  );
}
