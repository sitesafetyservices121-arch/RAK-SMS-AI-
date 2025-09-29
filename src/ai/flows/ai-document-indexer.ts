
'use server';
/**
 * @fileOverview A flow for indexing documents into a vector database.
 * This flow takes a document as a data URI, chunks it, generates embeddings,
 * and stores the vectors in an in-memory vector database.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {allMiniLm} from 'genkitx-all-minilm';
import pdf from 'pdf-parse/lib/pdf.js/v1.10.100/build/pdf.js';
import * as vecdb from 'vectordb';

// In-memory vector store. In a real application, you might use a persistent
// vector database like Pinecone or Chroma.
let vectorStore: any | null = null;

// Helper to get or create the vector store.
async function getVectorStore() {
  if (!vectorStore) {
    const db = await vecdb.connect('vectors');
    vectorStore = await db.openTable('documents');
  }
  return vectorStore;
}

export const IndexDocumentInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "The document to index, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type IndexDocumentInput = z.infer<typeof IndexDocumentInputSchema>;

export const IndexDocumentOutputSchema = z.object({
  success: z.boolean(),
  chunksIndexed: z.number(),
});
export type IndexDocumentOutput = z.infer<typeof IndexDocumentOutputSchema>;

export async function indexDocument(input: IndexDocumentInput): Promise<IndexDocumentOutput> {
  return indexDocumentFlow(input);
}

// Simple text chunker
function chunkText(text: string, chunkSize = 1000, overlap = 100): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    const end = Math.min(i + chunkSize, text.length);
    chunks.push(text.slice(i, end));
    i += chunkSize - overlap;
  }
  return chunks;
}

const indexDocumentFlow = ai.defineFlow(
  {
    name: 'indexDocumentFlow',
    inputSchema: IndexDocumentInputSchema,
    outputSchema: IndexDocumentOutputSchema,
  },
  async input => {
    const { documentDataUri } = input;
    const [header, base64Data] = documentDataUri.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1];
    
    let textContent = '';

    if (mimeType === 'application/pdf') {
      const pdfBuffer = Buffer.from(base64Data, 'base64');
      const data = await pdf(pdfBuffer);
      textContent = data.text;
    } else if (mimeType === 'application/json') {
      const jsonBuffer = Buffer.from(base64Data, 'base64');
      textContent = jsonBuffer.toString('utf-8');
    } else if (mimeType?.startsWith('text/')) {
       const textBuffer = Buffer.from(base64Data, 'base64');
       textContent = textBuffer.toString('utf-8');
    } else {
        throw new Error(`Unsupported MIME type: ${mimeType}`);
    }

    const chunks = chunkText(textContent);

    const embeddings = await ai.embed({
      embedder: allMiniLm,
      content: chunks,
    });
    
    const store = await getVectorStore();
    const records = chunks.map((chunk, i) => ({
        vector: embeddings[i],
        text: chunk
    }));

    await store.add(records);

    return { success: true, chunksIndexed: chunks.length };
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
  async (query) => {
    const store = await getVectorStore();
    if (!store) return [];

    const queryEmbedding = await ai.embed({
        embedder: allMiniLm,
        content: query,
    });

    const results = await store.search(queryEmbedding).limit(5).execute();
    return results.map(r => (r as any).text);
  }
);
