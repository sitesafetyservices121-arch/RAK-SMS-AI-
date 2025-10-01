"use server";

import { generateHira } from "@/ai/flows/ai-hira-generator";

export type HiraInput = {
  projectDetails: string;
  regulatoryRequirements: string;
};

export type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function generateHiraAction(
  input: HiraInput
): Promise<ActionResponse<unknown>> {
  try {
    const output = await generateHira(input);
    return { success: true, data: output };
  } catch (e: unknown) {
    console.error("generateHiraAction error:", e);
    const message = e instanceof Error ? e.message : "Unknown error occurred";
    return { success: false, error: message };
  }
}
