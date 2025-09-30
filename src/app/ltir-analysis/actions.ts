"use server";

import {
  analyzeLtirTrend,
} from "@/ai/flows/ai-ltir-trend-analysis";

type AnalyzeLtirTrendInput = {
    numberOfInjuries: number;
    totalHoursWorked: number;
    additionalContext?: string;
}

export async function analyzeLtirAction(input: AnalyzeLtirTrendInput) {
  try {
    const output = await analyzeLtirTrend(input);
    return { success: true, data: output };
  } catch (e: any) {
    console.error(e);
    return { success: false, error: e.message };
  }
}
