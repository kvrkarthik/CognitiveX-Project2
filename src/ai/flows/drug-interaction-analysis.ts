'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing potential drug interactions.
 *
 * - drugInteractionAnalysis - Analyzes a list of medications for potential interactions.
 * - DrugInteractionAnalysisInput - The input type for the drugInteractionAnalysis function.
 * - DrugInteractionAnalysisOutput - The return type for the drugInteractionAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DrugInteractionAnalysisInputSchema = z.object({
  medications: z
    .array(z.string())
    .describe('A list of medications to analyze for interactions.'),
  age: z.number().describe('The age of the patient.'),
});
export type DrugInteractionAnalysisInput = z.infer<
  typeof DrugInteractionAnalysisInputSchema
>;

const DrugInteractionAnalysisOutputSchema = z.object({
  analysisResults: z
    .string()
    .describe('The analysis results of potential drug interactions.'),
  dosageRecommendation: z
    .string()
    .describe('Dosage recommendations based on patient age.'),
  alternativeMedications: z
    .string()
    .describe('Suggestions for alternative medications.'),
});
export type DrugInteractionAnalysisOutput = z.infer<
  typeof DrugInteractionAnalysisOutputSchema
>;

export async function drugInteractionAnalysis(
  input: DrugInteractionAnalysisInput
): Promise<DrugInteractionAnalysisOutput> {
  return drugInteractionAnalysisFlow(input);
}

const drugInteractionAnalysisPrompt = ai.definePrompt({
  name: 'drugInteractionAnalysisPrompt',
  input: {schema: DrugInteractionAnalysisInputSchema},
  output: {schema: DrugInteractionAnalysisOutputSchema},
  prompt: `You are a pharmacist expert in drug interactions and age-appropriate dosages.

  Analyze the following list of medications for potential interactions, and suggest age-appropriate dosages for a patient of age: {{age}}.

  Medications: {{#each medications}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

  Provide analysis results, dosage recommendations, and suggestions for alternative medications if any interactions are found.

  Be sure to explain your reasoning.

  Format your response as follows:

  Analysis Results: [analysis of potential drug interactions]
  Dosage Recommendation: [dosage recommendations based on patient age]
  Alternative Medications: [suggestions for alternative medications] `,
});

const drugInteractionAnalysisFlow = ai.defineFlow(
  {
    name: 'drugInteractionAnalysisFlow',
    inputSchema: DrugInteractionAnalysisInputSchema,
    outputSchema: DrugInteractionAnalysisOutputSchema,
  },
  async input => {
    const {output} = await drugInteractionAnalysisPrompt(input);
    return output!;
  }
);
