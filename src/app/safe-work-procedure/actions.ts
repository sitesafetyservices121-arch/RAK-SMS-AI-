
"use server";

import {
  generateSafeWorkProcedure,
  type GenerateSafeWorkProcedureInput,
} from "@/ai/flows/ai-safe-work-procedure-generator";

export async function generateSwpAction(input: GenerateSafeWorkProcedureInput) {
  try {
    const output = await generateSafeWorkProcedure(input);
    return { success: true, data: output };
  } catch (e: any) {
    console.error(e);
    return { success: false, error: e.message };
  }
}
