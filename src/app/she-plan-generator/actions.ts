"use server";

import {
  generateShePlan,
  GenerateShePlanOutput,
} from "@/ai/flows/ai-she-plan-from-prompt";
import { ActionResponse } from "@/types/action-response";
import { ShePlanOutput, GenerateShePlanInput } from "@/types/she-plan";
import {
  decodeDataUri,
  generateWordDocument,
} from "@/lib/word";
import type { WordSection } from "@/lib/word";
import { saveGeneratedDocumentMetadata } from "@/lib/generated-documents";
import { ensureActionCompanyScope } from "@/lib/company-context";

type ActionInput = {
  values: GenerateShePlanInput;
  userId: string;
  companyId: string;
  companyName: string;
  logoDataUri?: string;
};

export async function generateShePlanAction(
  input: ActionInput
): Promise<ActionResponse<ShePlanOutput>> {
  try {
    const { userId, companyId, companyName } = ensureActionCompanyScope(
      {
        userId: input.userId,
        companyId: input.companyId,
        companyName: input.companyName,
      },
      "SHE Plan generation action"
    );

    const output = await generateShePlan(input.values);

    const sections: WordSection[] = Object.entries(output).map(
      ([key, value]) => ({
        title: key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase()),
        paragraphs: value
          .split(/\n+/)
          .filter(Boolean)
          .map((text) => ({ text })),
      })
    );

    const overviewSection: WordSection = {
      title: "Project Overview",
      paragraphs: [{ text: input.values.projectDescription }],
    };

    const logo = decodeDataUri(input.logoDataUri);
    const sanitizedCompany = companyName
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .toUpperCase() || "COMPANY";
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `SHE-Plan-${sanitizedCompany}-${timestamp}.docx`;

    const { downloadUrl } = generateWordDocument({
      title: "Safety, Health & Environment Plan",
      companyName,
      generatedBy: companyName,
      isoStandard: "ISO 45001 & ISO 14001",
      sections: [overviewSection, ...sections],
      logo,
    });

    const storagePath = `word/generated/${companyId}/${userId}/${fileName}`;

    await saveGeneratedDocumentMetadata({
      userId,
      companyId,
      companyName,
      documentType: "she-plan",
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
    console.error("SHE Plan generation error:", e);
    const error =
      e instanceof Error ? e.message : "Failed to generate SHE Plan";
    return { success: false, error };
  }
}
