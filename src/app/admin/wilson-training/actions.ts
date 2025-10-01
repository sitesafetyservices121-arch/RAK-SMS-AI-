"use server";

import { indexDocument } from "@/ai/flows/ai-document-indexer";

export type IndexDocumentInput = {
  documentDataUri: string;
};

export type IndexDocumentResponse =
  | { success: true; data: { chunksIndexed: number } }
  | { success: false; error: string };

export async function indexDocumentAction(
  input: IndexDocumentInput
): Promise<IndexDocumentResponse> {
  try {
    const output: { chunksIndexed: number } = await indexDocument(input);
    return { success: true, data: output };
  } catch (e: unknown) {
    console.error(e);
    const message =
      e instanceof Error ? e.message : "An unknown error occurred";
    return { success: false, error: message };
  }
}
