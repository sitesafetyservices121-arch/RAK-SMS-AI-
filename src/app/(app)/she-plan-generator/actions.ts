'use server';

import { generateShePlan, type GenerateShePlanInput } from '@/ai/flows/ai-she-plan-from-prompt';

export async function generateShePlanAction(input: GenerateShePlanInput) {
  try {
    const result = await generateShePlan(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to generate SHE plan. Please try again.' };
  }
}
