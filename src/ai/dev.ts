import { config } from "dotenv";

// Load environment variables from .env before anything else
config();

// Import Genkit flows to register them with the runtime/CLI
import "@/ai/flows/ai-she-plan-from-prompt";
import "@/ai/flows/ai-hira-generator";
import "@/ai/flows/ai-ohs-act-consultant";
import "@/ai/flows/ai-ltir-trend-analysis";
import "@/ai/flows/ai-safe-work-procedure-generator";
import "@/ai/flows/ai-method-statement-generator";
import "@/ai/flows/ai-document-indexer";
import "@/ai/flows/ai-model-inspector";

// You don’t need to export anything here.
// This file just serves as the central bootstrapper for Genkit flows.
