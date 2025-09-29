"use server";

import {
  indexDocument,
  type IndexDocumentInput,
} from "@/ai/flows/ai-document-indexer";

export async function indexDocumentAction(input: IndexDocumentInput) {
  try {
    const output = await indexDocument(input);
    return { success: true, data: output };
  } catch (e: any) {
    console.error(e);
    return { success: false, error: e.message };
  }
}
