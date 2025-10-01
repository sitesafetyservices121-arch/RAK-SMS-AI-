"use server";

import { generateShePlan, GenerateShePlanOutput } from "@/ai/flows/ai-she-plan-from-prompt";

type GenerateShePlanInput = {
  projectDescription: string;
};

export async function generateShePlanAction(
  input: GenerateShePlanInput
): Promise<
  | { success: true; data: GenerateShePlanOutput }
  | { success: false; error: string }
> {
  try {
    const output = await generateShePlan(input);
    return { success: true, data: output };
  } catch (e: any) {
    console.error("SHE Plan generation error:", e);
    return { success: false, error: e.message || "Failed to generate SHE Plan" };
  }
}
