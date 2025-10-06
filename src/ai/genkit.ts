import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/google-genai";

// Create the shared Genkit instance with Google AI plugin
export const ai = genkit({
  plugins: [googleAI()],
});

// Convenience wrapper so you don’t repeat the model name everywhere
export async function generateWithGemini(prompt: string) {
  return ai.generate({
    model: "googleai/gemini-1.5-flash-001",
    prompt,
  });
}
