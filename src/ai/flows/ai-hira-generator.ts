
// src/ai/flows/ai-hira-generator.ts
'use server';

/**
 * @fileOverview AI-powered Hazard Identification and Risk Assessment (HIRA) generator.
 *
 * - generateHira - A function that generates a HIRA report based on project details.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { retrieveSimilarChunksFlow } from './ai-document-indexer';

const HiraInputSchema = z.object({
  projectDetails: z
    .string()
    .describe('Detailed information about the project, activity, and specific hazard.'),
  regulatoryRequirements: z
    .string()
    .describe('Applicable regulatory requirements and industry standards, e.g., OHS Act & Construction Regulations.'),
});
type HiraInput = z.infer<typeof HiraInputSchema>;

const HiraOutputSchema = z.object({
  controlMeasures: z
    .string()
    .describe('Recommended additional control measures to mitigate the identified hazard, based on South African regulations.'),
});
type HiraOutput = z.infer<typeof HiraOutputSchema>;

export async function generateHira(input: HiraInput): Promise<HiraOutput> {
  return generateHiraFlow(input);
}

const hiraPrompt = ai.definePrompt({
  name: 'hiraPrompt',
  input: {schema: z.object({
      projectDetails: z.string(),
      regulatoryRequirements: z.string(),
      retrievedDocuments: z.array(z.string()).optional(),
  })},
  output: {schema: HiraOutputSchema},
  prompt: `You are an AI-powered safety expert specializing in providing control measures for Hazard Identification and Risk Assessment (HIRA) based on South African law.

  Your primary goal is to suggest additional control measures for a specific hazard within a project context. Use the provided details and your knowledge of the OHS Act and Construction Regulations.

  IMPORTANT: Prioritize information from any 'retrieved documents' provided. These are approved examples from the company's knowledge base. Use them as a style and content guide.

  {{#if retrievedDocuments}}
  Here are some reference documents from the knowledge base. Use these as your primary guide:
  ---
  {{#each retrievedDocuments}}
  {{this}}
  ---
  {{/each}}
  {{/if}}

  Context: {{{projectDetails}}}
  Applicable Regulations: {{{regulatoryRequirements}}}

  Based on this, provide a concise list of ADDITIONAL control measures. Do not repeat the existing controls mentioned in the context. Focus only on what else can be done to mitigate the risk.
  `,
});

const generateHiraFlow = ai.defineFlow(
  {
    name: 'generateHiraFlow',
    inputSchema: HiraInputSchema,
    outputSchema: HiraOutputSchema,
  },
  async input => {
    const retrievedDocuments = await retrieveSimilarChunksFlow(input.projectDetails);
    const {output} = await hiraPrompt({...input, retrievedDocuments});
    return output!;
  }
);
