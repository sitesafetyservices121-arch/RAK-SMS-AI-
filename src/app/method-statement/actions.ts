"use server";

import { generateMethodStatement } from "@/ai/flows/ai-method-statement-generator";
import { ActionResponse } from "@/types/action-response";
import {
  MethodStatementOutput,
  GenerateMethodStatementInput,
} from "@/types/method-statement";

// We need the user's ID for the PDF generation
type ActionInput = {
  values: GenerateMethodStatementInput;
  userId: string;
};

export async function generateMethodStatementAction(
  input: ActionInput
): Promise<ActionResponse<MethodStatementOutput>> {
  try {
    const rawOutput = await generateMethodStatement(input.values);

    if (
      "methodStatement" in rawOutput &&
      typeof rawOutput.methodStatement === "string"
    ) {
      // The PDF generation logic has been commented out to simplify and focus on the core AI functionality.
      // In a real application, you would uncomment this to save the output.
      /*
      const htmlContent = rawOutput.methodStatement
        .replace(/## (.*?)\n/g, "<h2>$1</h2>")
        .replace(/\* (.*?)\n/g, "<li>$1</li>")
        .replace(/(\r\n|\n|\r)/gm, "<br>");

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
      */

      return { success: true, data: rawOutput, storagePath: "" };
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
