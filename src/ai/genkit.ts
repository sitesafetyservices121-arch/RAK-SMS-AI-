import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/google-genai";

// Lazy initialization to avoid blocking app startup
let _ai: ReturnType<typeof genkit> | null = null;

function getAI() {
  if (!_ai) {
    _ai = genkit({
      plugins: [googleAI()],
    });
  }
  return _ai;
}

export const ai = getAI();

// Convenience wrapper so you don't repeat the model name everywhere
export async function generateWithGemini(prompt: string) {
  const aiInstance = getAI();
  return aiInstance.generate({
    model: "googleai/gemini-1.5-flash-001",
    prompt,
  });
}
