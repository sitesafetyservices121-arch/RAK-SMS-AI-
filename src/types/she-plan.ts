
import { z } from "zod";

export const GenerateShePlanInputSchema = z.object({
  projectDescription: z
    .string()
    .describe('A detailed description of the project requiring the SHE Plan.'),
});
export type GenerateShePlanInput = z.infer<
  typeof GenerateShePlanInputSchema
>;

export const GenerateShePlanOutputSchema = z.object({
  introduction: z.string().describe('Introduction to the SHE Plan.'),
  safetyPolicy: z.string().describe('The company safety policy statement.'),
  objectives: z.string().describe('Specific safety objectives for the project.'),
  rolesAndResponsibilities: z
    .string()
    .describe('Key roles and their safety responsibilities.'),
  riskManagement: z.string().describe('Overview of the risk management process.'),
  safeWorkProcedures: z
    .string()
    .describe('Mention of the need for specific safe work procedures.'),
  emergencyProcedures: z.string().describe('Plan for handling emergencies.'),
  trainingAndCompetency: z
    .string()
    .describe('Requirements for employee training.'),
  incidentReporting: z
    .string()
    .describe('Process for reporting incidents.'),
  monitoringAndReview: z
    .string()
    .describe('Plan for monitoring and reviewing safety performance.'),
});

export type ShePlanOutput = z.infer<
  typeof GenerateShePlanOutputSchema
>;
