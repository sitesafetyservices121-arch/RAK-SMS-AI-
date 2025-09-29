// 'use server'
'use server';

/**
 * @fileOverview Analyzes Lost Time Injury Rate (LTIR) data to identify trends and areas for improvement using AI.
 *
 * - analyzeLtirTrend - A function that handles the LTIR trend analysis process.
 * - AnalyzeLtirTrendInput - The input type for the analyzeLtirTrend function.
 * - AnalyzeLtirTrendOutput - The return type for the analyzeLtirTrend function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeLtirTrendInputSchema = z.object({
  ltirData: z
    .string()
    .describe(
      'Historical LTIR data, preferably in CSV format. Include date, number of injuries, and hours worked.'
    ),\n  additionalContext: z.string().optional().describe('Any additional context about the data.'),
});
export type AnalyzeLtirTrendInput = z.infer<typeof AnalyzeLtirTrendInputSchema>;

const AnalyzeLtirTrendOutputSchema = z.object({
  trendAnalysis: z.string().describe('AI-driven analysis of LTIR trends.'),
  improvementAreas: z.string().describe('Identified areas for safety improvement.'),
  recommendations: z.string().describe('Specific recommendations to address identified issues.'),
});
export type AnalyzeLtirTrendOutput = z.infer<typeof AnalyzeLtirTrendOutputSchema>;

export async function analyzeLtirTrend(input: AnalyzeLtirTrendInput): Promise<AnalyzeLtirTrendOutput> {
  return analyzeLtirTrendFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeLtirTrendPrompt',
  input: {schema: AnalyzeLtirTrendInputSchema},
  output: {schema: AnalyzeLtirTrendOutputSchema},
  prompt: `You are an AI safety analyst. Analyze the provided LTIR data to identify trends, areas for improvement, and provide recommendations.

LTIR Data:
{{{ltirData}}}

Additional Context: {{{additionalContext}}}

Analyze the data and provide:
1. A summary of the LTIR trends.
2. Identified areas for safety improvement.
3. Specific recommendations to reduce workplace injuries.

Ensure the analysis is clear, concise, and actionable.
`,
});

const analyzeLtirTrendFlow = ai.defineFlow(
  {
    name: 'analyzeLtirTrendFlow',
    inputSchema: AnalyzeLtirTrendInputSchema,
    outputSchema: AnalyzeLtirTrendOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
