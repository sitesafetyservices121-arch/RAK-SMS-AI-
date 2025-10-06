export type OhsActConsultantInput = {
  query: string;
  history?: { role: string; content: string }[];
  documentDataUri?: string;
};

export type OhsActConsultantResponse =
  | { success: true; data: unknown }
  | { success: false; error: string };
