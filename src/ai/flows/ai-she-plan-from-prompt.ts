
'use server';
/**
 * @fileOverview Generates a SHE (Safety, Health, and Environment) plan from a text prompt describing the project.
 *
 * - generateShePlan - A function that generates the SHE plan.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { retrieveSimilarChunksFlow } from './ai-document-indexer';

const GenerateShePlanInputSchema = z.object({
  projectDescription: z
    .string()
    .describe('A detailed description of the project, including Client Name, Site Location, Scope of Work, Number of employees + contractors, Types of hazards expected, Appointed Safety Officer & Supervisors, Emergency contacts, and Project start & end dates.'),
});
type GenerateShePlanInput = z.infer<typeof GenerateShePlanInputSchema>;

const GenerateShePlanOutputSchema = z.object({
  introduction: z.string().describe("Introduction and scope of the project, tailored to the provided details."),
  safetyPolicy: z.string().describe("A standard but comprehensive company commitment to safety, referencing the OHS Act."),
  objectives: z.string().describe("Specific, measurable safety objectives for the project based on its scope and hazards."),
  rolesAndResponsibilities: z.string().describe("Roles and responsibilities for key personnel, including the provided Safety Officer and Supervisors."),
  riskManagement: z.string().describe("Process for hazard identification, risk assessment, and control, mentioning the expected hazards."),
  safeWorkProcedures: z.string().describe("A general reference to key safe work procedures relevant to the scope of work and hazards."),
  emergencyProcedures: z.string().describe("A plan for emergency situations, incorporating the provided emergency contacts."),
  trainingAndCompetency: z.string().describe("Details on required training and competency verification for the described project."),
  incidentReporting: z.string().describe("A standard procedure for reporting and investigating incidents as per the OHS Act."),
  monitoringAndReview: z.string().describe("How the SHE plan will be monitored and reviewed throughout the project timeline."),
});
type GenerateShePlanOutput = z.infer<typeof GenerateShePlanOutputSchema>;

export async function generateShePlan(input: GenerateShePlanInput): Promise<GenerateShePlanOutput> {
  return generateShePlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateShePlanPrompt',
  input: {schema: z.object({
      projectDescription: z.string(),
      retrievedDocuments: z.array(z.string()).optional(),
  })},
  output: {schema: GenerateShePlanOutputSchema},
  prompt: `You are an expert in creating professional Safety, Health, and Environment (SHE) plans for construction and industrial projects in South Africa.

  Based on the detailed project information provided below, generate a comprehensive and site-ready SHE plan. The language must be formal and professional. Where relevant, explicitly reference sections of the South African Occupational Health and Safety (OHS) Act 85 of 1993.
  
  IMPORTANT: Prioritize information from any 'retrieved documents' provided. These are approved examples and templates from the company's knowledge base. Use them as a style and content guide to ensure the final document meets company standards.

  {{#if retrievedDocuments}}
  Here are some reference documents from the knowledge base. Use these as your primary guide:
  ---
  {{#each retrievedDocuments}}
  {{this}}
  ---
  {{/each}}
  {{/if}}

  Project Information:
  {{{projectDescription}}}

  Generate detailed and specific content for each of the following sections of the SHE Plan based on the project information.

  IMPORTANT: Generate the output as a valid JSON object with the specified keys. Do not include any text outside of the JSON structure.
  `,
});

const generateShePlanFlow = ai.defineFlow(
  {
    name: 'generateShePlanFlow',
    inputSchema: GenerateShePlanInputSchema,
    outputSchema: GenerateShePlanOutputSchema,
  },
  async input => {
    const retrievedDocuments = await retrieveSimilarChunksFlow(input.projectDescription);
    const {output} = await prompt({...input, retrievedDocuments});
    return output!;
  }
);
