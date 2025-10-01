import data from "./placeholder-images.json";

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

// Ensure we always get an array and type-check the contents
export const placeholderImages: ImagePlaceholder[] =
  (data.placeholderImages as ImagePlaceholder[]) ?? [];
