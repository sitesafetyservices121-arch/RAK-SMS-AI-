'use server';

import { analyzeLtirTrend, type AnalyzeLtirTrendInput } from '@/ai/flows/ai-ltir-trend-analysis';

export async function analyzeLtirAction(input: AnalyzeLtirTrendInput) {
  try {
    const result = await analyzeLtirTrend(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to analyze LTIR data. Please try again.' };
  }
}
