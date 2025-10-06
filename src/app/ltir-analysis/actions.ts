"use server";

import { analyzeLtirTrend } from "@/ai/flows/ai-ltir-trend-analysis";
// import { generatePdfRequest } from "@/lib/pdf";

import { ActionResponse } from "@/types/action-response";
import { AnalyzeLtirTrendInput, AnalyzeLtirTrendOutput, SaveLtirReportInput } from "@/types/ltir-analysis";

export async function analyzeLtirAction(
  input: AnalyzeLtirTrendInput
): Promise<ActionResponse<AnalyzeLtirTrendOutput>> {
  try {
    const output = await analyzeLtirTrend(input);
    const data: AnalyzeLtirTrendOutput = {
      trendAnalysis: output.trendAnalysis || "No trend analysis provided.",
      improvementAreas: output.improvementAreas || "No improvement areas identified.",
      recommendations: output.recommendations || "No recommendations provided.",
      ltir: output.ltir,
      interpretation: output.interpretation,
    };
    return { success: true, data: data, storagePath: "" };
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
