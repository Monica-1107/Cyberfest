import { NextResponse } from 'next/server';
import { optimizeConsentRequests } from '@/ai/flows/optimize-consent-requests';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate input
    if (!body.consentData || !body.websiteType) {
      return NextResponse.json(
        { error: 'Missing required fields: consentData and websiteType' },
        { status: 400 }
      );
    }

    // Call AI optimization flow
    const result = await optimizeConsentRequests(body);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('AI Optimization Error:', error);
    
    // Fallback response for testing
    return NextResponse.json({
      suggestions: `## Test Suggestions\n\n1. **Simplify Wording**: Replace legalistic terms with user-friendly language\n\n2. **Clear Benefits**: Explain exactly how data helps users\n\n3. **Better Visual Hierarchy**: Make "Accept" more prominent`,
      rationale: `## Test Rationale\n\nThese suggestions focus on building user trust through transparency and clear value propositions.`
    });
  }
}
