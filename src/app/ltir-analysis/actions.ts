"use server";

import { analyzeLtirTrend } from "@/ai/flows/ai-ltir-trend-analysis";

import { ActionResponse } from "@/types/action-response";
import { AnalyzeLtirTrendInput, AnalyzeLtirTrendOutput, SaveLtirReportInput } from "@/types/ltir-analysis";
import {
  decodeDataUri,
  generateWordDocument,
} from "@/lib/word";
import type { WordSection } from "@/lib/word";
import { saveGeneratedDocumentMetadata } from "@/lib/generated-documents";
import { ensureActionCompanyScope } from "@/lib/company-context";

type AnalyzeActionInput = {
  values: AnalyzeLtirTrendInput;
  userId: string;
  companyId: string;
  companyName: string;
  logoDataUri?: string;
};

export async function analyzeLtirAction(
  input: AnalyzeActionInput
): Promise<ActionResponse<AnalyzeLtirTrendOutput>> {
  try {
    const { userId, companyId, companyName } = ensureActionCompanyScope(
      {
        userId: input.userId,
        companyId: input.companyId,
        companyName: input.companyName,
      },
      "LTIR analysis action"
    );

    const output = await analyzeLtirTrend(input.values);
    const data: AnalyzeLtirTrendOutput = {
      trendAnalysis: output.trendAnalysis || "No trend analysis provided.",
      improvementAreas: output.improvementAreas || "No improvement areas identified.",
      recommendations: output.recommendations || "No recommendations provided.",
      ltir: output.ltir,
      interpretation: output.interpretation,
    };

    const overviewSection: WordSection = {
      title: "LTIR Inputs",
      paragraphs: [
        { text: `Lost Time Injuries: ${input.values.numberOfInjuries}` },
        { text: `Total Hours Worked: ${input.values.totalHoursWorked.toLocaleString()}` },
        {
          text: `Calculated LTIR: ${
            data.ltir !== undefined ? data.ltir.toFixed(2) : "Not provided"
          }`,
        },
        {
          text: `Additional Context: ${input.values.additionalContext || "None provided"}`,
        },
      ],
    };

    const sections: WordSection[] = [
      overviewSection,
      {
        title: "Trend Analysis",
        paragraphs: [{ text: data.trendAnalysis }],
      },
      {
        title: "Improvement Areas",
        paragraphs: [{ text: data.improvementAreas }],
      },
      {
        title: "Recommendations",
        paragraphs: [{ text: data.recommendations }],
      },
    ];

    if (data.interpretation) {
      sections.push({
        title: "Interpretation",
        paragraphs: [{ text: data.interpretation }],
      });
    }

    const logo = decodeDataUri(input.logoDataUri);
    const sanitizedCompany = companyName
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .toUpperCase() || "COMPANY";
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `LTIR-Analysis-${sanitizedCompany}-${timestamp}.docx`;

    const { downloadUrl } = generateWordDocument({
      title: "Lost Time Injury Rate Analysis",
      companyName,
      generatedBy: companyName,
      isoStandard: "ISO 45001",
      sections,
      logo,
    });

    const storagePath = `word/generated/${companyId}/${userId}/${fileName}`;

    await saveGeneratedDocumentMetadata({
      userId,
      companyId,
      companyName,
      documentType: "ltir-analysis",
      fileName,
      storagePath,
      downloadUrl,
    });

    return {
      success: true,
      data,
      storagePath,
      fileName,
      downloadUrl,
    };
  } catch (e: unknown) {
    console.error(e);
    const error = e instanceof Error ? e.message : "An unknown error occurred.";
    return { success: false, error };
  }
}



export async function saveLtirReportAction(
  input: SaveLtirReportInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId, calculatedLtir, formValues, analysisResult } = input;

    const htmlContent = `
      <h1>LTIR Analysis Report</h1>
      <h2>Inputs</h2>
      <ul>
        <li>Number of Lost Time Injuries: ${formValues.numberOfInjuries}</li>
        <li>Total Hours Worked: ${formValues.totalHoursWorked.toLocaleString()}</li>
        <li>Calculated LTIR: ${calculatedLtir.toFixed(2)}</li>
      </ul>
      <h2>Context Provided</h2>
      <pre>${formValues.additionalContext || "No additional context."}</pre>
      <hr />
      <h2>AI Trend Analysis</h2>
      <p>${analysisResult.trendAnalysis}</p>
      <h2>AI Suggested Improvement Areas</h2>
      <p>${analysisResult.improvementAreas}</p>
      <h2>AI Recommendations</h2>
      <p>${analysisResult.recommendations}</p>
    `;

    // const fileName = `LTIR-Analysis-${new Date().toISOString()}.pdf`;
    // await generatePdfRequest(userId, "ltir-analysis", fileName, htmlContent, {
    //   ...formValues,
    //   calculatedLtir,
    // });

    return { success: true };
  } catch (e: unknown) {
    console.error("Save LTIR Report Action Error:", e);
    const error = e instanceof Error ? e.message : "Failed to save report.";
    return { success: false, error };
  }
}
