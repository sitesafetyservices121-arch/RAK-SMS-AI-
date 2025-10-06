export type PpeItemCategory = "Head" | "Feet" | "Body" | "Hands" | "Other";

export type PpeItem = {
  id: string;
  name: string;
  category: PpeItemCategory;
  validityMonths?: number;
};

export type PpeRegisterEntry = {
  id?: string;
  employeeId: string;
  ppeItemId: string;
  dateIssued: string;
  validUntil: string;
  signature: "Signed" | "Pending";
};
