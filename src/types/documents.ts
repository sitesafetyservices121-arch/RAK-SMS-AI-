export type Document = {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly subCategory: string;
  readonly version: string;
  readonly lastUpdated: Date; // Enforce proper typing
  readonly type: "pdf" | "docx" | "xlsx" | "txt" | "other";
  readonly downloadURL: string;
  readonly fileName: string;
};
