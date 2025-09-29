"use server";

import {
  generateShePlan,
  type GenerateShePlanInput,
} from "@/ai/flows/ai-she-plan-from-prompt";

export async function generateShePlanAction(input: GenerateShePlanInput) {
  try {
    const output = await generateShePlan(input);
    return { success: true, data: output };
  } catch (e: any) {
    console.error(e);
    return { success: false, error: e.message };
  }
}
