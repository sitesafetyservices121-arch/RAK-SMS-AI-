'use server';
/**
 * @fileOverview Generates a SHE (Safety, Health, and Environment) plan from a text prompt describing the project.
 *
 * - generateShePlan - A function that generates the SHE plan.
 * - GenerateShePlanInput - The input type for the generateShePlan function.
 * - GenerateShePlanOutput - The return type for the generateShePlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateShePlanInputSchema = z.object({
  projectDescription: z
    .string()
    .describe('A detailed description of the project, including its scope, location, and specific requirements.'),
});
export type GenerateShePlanInput = z.infer<typeof GenerateShePlanInputSchema>;

const GenerateShePlanOutputSchema = z.object({
  shePlan: z.string().describe('The generated Safety, Health, and Environment plan.'),
});
export type GenerateShePlanOutput = z.infer<typeof GenerateShePlanOutputSchema>;

export async function generateShePlan(input: GenerateShePlanInput): Promise<GenerateShePlanOutput> {
  return generateShePlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateShePlanPrompt',
  input: {schema: GenerateShePlanInputSchema},
  output: {schema: GenerateShePlanOutputSchema},
  prompt: `You are an expert in creating Safety, Health, and Environment (SHE) plans.

  Based on the project description provided, generate a comprehensive SHE plan that addresses potential hazards and outlines safety measures.

  Project Description: {{{projectDescription}}}
  `,
});

const generateShePlanFlow = ai.defineFlow(
  {
    name: 'generateShePlanFlow',
    inputSchema: GenerateShePlanInputSchema,
    outputSchema: GenerateShePlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
