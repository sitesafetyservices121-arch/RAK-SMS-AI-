"use server";

import {
  generateHira,
} from "@/ai/flows/ai-hira-generator";

type HiraInput = {
    projectDetails: string;
    regulatoryRequirements: string;
}

export async function generateHiraAction(input: HiraInput) {
  try {
    const output = await generateHira(input);
    return { success: true, data: output };
  } catch (e: any) {
    console.error(e);
    return { success: false, error: e.message };
  }
}
