'use server';
/**
 * @fileOverview Provides age-specific dosage guidance for a given medication.
 *
 * - getDosageRecommendation - A function that takes medication name and age as input and returns a dosage recommendation.
 * - DosageRecommendationInput - The input type for the getDosageRecommendation function.
 * - DosageRecommendationOutput - The return type for the getDosageRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DosageRecommendationInputSchema = z.object({
  medicationName: z.string().describe('The name of the medication.'),
  age: z.number().describe('The age of the patient in years.'),
});
export type DosageRecommendationInput = z.infer<typeof DosageRecommendationInputSchema>;

const DosageRecommendationOutputSchema = z.object({
  dosage: z.string().describe('The recommended dosage for the given medication and age.'),
  unit: z.string().describe('The units used for the dosage.'),
  notes: z.string().optional().describe('Important notes/considerations for this dosage.'),
});
export type DosageRecommendationOutput = z.infer<typeof DosageRecommendationOutputSchema>;

export async function getDosageRecommendation(input: DosageRecommendationInput): Promise<DosageRecommendationOutput> {
  return ageSpecificDosageGuidanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'ageSpecificDosageGuidancePrompt',
  input: {schema: DosageRecommendationInputSchema},
  output: {schema: DosageRecommendationOutputSchema},
  prompt: `You are a pharmacist providing dosage recommendations.

  Based on the medication name and age provided, determine the appropriate dosage.

  Medication Name: {{{medicationName}}}
  Age: {{{age}}}

  Consider standard dosing guidelines, age-related factors, and any relevant precautions.
  Return the dosage, unit, and any important notes in the JSON format.`,
});

const ageSpecificDosageGuidanceFlow = ai.defineFlow(
  {
    name: 'ageSpecificDosageGuidanceFlow',
    inputSchema: DosageRecommendationInputSchema,
    outputSchema: DosageRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
