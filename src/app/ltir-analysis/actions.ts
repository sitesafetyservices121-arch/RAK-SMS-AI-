"use server";

import { analyzeLtirTrend } from "@/ai/flows/ai-ltir-trend-analysis";

export type AnalyzeLtirTrendInput = {
  numberOfInjuries: number;
  totalHoursWorked: number;
  additionalContext?: string;
};

export type AnalyzeLtirTrendOutput = {
  trendAnalysis: string;
  improvementAreas: string;
  recommendations: string;
  ltir?: number;
  interpretation?: string;
};

type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function analyzeLtirAction(
  input: AnalyzeLtirTrendInput
): Promise<ActionResponse<AnalyzeLtirTrendOutput>> {
  try {
    const output = await analyzeLtirTrend(input);
    return { success: true, data: output };
  } catch (e: unknown) {
    console.error(e);
    const error = e instanceof Error ? e.message : "An unknown error occurred.";
    return { success: false, error };
  }
}
