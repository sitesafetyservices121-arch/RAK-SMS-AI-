'use server';
/**
 * @fileOverview Generates a comprehensive Safety, Health, and Environment (SHE) Plan.
 *
 * - generateShePlan - A function that creates a SHE Plan from a project description.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {retrieveSimilarChunksFlow} from './ai-document-indexer';

const GenerateShePlanInputSchema = z.object({
  projectDescription: z
    .string()
    .describe('A detailed description of the project requiring the SHE Plan.'),
});
export type GenerateShePlanInput = z.infer<
  typeof GenerateShePlanInputSchema
>;

const GenerateShePlanOutputSchema = z.object({
  introduction: z.string().describe('Introduction to the SHE Plan.'),
  safetyPolicy: z.string().describe('The company safety policy statement.'),
  objectives: z.string().describe('Specific safety objectives for the project.'),
  rolesAndResponsibilities: z
    .string()
    .describe('Key roles and their safety responsibilities.'),
  riskManagement: z.string().describe('Overview of the risk management process.'),
  safeWorkProcedures: z
    .string()
    .describe('Mention of the need for specific safe work procedures.'),
  emergencyProcedures: z.string().describe('Plan for handling emergencies.'),
  trainingAndCompetency: z
    .string()
    .describe('Requirements for employee training.'),
  incidentReporting: z
    .string()
    .describe('Process for reporting incidents.'),
  monitoringAndReview: z
    .string()
    .describe('Plan for monitoring and reviewing safety performance.'),
});

export type GenerateShePlanOutput = z.infer<
  typeof GenerateShePlanOutputSchema
>;

export async function generateShePlan(
  input: GenerateShePlanInput
): Promise<GenerateShePlanOutput> {
  return generateShePlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateShePlanPrompt',
  input: {
    schema: z.object({
      projectDescription: z.string(),
      retrievedDocuments: z.array(z.string()).optional(),
    }),
  },
  output: {schema: GenerateShePlanOutputSchema},
  prompt: `You are an expert in creating Safety, Health, and Environment (SHE) Plans for the South African construction and industrial sectors. Your tone should be professional and authoritative.

  Based on the project description, generate a comprehensive SHE Plan. Each section should be a well-written paragraph.

  IMPORTANT: Prioritize information from any 'retrieved documents' provided. These are approved company templates or examples. Use them as a style and content guide to ensure the final document aligns with company standards.

  {{#if retrievedDocuments}}
  Here are some reference documents from the knowledge base. Use these as your primary guide:
  ---
  {{#each retrievedDocuments}}
  {{this}}
  ---
  {{/each}}
  {{/if}}

  Project Description: {{{projectDescription}}}

  Generate content for the following sections:
  - introduction
  - safetyPolicy
  - objectives
  - rolesAndResponsibilities
  - riskManagement
  - safeWorkProcedures
  - emergencyProcedures
  - trainingAndCompetency
  - incidentReporting
  - monitoringAndReview
  `,
});

const generateShePlanFlow = ai.defineFlow(
  {
    name: 'generateShePlanFlow',
    inputSchema: GenerateShePlanInputSchema,
    outputSchema: GenerateShePlanOutputSchema,
  },
  async (input) => {
    const retrievedDocuments = await retrieveSimilarChunksFlow(
      input.projectDescription
    );

    const {output} = await prompt({...input, retrievedDocuments});
    return output!;
  }
);
