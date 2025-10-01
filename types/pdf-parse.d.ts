// types/pdf-parse.d.ts
declare module "pdf-parse" {
  export interface PDFInfo {
    PDFFormatVersion: string;
    IsAcroFormPresent: boolean;
    IsXFAPresent: boolean;
    [key: string]: unknown;
  }

  export interface Metadata {
    info: PDFInfo;
    raw?: unknown; // renamed to avoid recursion issue
  }

  export interface PDFData {
    numpages: number;
    numrender: number;
    info: PDFInfo;
    metadata?: Metadata;
    version: string;
    text?: string; // extracted text if enabled
  }

  export interface PDFPageData {
    pageIndex: number;
    pageNumber: number;
    width: number;
    height: number;
    getTextContent: () => Promise<{
      items: Array<{ str: string }>;
      styles: Record<string, unknown>;
    }>;
    getAnnotations: () => Promise<unknown[]>;
    [key: string]: unknown;
  }

  export interface ParseOptions {
    pagerender?: (pageData: PDFPageData) => Promise<string>;
    max?: number; // max pages to parse
    version?: string;
    [key: string]: unknown;
  }

  export default function pdf(
    dataBuffer: import("buffer").Buffer | Uint8Array,
    options?: ParseOptions
  ): Promise<PDFData>;
}
