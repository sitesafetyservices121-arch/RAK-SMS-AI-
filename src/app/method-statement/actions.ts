"use server";

import { generateMethodStatement } from "@/ai/flows/ai-method-statement-generator";
import { generatePdfRequest } from "@/lib/pdf";

export type MethodStatementOutput = {
  methodStatement: string;
};

type GenerateMethodStatementInput = {
  clientName: string;
  siteLocation: string;
  taskDescription: string;
  hazardsAndRisks: string;
};

// We need the user's ID for the PDF generation
type ActionInput = {
  values: GenerateMethodStatementInput;
  userId: string;
};

export async function generateMethodStatementAction(
  input: ActionInput
): Promise<
  | { success: true; data: MethodStatementOutput; storagePath: string }
  | { success: false; error: string }
> {
  try {
    const rawOutput = await generateMethodStatement(input.values);

    if (
      "methodStatement" in rawOutput &&
      typeof rawOutput.methodStatement === "string"
    ) {
      const defaultOutput: MethodStatementOutput = rawOutput;

      // Format the markdown into basic HTML for the PDF
      const htmlContent = rawOutput.methodStatement
        .replace(/## (.*?)\n/g, "<h2>$1</h2>")
        .replace(/\* (.*?)\n/g, "<li>$1</li>")
        .replace(/(\r\n|\n|\r)/gm, "<br>");

      // Create the PDF request
      const fileName = `Method-Statement-${input.values.clientName.replace(
        /\s+/g,
        "_"
      )}-${new Date().toISOString()}.pdf`;
      const { storagePath } = await generatePdfRequest(
        input.userId,
        "method-statement",
        fileName,
        `<h1>Method Statement</h1>${htmlContent}`,
        { ...input.values }
      );

      return { success: true, data: defaultOutput, storagePath };
    } else {
      throw new Error(
        "AI returned an unexpected data structure. Expected 'methodStatement' string."
      );
    }
  } catch (e: unknown) {
    console.error("Method Statement Action Error:", e);
    const error =
      e instanceof Error
        ? e.message
        : "Failed to generate Method Statement";
    return {
      success: false,
      error,
    };
  }
}
