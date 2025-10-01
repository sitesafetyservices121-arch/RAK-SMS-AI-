"use server";

import {
  generateShePlan,
  GenerateShePlanOutput,
} from "@/ai/flows/ai-she-plan-from-prompt";
import { generatePdfRequest } from "@/lib/pdf";
import { auth } from "@/lib/firebase-admin"; // Assuming you have this

type GenerateShePlanInput = {
  projectDescription: string;
};

// We need the user's ID for the PDF generation
type ActionInput = {
  values: GenerateShePlanInput;
  userId: string;
};

export async function generateShePlanAction(
  input: ActionInput
): Promise<
  | { success: true; data: GenerateShePlanOutput; storagePath: string }
  | { success: false; error: string }
> {
  try {
    // 1. Generate the content from the AI
    const output = await generateShePlan(input.values);

    // 2. Format the content as HTML for the PDF
    const htmlContent = `
      <h1>SHE Plan for Project</h1>
      <p><strong>Project Description:</strong> ${input.values.projectDescription}</p>
      <hr />
      ${Object.entries(output)
        .map(([key, value]) => {
          const title = key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase());
          return `<h2>${title}</h2><p>${value}</p>`;
        })
        .join("")}
    `;

    // 3. Create the PDF request
    const fileName = `SHE-Plan-${new Date().toISOString()}.pdf`;
    const { storagePath } = await generatePdfRequest(
      input.userId,
      "she-plan",
      fileName,
      htmlContent,
      { projectDescription: input.values.projectDescription }
    );

    return { success: true, data: output, storagePath };
  } catch (e: unknown) {
    console.error("SHE Plan generation error:", e);
    const error =
      e instanceof Error ? e.message : "Failed to generate SHE Plan";
    return { success: false, error };
  }
}
