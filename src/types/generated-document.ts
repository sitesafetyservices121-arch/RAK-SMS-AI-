export type GeneratedDocumentType =
  | "SHE Plan"
  | "HIRA"
  | "Method Statement"
  | "Safe Work Procedure"
  | "LTIR Report"
  | "Site Resource Report"
  | "PPE Register"
  | "Vehicle Inspection";

export type GeneratedDocument = {
  id: string;
  userId: string;
  documentType: GeneratedDocumentType;
  fileName: string;
  storagePath: string;
  generatedOn: string;
  generatedBy?: string;
  metadata?: Record<string, unknown>;
};
