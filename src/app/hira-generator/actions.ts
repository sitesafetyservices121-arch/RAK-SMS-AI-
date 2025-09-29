"use server";

import {
  generateHira,
  type HiraInput,
} from "@/ai/flows/ai-hira-generator";

export async function generateHiraAction(input: HiraInput) {
  try {
    const output = await generateHira(input);
    return { success: true, data: output };
  } catch (e: any) {
    console.error(e);
    return { success: false, error: e.message };
  }
}
