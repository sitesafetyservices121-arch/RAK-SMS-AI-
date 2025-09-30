
"use server";

import {
  generateMethodStatement,
  type GenerateMethodStatementInput,
} from "@/ai/flows/ai-method-statement-generator";

export async function generateMethodStatementAction(input: GenerateMethodStatementInput) {
  try {
    const output = await generateMethodStatement(input);
    return { success: true, data: output };
  } catch (e: any) {
    console.error(e);
    return { success: false, error: e.message };
  }
}
