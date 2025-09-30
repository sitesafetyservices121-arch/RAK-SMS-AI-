
'use server';
/**
 * @fileOverview An AI consultant specializing in OHS Act, COID Act, and all relevant South African acts.
 *
 * - ohsActConsultant - A function that provides answers to questions related to South African acts.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { retrieveSimilarChunksFlow } from './ai-document-indexer';

const OhsActConsultantInputSchema = z.object({
  query: z.string().describe('The question related to OHS Act, COID Act, and other relevant South African acts.'),
  history: z.array(z.any()).optional().describe("The chat history."),
  documentDataUri: z.string().optional().describe("A document provided by the user for context, as a data URI.")
});
type OhsActConsultantInput = z.infer<typeof OhsActConsultantInputSchema>;

const OhsActConsultantOutputSchema = z.object({
  answer: z.string().describe('The answer to the question, based on the OHS Act, COID Act, and other relevant South African acts.'),
});
type OhsActConsultantOutput = z.infer<typeof OhsActConsultantOutputSchema>;

export async function ohsActConsultant(input: OhsActConsultantInput): Promise<OhsActConsultantOutput> {
  return ohsActConsultantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'ohsActConsultantPrompt',
  input: {schema: z.object({
    query: z.string(),
    retrievedDocuments: z.array(z.string()).optional(),
    history: z.array(z.any()).optional(),
    documentDataUri: z.string().optional(),
  })},
  output: {schema: OhsActConsultantOutputSchema},
  prompt: `You are Wilson, an AI consultant specializing in South African acts related to Occupational Health and Safety (OHS) and Compensation for Occupational Injuries and Diseases (COID). Be conversational and helpful.

  Your knowledge base consists of official legal documents provided by the administrator. You MUST prioritize information from these retrieved documents over your general knowledge.

  If the user provides a document, analyze it in the context of their question and your knowledge base.

  {{#if retrievedDocuments}}
  Here are some documents retrieved from the knowledge base that might be relevant to the user's question:
  ---
  {{#each retrievedDocuments}}
  {{this}}
  ---
  {{/each}}
  {{/if}}

  {{#if documentDataUri}}
  The user has also provided the following document for analysis:
  {{media url=documentDataUri}}
  {{/if}}

  {{#if history}}
  Here is the conversation history:
  {{#each history}}
  {{role}}: {{content}}
  {{/each}}
  {{/if}}

  Based on all the information provided, answer the user's latest question. Provide clear and concise answers, referencing the specific act or section where possible.

  User Question: {{{query}}}
  `,
});

const ohsActConsultantFlow = ai.defineFlow(
  {
    name: 'ohsActConsultantFlow',
    inputSchema: OhsActConsultantInputSchema,
    outputSchema: OhsActConsultantOutputSchema,
  },
  async input => {
    
    const retrievedDocuments = await retrieveSimilarChunksFlow(input.query);

    const {output} = await prompt({ ...input, retrievedDocuments });

    return output!;
  }
);
