
'use server';
/**
 * @fileOverview Generates a Safe Work Procedure from a text prompt describing the task.
 *
 * - generateSafeWorkProcedure - A function that generates the procedure.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { retrieveSimilarChunksFlow } from './ai-document-indexer';

const GenerateSafeWorkProcedureInputSchema = z.object({
  clientName: z.string().describe("The name of the client for whom the work is being done."),
  taskDescription: z
    .string()
    .describe('A detailed description of the task for which the Safe Work Procedure is required.'),
});
type GenerateSafeWorkProcedureInput = z.infer<typeof GenerateSafeWorkProcedureInputSchema>;

const GenerateSafeWorkProcedureOutputSchema = z.object({
  procedure: z.string().describe('The generated step-by-step Safe Work Procedure, formatted in markdown.'),
});
type GenerateSafeWorkProcedureOutput = z.infer<typeof GenerateSafeWorkProcedureOutputSchema>;

export async function generateSafeWorkProcedure(input: GenerateSafeWorkProcedureInput): Promise<GenerateSafeWorkProcedureOutput> {
  return generateSafeWorkProcedureFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSafeWorkProcedurePrompt',
  input: {schema: z.object({
      clientName: z.string(),
      taskDescription: z.string(),
      retrievedDocuments: z.array(z.string()).optional(),
  })},
  output: {schema: GenerateSafeWorkProcedureOutputSchema},
  prompt: `You are an expert in creating Safe Work Procedures (SWP) for industrial and construction work in South Africa. An SWP focuses specifically on the safe use of tools and equipment for a particular task.

  Based on the task description provided for the client, generate a comprehensive, step-by-step Safe Work Procedure. The output should be a single block of markdown text, formatted professionally for a site-ready document.
  
  IMPORTANT: Prioritize information from any 'retrieved documents' provided. These are approved examples from the company's knowledge base. Use them as a style and content guide.

  {{#if retrievedDocuments}}
  Here are some reference documents from the knowledge base. Use these as your primary guide:
  ---
  {{#each retrievedDocuments}}
  {{this}}
  ---
  {{/each}}
  {{/if}}

  Client: {{{clientName}}}
  Task Description: {{{taskDescription}}}

  The procedure must include the following sections, with a strong focus on the tools and equipment involved. Format with markdown (e.g., ## for headings, * or - for list items):
  1.  **## Purpose:** The objective of the task.
  2.  **## Tools & Equipment:** List all tools and equipment required.
  3.  **## Personal Protective Equipment (PPE):** List required PPE, specific to the tools being used.
  4.  **## Pre-operational Checks:** Detail the inspection steps for the tools and equipment before use. Check the work area for related hazards.
  5.  **## Step-by-Step Procedure:** The core safe execution steps, detailing how to operate the tools/equipment safely from start to finish.
  6.  **## Post-operational Checks:** Steps for safely powering down, cleaning, and storing tools and equipment.
  7.  **## Emergency Procedures:** What to do in case of an emergency related to tool/equipment failure or misuse (e.g., injury, fire).
  `,
});

const generateSafeWorkProcedureFlow = ai.defineFlow(
  {
    name: 'generateSafeWorkProcedureFlow',
    inputSchema: GenerateSafeWorkProcedureInputSchema,
    outputSchema: GenerateSafeWorkProcedureOutputSchema,
  },
  async input => {
    const retrievedDocuments = await retrieveSimilarChunksFlow(input.taskDescription);
    const {output} = await prompt({...input, retrievedDocuments});
    return output!;
  }
);
