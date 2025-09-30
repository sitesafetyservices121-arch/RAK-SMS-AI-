import { config } from 'dotenv';
config(); // Load environment variables before anything else

// Just importing your flows is enough for Genkit CLI/runtime to register them
import '@/ai/flows/ai-she-plan-from-prompt.ts';
import '@/ai/flows/ai-hira-generator.ts';
import '@/ai/flows/ai-ohs-act-consultant.ts';
import '@/ai/flows/ai-ltir-trend-analysis.ts';
import '@/ai/flows/ai-safe-work-procedure-generator.ts';
import '@/ai/flows/ai-method-statement-generator.ts';
import '@/ai/flows/ai-document-indexer.ts';
import '@/ai/flows/ai-model-inspector.ts';

