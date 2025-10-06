'use server';
/**
 * @fileOverview A flow for listing available generative models.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import fetch from 'node-fetch';

interface GoogleAIModel {
  name: string;
  description?: string;
  inputTokenLimit?: number;
  outputTokenLimit?: number;
  supportedGenerationMethods: string[];
}

export const ModelInfoSchema = z.object({
  name: z.string(),
  description: z.string(),
  inputTokenLimit: z.number(),
  outputTokenLimit: z.number(),
});

export type ModelInfo = z.infer<typeof ModelInfoSchema>;

const ListModelsOutputSchema = z.object({
  models: z.array(ModelInfoSchema),
});

export async function listModels(): Promise<z.infer<typeof ListModelsOutputSchema>> {
  return listModelsFlow();
}

const listModelsFlow = ai.defineFlow(
  {
    name: 'listModelsFlow',
    inputSchema: z.void(),
    outputSchema: ListModelsOutputSchema,
  },
  async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    const { models } = (await res.json()) as { models: GoogleAIModel[] };
    const generationModels = models.filter(
      (m) =>
        m.supportedGenerationMethods.includes("generateContent") &&
        m.name.includes("gemini")
    );
    return {
      models: generationModels.map((m) => ({
        name: m.name,
        description: m.description || "No description available.",
        inputTokenLimit: m.inputTokenLimit || 0,
        outputTokenLimit: m.outputTokenLimit || 0,
      })),
    };
  }
);