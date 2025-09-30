
'use server';
/**
 * @fileOverview Generates a Method Statement from a text prompt describing the task.
 *
 * - generateMethodStatement - A function that generates the method statement.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { retrieveSimilarChunksFlow } from './ai-document-indexer';

const GenerateMethodStatementInputSchema = z.object({
  clientName: z.string().describe('The name of the client or company for whom the work is being done.'),
  siteLocation: z.string().describe('The specific location or address where the work will take place.'),
  taskDescription: z
    .string()
    .describe('A detailed description of the work/task for which the Method Statement is required.'),
  hazardsAndRisks: z.string().describe('A list of known or anticipated hazards and risks associated with the task.'),
});
type GenerateMethodStatementInput = z.infer<typeof GenerateMethodStatementInputSchema>;

const GenerateMethodStatementOutputSchema = z.object({
  methodStatement: z.string().describe('The generated Method Statement, formatted for professional presentation.'),
});
type GenerateMethodStatementOutput = z.infer<typeof GenerateMethodStatementOutputSchema>;

export async function generateMethodStatement(input: GenerateMethodStatementInput): Promise<GenerateMethodStatementOutput> {
  return generateMethodStatementFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMethodStatementPrompt',
  input: {schema: z.object({
      clientName: z.string(),
      siteLocation: z.string(),
      taskDescription: z.string(),
      hazardsAndRisks: z.string(),
      retrievedDocuments: z.array(z.string()).optional(),
  })},
  output: {schema: GenerateMethodStatementOutputSchema},
  prompt: `You are an expert in writing Method Statements for construction and industrial tasks in South Africa.

  Based on the project details provided, generate a detailed and professional Method Statement. The tone should be formal and suitable for official site documentation.
  
  IMPORTANT: Prioritize information from any 'retrieved documents' provided. These are approved examples and templates from the company's knowledge base. Use them as a style and content guide to ensure the final document meets company standards.

  {{#if retrievedDocuments}}
  Here are some reference documents from the knowledge base. Use these as your primary guide:
  ---
  {{#each retrievedDocuments}}
  {{this}}
  ---
  {{/each}}
  {{/if}}

  The statement must include the following sections, using the provided project information:
  1.  **Project Details:** Clearly state the Client Name and Site Location.
  2.  **Scope of Work:** An overview of the task, derived from the task description.
  3.  **Responsibilities:** General roles (e.g., Site Supervisor, Safety Officer, Employees).
  4.  **Plant and Equipment:** A list of likely machinery and tools based on the task.
  5.  **Materials:** A list of potential materials to be used.
  6.  **Step-by-Step Work Method:** A detailed, logical sequence of operations to perform the work safely and efficiently.
  7.  **Risk Assessment:** Summarize the key hazards and risks provided by the user and mention that a comprehensive HIRA document should be cross-referenced.
  8.  **First Aid and Emergency Procedures:** A standard plan for emergencies.

  Project Information:
  - Client Name: {{{clientName}}}
  - Site Location: {{{siteLocation}}}
  - Task Description: {{{taskDescription}}}
  - Known Hazards and Risks: {{{hazardsAndRisks}}}

  Generate the full method statement as a single block of text, using markdown for formatting (e.g., ## for headings, * for list items).
  `,
});

const generateMethodStatementFlow = ai.defineFlow(
  {
    name: 'generateMethodStatementFlow',
    inputSchema: GenerateMethodStatementInputSchema,
    outputSchema: GenerateMethodStatementOutputSchema,
  },
  async input => {
    const fullQueryForRetrieval = `${input.taskDescription} ${input.hazardsAndRisks}`;
    const retrievedDocuments = await retrieveSimilarChunksFlow(fullQueryForRetrieval);
    const {output} = await prompt({...input, retrievedDocuments});
    return output!;
  }
);
