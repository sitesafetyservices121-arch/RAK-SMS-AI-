"use server";

import { generateMethodStatement } from "@/ai/flows/ai-method-statement-generator";
import { ActionResponse } from "@/types/action-response";
import {
  MethodStatementOutput,
  GenerateMethodStatementInput,
} from "@/types/method-statement";
import {
  decodeDataUri,
  generateWordDocument,
  convertMarkdownToSections,
} from "@/lib/word";
import { saveGeneratedDocumentMetadata } from "@/lib/generated-documents";
import { ensureActionCompanyScope } from "@/lib/company-context";

// We need the user's ID for the PDF generation
type ActionInput = {
  values: GenerateMethodStatementInput;
  userId: string;
  companyId: string;
  companyName: string;
  logoDataUri?: string;
};

export async function generateMethodStatementAction(
  input: ActionInput
): Promise<ActionResponse<MethodStatementOutput>> {
  try {
    const { userId, companyId, companyName } = ensureActionCompanyScope(
      {
        userId: input.userId,
        companyId: input.companyId,
        companyName: input.companyName,
      },
      "Method Statement action"
    );

    const rawOutput = await generateMethodStatement(input.values);

    if (
      "methodStatement" in rawOutput &&
      typeof rawOutput.methodStatement === "string"
    ) {
      const sections = convertMarkdownToSections(rawOutput.methodStatement);
      const projectSection = {
        title: "Project Summary",
        paragraphs: [
          { text: `Client: ${input.values.clientName}` },
          { text: `Site Location: ${input.values.siteLocation}` },
          { text: `Known Hazards & Risks: ${input.values.hazardsAndRisks}` },
        ],
      };

      const logo = decodeDataUri(input.logoDataUri);
      const sanitizedClient = input.values.clientName
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-+|-+$/g, "")
        .toUpperCase() || "CLIENT";
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = `Method-Statement-${sanitizedClient}-${timestamp}.docx`;
      const { downloadUrl } = generateWordDocument({
        title: `Method Statement - ${input.values.clientName}`,
        companyName,
        clientName: input.values.clientName,
        generatedBy: companyName,
        isoStandard: "ISO 9001 & ISO 45001",
        sections: [projectSection, ...sections],
        logo,
      });

      const storagePath = `word/generated/${companyId}/${userId}/${fileName}`;
      await saveGeneratedDocumentMetadata({
        userId,
        companyId,
        companyName,
        documentType: "method-statement",
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
