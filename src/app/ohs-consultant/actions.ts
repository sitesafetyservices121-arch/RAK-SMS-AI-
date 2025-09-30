"use server";

import {
  ohsActConsultant,
} from "@/ai/flows/ai-ohs-act-consultant";

type OhsActConsultantInput = {
    query: string;
    history?: any[];
    documentDataUri?: string;
}

export async function askWilsonAction(input: OhsActConsultantInput) {
  try {
    const output = await ohsActConsultant(input);
    return { success: true, data: output };
  } catch (e: any) {
    console.error(e);
    return { success: false, error: e.message };
  }
}
