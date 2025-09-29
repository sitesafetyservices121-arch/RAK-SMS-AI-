'use server';

import { generateHira, type HiraInput } from '@/ai/flows/ai-hira-generator';

export async function generateHiraAction(input: HiraInput) {
  try {
    const result = await generateHira(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to generate HIRA. Please try again.' };
  }
}
