"use server";

import {
  generateSafeWorkProcedure,
} from "@/ai/flows/ai-safe-work-procedure-generator";

// ✅ Structured output type
export type SafeWorkProcedureOutput = {
  title: string;
  purpose: string;
  scope: string;
  responsibilities: string;
  procedureSteps: string[];
  ppeRequirements: string[];
  emergencyProcedures: string;
};

type GenerateSafeWorkProcedureInput = {
  clientName: string;
  taskDescription: string;
};

// Possible shapes returned by AI
type RawProcedureUnstructured = { procedure: string };
type RawProcedureStructured = {
  title?: string;
  purpose?: string;
  scope?: string;
  responsibilities?: string;
  procedureSteps?: string[];
  steps?: string[];
  ppeRequirements?: string[];
  emergencyProcedures?: string;
};

type RawProcedureOutput = RawProcedureUnstructured | RawProcedureStructured;

// 🔍 Type guard: check if rawOutput is unstructured
function isUnstructured(
  output: RawProcedureOutput
): output is RawProcedureUnstructured {
  return typeof (output as any).procedure === "string";
}

export async function generateSwpAction(
  input: GenerateSafeWorkProcedureInput
): Promise<
  | { success: true; data: SafeWorkProcedureOutput }
  | { success: false; error: string }
> {
  try {
    const rawOutput: RawProcedureOutput = await generateSafeWorkProcedure(input);

    let normalized: SafeWorkProcedureOutput;

    if (isUnstructured(rawOutput)) {
      // 📝 Fallback: AI returned a single big string → parse into sections
      const text = rawOutput.procedure;
      const sections = text.split(/##\s+/g);

      const findSection = (title: string): string => {
        const match = sections.find((s) =>
          s.toLowerCase().startsWith(title.toLowerCase())
        );
        if (!match) return "";
        return match.replace(new RegExp(`^${title}`, "i"), "").trim();
      };

      normalized = {
        title: findSection("Title") || input.taskDescription,
        purpose: findSection("Purpose"),
        scope: findSection("Scope"),
        responsibilities: findSection("Responsibilities"),
        procedureSteps: findSection("Procedure Steps")
          .split(/\n+/)
          .filter(Boolean),
        ppeRequirements: findSection("PPE Requirements")
          .split(/\n+/)
          .filter(Boolean),
        emergencyProcedures: findSection("Emergency Procedures"),
      };
    } else {
      // ✅ Structured response from AI (explicit cast here avoids `never`)
      const structured = rawOutput as RawProcedureStructured;

      normalized = {
        title: structured.title ?? input.taskDescription,
        purpose: structured.purpose ?? "",
        scope: structured.scope ?? "",
        responsibilities: structured.responsibilities ?? "",
        procedureSteps: structured.procedureSteps ?? structured.steps ?? [],
        ppeRequirements: structured.ppeRequirements ?? [],
        emergencyProcedures: structured.emergencyProcedures ?? "",
      };
    }

    return { success: true, data: normalized };
  } catch (e: any) {
    console.error("Safe Work Procedure Action Error:", e);
    return {
      success: false,
      error: e.message || "Failed to generate Safe Work Procedure",
    };
  }
}
