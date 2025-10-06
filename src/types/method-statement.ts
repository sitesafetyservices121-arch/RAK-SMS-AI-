
import { z } from "zod";

export const GenerateMethodStatementInputSchema = z.object({
  clientName: z.string().describe('The name of the client or company for whom the work is being done.'),
  siteLocation: z.string().describe('The specific location or address where the work will take place.'),
  taskDescription: z
    .string()
    .describe('A detailed description of the work/task for which the Method Statement is required.'),
  hazardsAndRisks: z.string().describe('A list of known or anticipated hazards and risks associated with the task.'),
});
export type GenerateMethodStatementInput = z.infer<typeof GenerateMethodStatementInputSchema>;

export const GenerateMethodStatementOutputSchema = z.object({
  methodStatement: z.string().describe('The generated Method Statement, formatted for professional presentation.'),
});
export type MethodStatementOutput = z.infer<typeof GenerateMethodStatementOutputSchema>;
