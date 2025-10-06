
'use server';

/**
 * @fileOverview Analyzes Lost Time Injury Rate (LTIR) data to identify trends and areas for improvement using AI.
 *
 * - analyzeLtirTrend - A function that handles the LTIR trend analysis process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeLtirTrendInputSchema = z.object({
  numberOfInjuries: z.number().describe("The number of lost time injuries for the period."),
  totalHoursWorked: z.number().describe("The total hours worked for the period."),
  additionalContext: z.string().optional().describe('Any additional context, historical data, or specific questions about the data.'),
});
type AnalyzeLtirTrendInput = z.infer<typeof AnalyzeLtirTrendInputSchema>;

const AnalyzeLtirTrendOutputSchema = z.object({
  trendAnalysis: z.string().describe('AI-driven analysis of the provided data and LTIR score.'),
  improvementAreas: z.string().describe('Identified areas for safety improvement based on the context.'),
  recommendations: z.string().describe('Specific recommendations to address identified issues and reduce the LTIR.'),
  ltir: z.number().optional(),
  interpretation: z.string().optional(),
});
type AnalyzeLtirTrendOutput = z.infer<typeof AnalyzeLtirTrendOutputSchema>;

export async function analyzeLtirTrend(input: AnalyzeLtirTrendInput): Promise<AnalyzeLtirTrendOutput> {
  return analyzeLtirTrendFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeLtirTrendPrompt',
  input: {schema: z.object({
      ltirScore: z.number(),
      numberOfInjuries: z.number(),
      totalHoursWorked: z.number(),
      additionalContext: z.string().optional()
  })},
  output: {schema: AnalyzeLtirTrendOutputSchema},
  prompt: `You are an AI safety analyst. Your task is to analyze the provided Lost Time Injury Rate (LTIR) data and context.

  The calculated LTIR for the period is: {{{ltirScore}}}
  This was based on:
  - Number of Lost Time Injuries: {{{numberOfInjuries}}}
  - Total Hours Worked: {{{totalHoursWorked}}}

  The user has also provided the following context or historical data:
  {{{additionalContext}}}

  Based on all this information, please provide:
  1.  A concise analysis of what the calculated LTIR score means. If historical data is provided, comment on the trend (is it improving, worsening, or stable?).
  2.  Based on the context, identify potential root causes or areas that may require safety improvement.
  3.  Provide specific, actionable recommendations to help reduce workplace injuries and lower the LTIR.

  Ensure the analysis is clear, concise, and professional.
`,
});

const analyzeLtirTrendFlow = ai.defineFlow(
  {
    name: 'analyzeLtirTrendFlow',
    inputSchema: AnalyzeLtirTrendInputSchema,
    outputSchema: AnalyzeLtirTrendOutputSchema,
  },
  async input => {
    // The calculation is now done on the client, we just use the data for analysis
    const ltirScore = input.totalHoursWorked > 0 ? (input.numberOfInjuries * 200000) / input.totalHoursWorked : 0;
    
    const {output} = await prompt({
        ltirScore,
        numberOfInjuries: input.numberOfInjuries,
        totalHoursWorked: input.totalHoursWorked,
        additionalContext: input.additionalContext,
    });
    return { ...output!, ltir: ltirScore };
  }
);
