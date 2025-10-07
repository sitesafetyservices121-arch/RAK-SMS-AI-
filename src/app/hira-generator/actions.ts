"use server";

import { ActionResponse } from "@/types/action-response";
import { HiraOutput, GenerateHiraInput } from "@/types/hira";

import { generateHira } from "@/ai/flows/ai-hira-generator";
// import { generatePdfRequest } from "@/lib/pdf";

// We need the user's ID for the PDF generation
type ActionInput = {
  values: GenerateHiraInput;
  userId: string;
};

export async function generateHiraAction(
  input: ActionInput
): Promise<ActionResponse<HiraOutput>> {
  try {
    // 1. Generate content from the AI
    const output = await generateHira(input.values);

    // 2. Format content as HTML
    const htmlContent = `
      <h1>Hazard Identification and Risk Assessment (HIRA)</h1>
      <h2>Project Details</h2>
      <pre>${input.values.projectDetails}</pre>
      <h2>Applicable Regulations</h2>
      <p>${input.values.regulatoryRequirements}</p>
      <hr />
      <h2>AI-Suggested Additional Control Measures</h2>
      <pre>${(output as { controlMeasures: string }).controlMeasures}</pre>
    `;

    // 3. Create the PDF request
    // const fileName = `HIRA-Report-${new Date().toISOString()}.pdf`;
    // const { storagePath } = await generatePdfRequest(
    //   input.userId,
    //   "hira",
    //   fileName,
    //   htmlContent,
    //   { ...input.values }
    // );

    return { success: true, data: output, storagePath: "" }; // Modified to return empty storagePath
  } catch (e: unknown) {
    console.error("generateHiraAction error:", e);
    const message = e instanceof Error ? e.message : "Unknown error occurred";
    return { success: false, error: message };
  }
}
