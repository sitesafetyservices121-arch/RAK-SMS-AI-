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

export type SaveLtirReportInput = {
  userId: string;
  calculatedLtir: number;
  formValues: AnalyzeLtirTrendInput;
  analysisResult: AnalyzeLtirTrendOutput;
};
