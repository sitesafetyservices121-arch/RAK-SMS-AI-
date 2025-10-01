declare module 'mammoth' {
  export interface MammothOptions {
    styleMap?: string[];
    includeDefaultStyles?: boolean;
    convertImage?: (image: any) => Promise<{ src: string }>;
    ignoreEmptyParagraphs?: boolean;
    idPrefix?: string;
    transformDocument?: (element: any) => any;
  }

  export interface MammothResult {
    value: string;
    messages: {
      type: 'warning' | 'error';
      message: string;
    }[];
  }

  export function convertToHtml(
    input: { arrayBuffer: ArrayBuffer } | { path: string },
    options?: MammothOptions
  ): Promise<MammothResult>;

  export function extractRawText(
    input: { arrayBuffer: ArrayBuffer } | { path: string }
  ): Promise<MammothResult>;

  export const images: {
    dataUri: (image: any) => Promise<{ src: string }>;
  };
}
