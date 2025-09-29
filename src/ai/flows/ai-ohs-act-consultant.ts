'use server';
/**
 * @fileOverview An AI consultant specializing in OHS Act, COID Act, and all relevant South African acts.
 *
 * - ohsActConsultant - A function that provides answers to questions related to South African acts.
 * - OhsActConsultantInput - The input type for the ohsActConsultant function.
 * - OhsActConsultantOutput - The return type for the ohsActConsultant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OhsActConsultantInputSchema = z.object({
  query: z.string().describe('The question related to OHS Act, COID Act, and other relevant South African acts.'),
});
export type OhsActConsultantInput = z.infer<typeof OhsActConsultantInputSchema>;

const OhsActConsultantOutputSchema = z.object({
  answer: z.string().describe('The answer to the question, based on the OHS Act, COID Act, and other relevant South African acts.'),
});
export type OhsActConsultantOutput = z.infer<typeof OhsActConsultantOutputSchema>;

export async function ohsActConsultant(input: OhsActConsultantInput): Promise<OhsActConsultantOutput> {
  return ohsActConsultantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'ohsActConsultantPrompt',
  input: {schema: OhsActConsultantInputSchema},
  output: {schema: OhsActConsultantOutputSchema},
  prompt: `You are an AI consultant specializing in South African acts related to Occupational Health and Safety (OHS) and Compensation for Occupational Injuries and Diseases (COID).

  Answer the following question based on your knowledge of the OHS Act, COID Act, and other relevant South African legislation. Provide clear and concise answers.

  Question: {{{query}}}
  `,
});

const ohsActConsultantFlow = ai.defineFlow(
  {
    name: 'ohsActConsultantFlow',
    inputSchema: OhsActConsultantInputSchema,
    outputSchema: OhsActConsultantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
