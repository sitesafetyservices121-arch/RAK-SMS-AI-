"use server";

import {
  ohsActConsultant,
} from "@/ai/flows/ai-ohs-act-consultant";

type OhsActConsultantInput = {
  query: string;
  history?: { role: string; content: string }[];
  documentDataUri?: string;
};

type OhsActConsultantResponse =
  | { success: true; data: unknown }
  | { success: false; error: string };

export async function askWilsonAction(
  input: OhsActConsultantInput
): Promise<OhsActConsultantResponse> {
  try {
    const output = await ohsActConsultant(input);
    return { success: true, data: output };
  } catch (e: unknown) {
    console.error("Wilson Action Error:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Unknown error occurred",
    };
  }
}
