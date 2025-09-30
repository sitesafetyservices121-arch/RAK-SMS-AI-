
'use server';
/**
 * @fileOverview Generates a Safe Work Procedure from a text prompt describing the task.
 *
 * - generateSafeWorkProcedure - A function that generates the procedure.
 * - GenerateSafeWorkProcedureInput - The input type for the function.
 * - GenerateSafeWorkProcedureOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { retrieveSimilarChunksFlow } from './ai-document-indexer';

export const GenerateSafeWorkProcedureInputSchema = z.object({
  clientName: z.string().describe("The name of the client for whom the work is being done."),
  taskDescription: z
    .string()
    .describe('A detailed description of the task for which the Safe Work Procedure is required.'),
});
export type GenerateSafeWorkProcedureInput = z.infer<typeof GenerateSafeWorkProcedureInputSchema>;

export const GenerateSafeWorkProcedureOutputSchema = z.object({
  procedure: z.string().describe('The generated step-by-step Safe Work Procedure, formatted in markdown.'),
});
export type GenerateSafeWorkProcedureOutput = z.infer<typeof GenerateSafeWorkProcedureOutputSchema>;

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
  prompt: `You are an expert in creating Safe Work Procedures (SWP) for industrial and construction work in South Africa.

  Based on the task description provided for the client, generate a comprehensive, step-by-step Safe Work Procedure. The output should be a single block of markdown text, formatted professionally for a site-ready document.
  
  IMPORTANT: Prioritize information from any 'retrieved documents' provided. These are approved examples and templates from the company's knowledge base. Use them as a style and content guide to ensure the final document meets company standards.
  
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

  The procedure must include the following sections, formatted with markdown (e.g., ## for headings, * or - for list items):
  1.  **## Purpose:** The objective of the task.
  2.  **## Personal Protective Equipment (PPE):** A list of required PPE for this specific task.
  3.  **## Pre-operational Checks:** Steps to take before starting the work (e.g., inspect tools, check work area).
  4.  **## Step-by-Step Procedure:** The core safe execution steps, broken down into a clear, numbered or bulleted list.
  5.  **## Post-operational Checks:** Steps to perform after completing the task (e.g., cleanup, tool storage).
  6.  **## Emergency Procedures:** What to do in case of an emergency (e.g., injury, fire, spill).
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
