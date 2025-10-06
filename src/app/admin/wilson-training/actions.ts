"use server";

import { indexDocument } from "@/ai/flows/ai-document-indexer";

import { IndexDocumentInput, IndexDocumentResponse } from "@/types/wilson-training";

export async function indexDocumentAction(
  input: IndexDocumentInput
): Promise<IndexDocumentResponse> {
  try {
    const output = await indexDocument(input);
    if (output.success) {
      return { success: true, data: { chunksIndexed: output.chunksIndexed } };
    } else {
      return { success: false, error: output.message || "Indexing failed." };
    }
  } catch (e: unknown) {
    console.error(e);
    const message =
      e instanceof Error ? e.message : "An unknown error occurred";
    return { success: false, error: message };
  }
}
