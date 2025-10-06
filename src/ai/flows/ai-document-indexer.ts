
'use server';
/**
 * @fileOverview A flow for indexing documents into a vector database.
 * This flow takes a document as a data URI, chunks it, generates embeddings,
 * and stores the vectors in an in-memory vector database.
 * NOTE: This functionality is temporarily disabled to resolve a build issue.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { db, Timestamp } from "@/lib/firebase-admin";


const IndexDocumentInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "The document to index, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  category: z.string(),
  section: z.string(),
  fileName: z.string(),
});
type IndexDocumentInput = z.infer<typeof IndexDocumentInputSchema>;

const IndexDocumentOutputSchema = z.object({
  success: z.boolean(),
  chunksIndexed: z.number(),
  message: z.string().optional(),
});
type IndexDocumentOutput = z.infer<typeof IndexDocumentOutputSchema>;

export async function indexDocument(input: IndexDocumentInput): Promise<IndexDocumentOutput> {
  return indexDocumentFlow(input);
}

const indexDocumentFlow = ai.defineFlow(
  {
    name: 'indexDocumentFlow',
    inputSchema: IndexDocumentInputSchema,
    outputSchema: IndexDocumentOutputSchema,
  },
  async (input) => {
    // Temporarily disabled due to build issues with vectordb
    console.warn("Document indexing is temporarily disabled.");

    const docRef = db.collection("documents").doc();
    const metadata = {
      id: docRef.id,
      name: input.fileName,
      category: input.category,
      section: input.section,
      storagePath: "", // Placeholder, as actual storage is not implemented here
      downloadURL: "", // Placeholder
      type: "", // Placeholder
      size: 0, // Placeholder
      version: "1.0",
      createdBy: "AI Builder", // Or actual user ID if available
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await docRef.set(metadata);

    return { success: true, chunksIndexed: 0, message: "Indexing is disabled. Metadata saved to Firestore." };
  }
);


// This is a helper flow for retrieving from the vector store.
// It is not exported to the client but used by the consultant flow.
export const retrieveSimilarChunksFlow = ai.defineFlow(
  {
    name: 'retrieveSimilarChunksFlow',
    inputSchema: z.string(),
    outputSchema: z.array(z.string()),
  },
  async () => {
    // Temporarily disabled
    return [];
  }
);
