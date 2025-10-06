"use server";

import { ActionResponse } from "@/types/action-response";
import { HiraOutput, GenerateHiraInput } from "@/types/hira";

import { generateHira } from "@/ai/flows/ai-hira-generator";
import {
  decodeDataUri,
  generateWordDocument,
  convertMarkdownToSections,
} from "@/lib/word";
import type { WordSection } from "@/lib/word";
import { saveGeneratedDocumentMetadata } from "@/lib/generated-documents";
import { ensureActionCompanyScope } from "@/lib/company-context";

type ActionInput = {
  values: GenerateHiraInput;
  userId: string;
  companyId: string;
  companyName: string;
  logoDataUri?: string;
};

export async function generateHiraAction(
  input: ActionInput
): Promise<ActionResponse<HiraOutput>> {
  try {
    // 1. Generate content from the AI
    const { userId, companyId, companyName } = ensureActionCompanyScope(
      {
        userId: input.userId,
        companyId: input.companyId,
        companyName: input.companyName,
      },
      "HIRA generation action"
    );

    const output = await generateHira(input.values);

    const projectSection: WordSection = {
      title: "Project & Hazard Details",
      paragraphs: input.values.projectDetails
        .split(/\n+/)
        .filter(Boolean)
        .map((text) => ({ text })),
    };

    const regulationsSection: WordSection = {
      title: "Applicable Regulations",
      paragraphs: [{ text: input.values.regulatoryRequirements }],
    };

    const controlMeasures = (output as { controlMeasures: string }).controlMeasures;
    const controlSections = convertMarkdownToSections(controlMeasures);
    const controlsToUse =
      controlSections.length > 0
        ? controlSections
        : ([
            {
              title: "AI-Suggested Control Measures",
              paragraphs: controlMeasures
                .split(/\n+/)
                .filter(Boolean)
                .map((text) => ({ text })),
            },
          ] as WordSection[]);

    const logo = decodeDataUri(input.logoDataUri);
    const sanitizedName = companyName
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .toUpperCase() || "COMPANY";
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `HIRA-Control-Measures-${sanitizedName}-${timestamp}.docx`;

    const { downloadUrl } = generateWordDocument({
      title: "Hazard Control Measures Summary",
      companyName,
      generatedBy: companyName,
      isoStandard: "ISO 45001 & ISO 31000",
      sections: [projectSection, regulationsSection, ...controlsToUse],
      logo,
    });

    const storagePath = `word/generated/${companyId}/${userId}/${fileName}`;

    await saveGeneratedDocumentMetadata({
      userId,
      companyId,
      companyName,
      documentType: "hira",
      fileName,
      storagePath,
      downloadUrl,
    });

    return {
      success: true,
      data: output,
      storagePath,
      fileName,
      downloadUrl,
    };
  } catch (e: unknown) {
    console.error("generateHiraAction error:", e);
    const message = e instanceof Error ? e.message : "Unknown error occurred";
    return { success: false, error: message };
  }
}
