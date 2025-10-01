"use server";

import { generateSafeWorkProcedure } from "@/ai/flows/ai-safe-work-procedure-generator";
import { generatePdfRequest } from "@/lib/pdf";

export type SafeWorkProcedureOutput = {
  procedure: string;
};

type GenerateSafeWorkProcedureInput = {
  clientName: string;
  taskDescription: string;
};

// We need the user's ID for the PDF generation
type ActionInput = {
  values: GenerateSafeWorkProcedureInput;
  userId: string;
};

export async function generateSwpAction(
  input: ActionInput
): Promise<
  | { success: true; data: SafeWorkProcedureOutput; storagePath: string }
  | { success: false; error: string }
> {
  try {
    const rawOutput = await generateSafeWorkProcedure(input.values);

    // Format the markdown into basic HTML for the PDF
    const htmlContent = rawOutput.procedure
      .replace(/## (.*?)\n/g, "<h2>$1</h2>")
      .replace(/(\* |- ) (.*?)\n/g, "<li>$2</li>")
      .replace(/(\r\n|\n|\r)/gm, "<br>");

    // Create the PDF request
    const fileName = `SWP-${input.values.clientName.replace(
      /\s+/g,
      "_"
    )}-${new Date().toISOString()}.pdf`;
    const { storagePath } = await generatePdfRequest(
      input.userId,
      "safe-work-procedure",
      fileName,
      `<h1>Safe Work Procedure</h1>${htmlContent}`,
      { ...input.values }
    );

    return { success: true, data: rawOutput, storagePath };
  } catch (e: unknown) {
    console.error("Safe Work Procedure Action Error:", e);
    const error =
      e instanceof Error
        ? e.message
        : "Failed to generate Safe Work Procedure";
    return {
      success: false,
      error,
    };
  }
}
