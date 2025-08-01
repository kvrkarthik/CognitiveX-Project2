'use server';

/**
 * @fileOverview Suggests alternative medications based on identified interactions or contraindications.
 *
 * - suggestAlternativeMeds - A function that suggests alternative medications.
 * - SuggestAlternativeMedsInput - The input type for the suggestAlternativeMeds function.
 * - SuggestAlternativeMedsOutput - The return type for the suggestAlternativeMeds function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestAlternativeMedsInputSchema = z.object({
  medications: z
    .string()
    .describe('List of medications the patient is taking, separated by commas.'),
  interactions: z
    .string()
    .describe('The detected harmful interactions between the medications.'),
});
export type SuggestAlternativeMedsInput = z.infer<typeof SuggestAlternativeMedsInputSchema>;

const SuggestAlternativeMedsOutputSchema = z.object({
  alternatives: z
    .string()
    .describe('Suggested alternative medications to avoid the harmful interactions.'),
});
export type SuggestAlternativeMedsOutput = z.infer<typeof SuggestAlternativeMedsOutputSchema>;

export async function suggestAlternativeMeds(
  input: SuggestAlternativeMedsInput
): Promise<SuggestAlternativeMedsOutput> {
  return suggestAlternativeMedsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestAlternativeMedsPrompt',
  input: {schema: SuggestAlternativeMedsInputSchema},
  output: {schema: SuggestAlternativeMedsOutputSchema},
  prompt: `You are a pharmacist. Given the following list of medications and their interactions, suggest safer alternative medications to avoid these interactions. Focus on suggesting alternatives that serve the same purpose but do not cause the harmful interactions.

Medications: {{{medications}}}
Interactions: {{{interactions}}}

Suggest alternative medications:
`,
});

const suggestAlternativeMedsFlow = ai.defineFlow(
  {
    name: 'suggestAlternativeMedsFlow',
    inputSchema: SuggestAlternativeMedsInputSchema,
    outputSchema: SuggestAlternativeMedsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
