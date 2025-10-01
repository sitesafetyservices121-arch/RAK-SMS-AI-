export type Document = {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  version: string;
  lastUpdated: string; // Consider using Date if you’ll parse/compare
  type: string;        // Could be "pdf" | "docx" | "xlsx" | etc.
  downloadURL: string;
  fileName: string;
};
