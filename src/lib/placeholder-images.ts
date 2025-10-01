// ==============================
// Placeholder Images Loader
// ==============================

import placeholderData from "./placeholder-images.json"; // <-- added semicolon

// ==============================
// Types
// ==============================

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

// ==============================
// Data
// ==============================

/**
 * Strongly typed placeholder images loaded from JSON.
 */
export const placeholderImages: ImagePlaceholder[] = Array.isArray(
  (placeholderData as any).placeholderImages
)
  ? ((placeholderData as any).placeholderImages as ImagePlaceholder[])
  : [];
