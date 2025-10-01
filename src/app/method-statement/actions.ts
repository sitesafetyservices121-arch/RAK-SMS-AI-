"use server";

import {
  generateMethodStatement,
} from "@/ai/flows/ai-method-statement-generator";

// Structured output type
export type MethodStatementOutput = {
  introduction: string;
  scopeOfWork: string;
  hazardsAndRisks: string;
  controlMeasures: string;
  responsibilities: string;
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

// Type guard to check if the object has the expected structure
function isMethodStatementOutput(obj: unknown): obj is MethodStatementOutput {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "introduction" in obj &&
    "scopeOfWork" in obj &&
    "hazardsAndRisks" in obj &&
    "controlMeasures" in obj &&
    "responsibilities" in obj
  );
}

// ... (inside the action)

    if (
      "methodStatement" in rawOutput &&
      typeof rawOutput.methodStatement === "string"
    ) {
      // ... (parsing logic remains the same)
    } else if (isMethodStatementOutput(rawOutput)) {
      // If the AI already returns structured output
      defaultOutput = rawOutput;
    } else {
      // Handle unexpected structure
      throw new Error("AI returned an unexpected data structure.");
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
