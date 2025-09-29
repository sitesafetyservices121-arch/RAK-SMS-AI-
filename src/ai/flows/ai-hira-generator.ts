// src/ai/flows/ai-hira-generator.ts
'use server';

/**
 * @fileOverview AI-powered Hazard Identification and Risk Assessment (HIRA) generator.
 *
 * - generateHira - A function that generates a HIRA report based on project details.
 * - HiraInput - The input type for the generateHira function.
 * - HiraOutput - The return type for the generateHira function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HiraInputSchema = z.object({
  projectDetails: z
    .string()
    .describe('Detailed information about the project, including scope, location, and timeline.'),
  regulatoryRequirements: z
    .string()
    .describe('Applicable regulatory requirements and industry standards.'),
  existingSafetyData: z
    .string()
    .optional()
    .describe('Any existing safety data or reports relevant to the project.'),
});
export type HiraInput = z.infer<typeof HiraInputSchema>;

const HiraOutputSchema = z.object({
  hazardIdentification: z
    .string()
    .describe('Identified hazards based on the project details.'),
  riskAssessment: z
    .string()
    .describe('Assessment of the risks associated with each identified hazard.'),
  controlMeasures: z
    .string()
    .describe('Recommended control measures to mitigate the identified risks.'),
});
export type HiraOutput = z.infer<typeof HiraOutputSchema>;

export async function generateHira(input: HiraInput): Promise<HiraOutput> {
  return generateHiraFlow(input);
}

const hiraPrompt = ai.definePrompt({
  name: 'hiraPrompt',
  input: {schema: HiraInputSchema},
  output: {schema: HiraOutputSchema},
  prompt: `You are an AI-powered safety expert specializing in hazard identification and risk assessment (HIRA).

  Based on the provided project details, regulatory requirements, and any existing safety data, generate a comprehensive HIRA report.

  Consider all potential hazards, assess the associated risks, and recommend appropriate control measures.

  Project Details: {{{projectDetails}}}
  Regulatory Requirements: {{{regulatoryRequirements}}}
  Existing Safety Data: {{{existingSafetyData}}}

  Format the output as follows:

Hazard Identification: [List of identified hazards]
Risk Assessment: [Assessment of risks for each hazard]
Control Measures: [Recommended control measures for each hazard]`,
});

const generateHiraFlow = ai.defineFlow(
  {
    name: 'generateHiraFlow',
    inputSchema: HiraInputSchema,
    outputSchema: HiraOutputSchema,
  },
  async input => {
    const {output} = await hiraPrompt(input);
    return output!;
  }
);
