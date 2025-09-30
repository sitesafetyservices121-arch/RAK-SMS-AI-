
'use server';
/**
 * @fileOverview A flow for listing available generative models.
 */

import { ai } from '@/ai/genkit';
import { listModels as listGenkitModels } from 'genkit/ai';
import { z } from 'genkit';

const ModelInfoSchema = z.object({
  name: z.string(),
  description: z.string(),
  inputTokenLimit: z.number(),
  outputTokenLimit: z.number(),
});

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
    const models = await listGenkitModels();
    const generationModels = models.filter(
      (m) => m.supports.generate && m.name.startsWith('googleai/gemini')
    );
    return {
      models: generationModels.map((m) => ({
        name: m.name,
        description: m.info?.description || 'No description available.',
        inputTokenLimit: m.info?.inputTokenLimit || 0,
        outputTokenLimit: m.info?.outputTokenLimit || 0,
      })),
    };
  }
);
