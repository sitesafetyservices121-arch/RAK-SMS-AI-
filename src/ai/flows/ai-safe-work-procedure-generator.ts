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

export const GenerateSafeWorkProcedureInputSchema = z.object({
  taskDescription: z
    .string()
    .describe('A detailed description of the task for which the Safe Work Procedure is required.'),
});
export type GenerateSafeWorkProcedureInput = z.infer<typeof GenerateSafeWorkProcedureInputSchema>;

export const GenerateSafeWorkProcedureOutputSchema = z.object({
  procedure: z.string().describe('The generated step-by-step Safe Work Procedure.'),
});
export type GenerateSafeWorkProcedureOutput = z.infer<typeof GenerateSafeWorkProcedureOutputSchema>;

export async function generateSafeWorkProcedure(input: GenerateSafeWorkProcedureInput): Promise<GenerateSafeWorkProcedureOutput> {
  return generateSafeWorkProcedureFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSafeWorkProcedurePrompt',
  input: {schema: GenerateSafeWorkProcedureInputSchema},
  output: {schema: GenerateSafeWorkProcedureOutputSchema},
  prompt: `You are an expert in creating Safe Work Procedures (SWP).

  Based on the task description provided, generate a comprehensive, step-by-step Safe Work Procedure.

  Include sections for:
  1.  **Purpose:** The objective of the task.
  2.  **Personal Protective Equipment (PPE):** Required PPE for the task.
  3.  **Pre-operational Checks:** Steps to take before starting.
  4.  **Step-by-Step Procedure:** The core safe execution steps.
  5.  **Post-operational Checks:** Steps after completing the task.
  6.  **Emergency Procedures:** What to do in case of an emergency.

  Task Description: {{{taskDescription}}}
  `,
});

const generateSafeWorkProcedureFlow = ai.defineFlow(
  {
    name: 'generateSafeWorkProcedureFlow',
    inputSchema: GenerateSafeWorkProcedureInputSchema,
    outputSchema: GenerateSafeWorkProcedureOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
