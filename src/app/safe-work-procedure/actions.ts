"use server";

import { generateSafeWorkProcedure } from "@/ai/flows/ai-safe-work-procedure-generator";
import { ActionResponse } from "@/types/action-response";
import {
  SafeWorkProcedureOutput,
  GenerateSafeWorkProcedureInput,
} from "@/types/safe-work-procedure";
import {
  decodeDataUri,
  generateWordDocument,
  convertMarkdownToSections,
} from "@/lib/word";
import { saveGeneratedDocumentMetadata } from "@/lib/generated-documents";
import { ensureActionCompanyScope } from "@/lib/company-context";

// We need the user's ID for the PDF generation
type ActionInput = {
  values: GenerateSafeWorkProcedureInput;
  userId: string;
  companyId: string;
  companyName: string;
  logoDataUri?: string;
};

export async function generateSwpAction(
  input: ActionInput
): Promise<ActionResponse<SafeWorkProcedureOutput>> {
  try {
    const { userId, companyId, companyName } = ensureActionCompanyScope(
      {
        userId: input.userId,
        companyId: input.companyId,
        companyName: input.companyName,
      },
      "Safe Work Procedure action"
    );

    const rawOutput = await generateSafeWorkProcedure(input.values);

    const sections = convertMarkdownToSections(rawOutput.procedure);
    const overviewSection = {
      title: "Task Overview",
      paragraphs: [
        { text: `Client: ${input.values.clientName}` },
        { text: `Task Description: ${input.values.taskDescription}` },
      ],
    };

    const logo = decodeDataUri(input.logoDataUri);
    const sanitizedClient = input.values.clientName
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .toUpperCase() || "CLIENT";
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `Safe-Work-Procedure-${sanitizedClient}-${timestamp}.docx`;

    const { downloadUrl } = generateWordDocument({
      title: `Safe Work Procedure - ${input.values.clientName}`,
      companyName,
      clientName: input.values.clientName,
      generatedBy: companyName,
      isoStandard: "ISO 45001",
      sections: [overviewSection, ...sections],
      logo,
    });

    const storagePath = `word/generated/${companyId}/${userId}/${fileName}`;

    await saveGeneratedDocumentMetadata({
      userId,
      companyId,
      companyName,
      documentType: "safe-work-procedure",
      fileName,
      storagePath,
      downloadUrl,
    });

    return {
      success: true,
      data: rawOutput,
      storagePath,
      fileName,
      downloadUrl,
    };
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
