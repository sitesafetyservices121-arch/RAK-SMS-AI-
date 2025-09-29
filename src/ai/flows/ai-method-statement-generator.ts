
'use server';
/**
 * @fileOverview Generates a Method Statement from a text prompt describing the task.
 *
 * - generateMethodStatement - A function that generates the method statement.
 * - GenerateMethodStatementInput - The input type for the function.
 * - GenerateMethodStatementOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { retrieveSimilarChunksFlow } from './ai-document-indexer';

export const GenerateMethodStatementInputSchema = z.object({
  taskDescription: z
    .string()
    .describe('A detailed description of the work/task for which the Method Statement is required, including scope and location.'),
});
export type GenerateMethodStatementInput = z.infer<typeof GenerateMethodStatementInputSchema>;

export const GenerateMethodStatementOutputSchema = z.object({
  methodStatement: z.string().describe('The generated Method Statement.'),
});
export type GenerateMethodStatementOutput = z.infer<typeof GenerateMethodStatementOutputSchema>;

export async function generateMethodStatement(input: GenerateMethodStatementInput): Promise<GenerateMethodStatementOutput> {
  return generateMethodStatementFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMethodStatementPrompt',
  input: {schema: z.object({
      taskDescription: z.string(),
      retrievedDocuments: z.array(z.string()).optional(),
  })},
  output: {schema: GenerateMethodStatementOutputSchema},
  prompt: `You are an expert in writing Method Statements for construction and industrial tasks.

  Based on the task description provided, generate a detailed Method Statement.
  
  IMPORTANT: Prioritize information from any 'retrieved documents' provided. These are approved examples and templates from the company's knowledge base. Use them as a style and content guide to ensure the final document meets company standards.

  {{#if retrievedDocuments}}
  Here are some reference documents from the knowledge base. Use these as your primary guide:
  ---
  {{#each retrievedDocuments}}
  {{this}}
  ---
  {{/each}}
  {{/if}}

  The statement should include sections for:
  1.  **Introduction/Scope of Work:** Overview of the task.
  2.  **Location of Work:** Where the task will take place.
  3.  **Responsibilities:** Roles and responsibilities of personnel.
  4.  **Plant and Equipment:** List of all machinery and tools.
  5.  **Materials:** List of materials to be used.
  6.  **Step-by-Step Work Method:** Detailed sequence of operations to perform the work safely and efficiently.
  7.  **Risk Assessment Reference:** A reference to the associated Hazard Identification and Risk Assessment (HIRA).
  8.  **First Aid and Emergency Procedures:** Plan for emergencies.

  Task Description: {{{taskDescription}}}
  `,
});

const generateMethodStatementFlow = ai.defineFlow(
  {
    name: 'generateMethodStatementFlow',
    inputSchema: GenerateMethodStatementInputSchema,
    outputSchema: GenerateMethodStatementOutputSchema,
  },
  async input => {
    const retrievedDocuments = await retrieveSimilarChunksFlow(input.taskDescription);
    const {output} = await prompt({...input, retrievedDocuments});
    return output!;
  }
);
