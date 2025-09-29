'use server';

import { generateSafeWorkProcedure, GenerateSafeWorkProcedureInputSchema, type GenerateSafeWorkProcedureInput } from '@/ai/flows/ai-safe-work-procedure-generator';

export async function generateSwpAction(input: GenerateSafeWorkProcedureInput) {
    try {
        const validatedInput = GenerateSafeWorkProcedureInputSchema.parse(input);
        const result = await generateSafeWorkProcedure(validatedInput);
        return { success: true, data: result };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Failed to generate safe work procedure. Please try again.' };
    }
}
