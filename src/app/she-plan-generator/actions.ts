"use server";

import {
  generateShePlan,
} from "@/ai/flows/ai-she-plan-from-prompt";

type GenerateShePlanInput = {
  projectDescription: string;
};

// The input type is now just the projectDescription string
export async function generateShePlanAction(input: GenerateShePlanInput) {
  try {
    const output = await generateShePlan(input);
    return { success: true, data: output };
  } catch (e: any) {
    console.error(e);
    return { success: false, error: e.message };
  }
}
