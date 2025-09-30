"use server";

import {
  indexDocument,
} from "@/ai/flows/ai-document-indexer";

type IndexDocumentInput = {
  documentDataUri: string;
};

export async function indexDocumentAction(input: IndexDocumentInput) {
  try {
    const output = await indexDocument(input);
    return { success: true, data: output };
  } catch (e: any) {
    console.error(e);
    return { success: false, error: e.message };
  }
}
