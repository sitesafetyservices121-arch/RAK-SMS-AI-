"use server";

import {
  generateMethodStatement,
} from "@/ai/flows/ai-method-statement-generator";

type GenerateMethodStatementInput = {
    clientName: string;
    siteLocation: string;
    taskDescription: string;
    hazardsAndRisks: string;
}

export async function generateMethodStatementAction(input: GenerateMethodStatementInput) {
  try {
    const output = await generateMethodStatement(input);
    return { success: true, data: output };
  } catch (e: any) {
    console.error(e);
    return { success: false, error: e.message };
  }
}
