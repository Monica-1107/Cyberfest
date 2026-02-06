'use server';

/**
 * @fileOverview AI-powered consent request optimization flow.
 *
 * - optimizeConsentRequests - Analyzes consent data and suggests improvements to consent requests.
 * - OptimizeConsentRequestsInput - The input type for the optimizeConsentRequests function.
 * - OptimizeConsentRequestsOutput - The return type for the optimizeConsentRequests function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeConsentRequestsInputSchema = z.object({
  consentData: z
    .string()
    .describe(
      'A string containing consent data, including the types of consent requests, user responses, and any relevant metrics (e.g., acceptance rates, bounce rates).' 
    ),
  websiteType: z
    .string()
    .describe(
      'A string describing the type of website (e.g., e-commerce, news, blog) for which consent optimization is being performed.'
    ),
});
export type OptimizeConsentRequestsInput = z.infer<typeof OptimizeConsentRequestsInputSchema>;

const OptimizeConsentRequestsOutputSchema = z.object({
  suggestions: z
    .string()
    .describe(
      'A string containing suggestions for optimizing consent requests, including changes to the consent UI, wording, or categories. Use Markdown formatting.'
    ),
  rationale: z
    .string()
    .describe(
      'A string explaining the rationale behind the suggestions, based on the provided consent data and website type. Use Markdown formatting.'
    ),
});
export type OptimizeConsentRequestsOutput = z.infer<typeof OptimizeConsentRequestsOutputSchema>;

export async function optimizeConsentRequests(
  input: OptimizeConsentRequestsInput
): Promise<OptimizeConsentRequestsOutput> {
  return optimizeConsentRequestsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeConsentRequestsPrompt',
  input: {schema: OptimizeConsentRequestsInputSchema},
  output: {schema: OptimizeConsentRequestsOutputSchema},
  prompt: `You are an AI-powered consent optimization tool. Analyze the provided consent data and website type to suggest improvements to the consent requests.

Consent Data: {{{consentData}}}
Website Type: {{{websiteType}}}

Provide clear and actionable suggestions for optimizing consent requests to improve user trust and balance data collection with user preferences. Explain the rationale behind each suggestion.

Output suggestions and rationale in Markdown format.
`,
});

const optimizeConsentRequestsFlow = ai.defineFlow(
  {
    name: 'optimizeConsentRequestsFlow',
    inputSchema: OptimizeConsentRequestsInputSchema,
    outputSchema: OptimizeConsentRequestsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
