import { z } from "zod";

/**
 * Input schema for generating a Safe Work Procedure (SWP).
 */
export const GenerateSafeWorkProcedureInputSchema = z.object({
  clientName: z.string().describe("The name of the client for whom the work is being done."),
  taskDescription: z
    .string()
    .describe("A detailed description of the task for which the Safe Work Procedure is required."),
});

export type GenerateSafeWorkProcedureInput = z.infer<typeof GenerateSafeWorkProcedureInputSchema>;

/**
 * Output schema for a Safe Work Procedure.
 * NOTE: procedure is REQUIRED (not optional).
 */
export const GenerateSafeWorkProcedureOutputSchema = z.object({
  procedure: z
    .string()
    .describe("The generated step-by-step Safe Work Procedure, formatted in markdown."),
});

export type SafeWorkProcedureOutput = z.infer<typeof GenerateSafeWorkProcedureOutputSchema>;
