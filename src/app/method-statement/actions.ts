"use server";

import {
  generateMethodStatement,
} from "@/ai/flows/ai-method-statement-generator";

// Structured output type
export type MethodStatementOutput = {
  methodStatement: string;
};

type GenerateMethodStatementInput = {
  clientName: string;
  siteLocation: string;
  taskDescription: string;
  hazardsAndRisks: string;
};

export async function generateMethodStatementAction(
  input: GenerateMethodStatementInput
): Promise<
  | { success: true; data: MethodStatementOutput }
  | { success: false; error: string }
> {
  try {
    const rawOutput = await generateMethodStatement(input);

    let defaultOutput: MethodStatementOutput;

    if (
      "methodStatement" in rawOutput &&
      typeof rawOutput.methodStatement === "string"
    ) {
      defaultOutput = rawOutput;
    } else {
      // Handle unexpected structure
      throw new Error("AI returned an unexpected data structure. Expected 'methodStatement' string.");
    }

    return { success: true, data: defaultOutput };
  } catch (e: unknown) {
    console.error("Method Statement Action Error:", e);
    const error = e instanceof Error ? e.message : "Failed to generate Method Statement";
    return {
      success: false,
      error,
    };
  }
}
