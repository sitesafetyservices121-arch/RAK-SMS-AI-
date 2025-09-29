'use server';

import { generateMethodStatement, GenerateMethodStatementInputSchema, type GenerateMethodStatementInput } from '@/ai/flows/ai-method-statement-generator';

export async function generateMethodStatementAction(input: GenerateMethodStatementInput) {
    try {
        const validatedInput = GenerateMethodStatementInputSchema.parse(input);
        const result = await generateMethodStatement(validatedInput);
        return { success: true, data: result };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Failed to generate method statement. Please try again.' };
    }
}
