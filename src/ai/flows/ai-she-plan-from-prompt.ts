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
  introduction: z.string().describe("Introduction and scope of the project."),
  safetyPolicy: z.string().describe("The company's commitment to safety."),
  objectives: z.string().describe("Specific, measurable safety objectives for the project."),
  rolesAndResponsibilities: z.string().describe("Roles and responsibilities for key personnel."),
  riskManagement: z.string().describe("Process for hazard identification, risk assessment, and control."),
  safeWorkProcedures: z.string().describe("Reference to key safe work procedures."),
  emergencyProcedures: z.string().describe("Plan for emergency situations."),
  trainingAndCompetency: z.string().describe("Details on required training and competency verification."),
  incidentReporting: z.string().describe("Procedure for reporting and investigating incidents."),
  monitoringAndReview: z.string().describe("How the SHE plan will be monitored and reviewed."),
});
export type GenerateShePlanOutput = z.infer<typeof GenerateShePlanOutputSchema>;

export async function generateShePlan(input: GenerateShePlanInput): Promise<GenerateShePlanOutput> {
  return generateShePlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateShePlanPrompt',
  input: {schema: GenerateShePlanInputSchema},
  output: {schema: GenerateShePlanOutputSchema},
  prompt: `You are an expert in creating professional Safety, Health, and Environment (SHE) plans for construction projects in South Africa.

  Based on the project description provided, generate a comprehensive SHE plan. The language should be formal and professional. Where relevant, reference sections of the South African OHS Act 85 of 1993.

  Generate detailed content for each of the following sections of the SHE Plan.

  Project Description: {{{projectDescription}}}

  Generate the output as a structured JSON object with the following keys.
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
