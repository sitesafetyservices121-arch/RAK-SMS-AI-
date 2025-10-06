export type IndexDocumentInput = {
  documentDataUri: string;
  category: string;
  section: string;
  fileName: string;
};

export type IndexDocumentResponse =
  | { success: true; data: { chunksIndexed: number } }
  | { success: false; error: string };
