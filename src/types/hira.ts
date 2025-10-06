
import { z } from "zod";

export const HiraInputSchema = z.object({
  projectDetails: z
    .string()
    .describe('Detailed information about the project, activity, and specific hazard.'),
  regulatoryRequirements: z
    .string()
    .describe('Applicable regulatory requirements and industry standards, e.g., OHS Act & Construction Regulations.'),
});
export type GenerateHiraInput = z.infer<typeof HiraInputSchema>;

export const HiraOutputSchema = z.object({
  controlMeasures: z
    .string()
    .describe('Recommended additional control measures to mitigate the identified hazard, based on South African regulations.'),
});
export type HiraOutput = z.infer<typeof HiraOutputSchema>;
