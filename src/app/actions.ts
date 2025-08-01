'use server';

import { drugInteractionAnalysis, DrugInteractionAnalysisInput } from '@/ai/flows/drug-interaction-analysis';

export async function performAnalysis(input: DrugInteractionAnalysisInput) {
  try {
    const result = await drugInteractionAnalysis(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error during analysis:', error);
    // In a real app, you might want to log this error to a monitoring service
    return { success: false, error: 'An unexpected error occurred while analyzing medications. Please try again later.' };
  }
}
