'use server';
import { ohsActConsultant, type OhsActConsultantInput } from '@/ai/flows/ai-ohs-act-consultant';

export async function askWilsonAction(input: OhsActConsultantInput) {
    try {
        const result = await ohsActConsultant(input);
        return { success: true, data: result };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Failed to get a response. Please try again.' };
    }
}
