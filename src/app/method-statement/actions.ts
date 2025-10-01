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

    if ("methodStatement" in rawOutput && typeof rawOutput.methodStatement === "string") {
      // Parse markdown-style sections if only one big string is returned
      const text = rawOutput.methodStatement;
      const sections = text.split(/##\s+/g);

      const findSection = (title: string) => {
        const match = sections.find((s) =>
          s.toLowerCase().startsWith(title.toLowerCase())
        );
        if (!match) return "";
        return match.replace(new RegExp(`^${title}`, "i"), "").trim();
      };

      defaultOutput = {
        introduction: findSection("Introduction"),
        scopeOfWork: findSection("Scope of Work"),
        hazardsAndRisks: findSection("Hazards and Risks"),
        controlMeasures: findSection("Control Measures"),
        responsibilities: findSection("Responsibilities"),
      };
    } else {
      // If the AI already returns structured output
      defaultOutput = {
        introduction: (rawOutput as any).introduction ?? "",
        scopeOfWork: (rawOutput as any).scopeOfWork ?? "",
        hazardsAndRisks: (rawOutput as any).hazardsAndRisks ?? "",
        controlMeasures: (rawOutput as any).controlMeasures ?? "",
        responsibilities: (rawOutput as any).responsibilities ?? "",
      };
    }

    return { success: true, data: defaultOutput };
  } catch (e: any) {
    console.error("Method Statement Action Error:", e);
    return {
      success: false,
      error: e.message || "Failed to generate Method Statement",
    };
  }
}
