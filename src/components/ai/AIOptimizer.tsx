
'use client';

import React, { useState } from 'react';
import { Sparkles, Send, Loader2, BrainCircuit, Check, Info, Target, Zap, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { optimizeConsentRequests } from '@/ai/flows/optimize-consent-requests';
import ReactMarkdown from 'react-markdown';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export function AIOptimizer() {
  const [data, setData] = useState('');
  const [websiteType, setWebsiteType] = useState('E-commerce Platform');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ suggestions: string; rationale: string } | null>(null);

  const scenarios = [
    {
      label: 'High Mobile Bounce',
      type: 'E-commerce Platform',
      text: 'Bounce rate is 55% on mobile. Marketing consent is only 8%. Banner covers 30% of the screen.'
    },
    {
      label: 'Low Feature Analytics',
      type: 'SaaS Dashboard',
      text: 'Only 15% analytics opt-in. Need data to improve product. Wording is very legalistic.'
    },
    {
      label: 'Trust Building',
      type: 'Content/Blog Site',
      text: '70% decline all cookies. Want to explain that analytics helps us choose better topics.'
    }
  ];

  const handleOptimize = async () => {
    if (!data) return;
    setIsLoading(true);
    try {
      const output = await optimizeConsentRequests({
        consentData: data,
        websiteType
      });
      setResult(output);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const selectScenario = (s: typeof scenarios[0]) => {
    setWebsiteType(s.type);
    setData(s.text);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card className="bg-white shadow-sm h-fit">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-primary" />
                <CardTitle className="font-headline">AI Consent Optimizer</CardTitle>
              </div>
              <CardDescription>
                Input your current consent metrics to receive AI-powered optimization suggestions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                  <Lightbulb className="w-3 h-3" /> Quick Scenarios
                </label>
                <div className="flex flex-wrap gap-2">
                  {scenarios.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => selectScenario(s)}
                      className="text-[10px] px-2 py-1 rounded-full border border-primary/20 hover:bg-primary/5 hover:border-primary transition-colors font-medium text-primary"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Website Category</label>
                <select 
                  className="w-full p-2 rounded-md border border-input bg-background"
                  value={websiteType}
                  onChange={(e) => setWebsiteType(e.target.value)}
                >
                  <option>E-commerce Platform</option>
                  <option>Content/Blog Site</option>
                  <option>SaaS Dashboard</option>
                  <option>Non-Profit/Informational</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Consent Data / Metrics</label>
                <Textarea
                  placeholder="e.g. Current bounce rate: 45%, Marketing consent opt-in: 12%, Analytics opt-in: 30%. User feedback: 'Too many buttons'."
                  className="min-h-[150px]"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                />
              </div>
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-white" 
                onClick={handleOptimize}
                disabled={isLoading || !data}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generate Optimization Plan
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/10">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm font-headline">How it works</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="border-none">
                  <AccordionTrigger className="text-xs font-semibold py-2 hover:no-underline">The Strategy</AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground space-y-2">
                    <p>The AI Optimizer acts as a Privacy UX consultant. It analyzes the friction between compliance (GDPR/CCPA) and your business goals.</p>
                    <div className="flex gap-2 items-start">
                      <Target className="w-3 h-3 mt-0.5 text-primary shrink-0" />
                      <span>Identifies low-trust wording that causes users to bounce.</span>
                    </div>
                    <div className="flex gap-2 items-start">
                      <Zap className="w-3 h-3 mt-0.5 text-primary shrink-0" />
                      <span>Suggests specific UI micro-copy to improve opt-in rates.</span>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {!result && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] border-2 border-dashed rounded-xl border-primary/10 bg-white/50 text-center p-8">
              <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-primary/40" />
              </div>
              <h3 className="font-headline text-lg mb-2">Ready to optimize</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Fill in your data on the left to see recommendations for improving user trust and consent rates.
              </p>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-white rounded-xl shadow-sm animate-pulse">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
              <p className="text-sm font-medium text-primary">PrivacyPilot AI is analyzing...</p>
            </div>
          )}

          {result && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
              <Card className="bg-accent/5 border-accent/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-headline flex items-center gap-2">
                    <Check className="w-4 h-4 text-accent" /> Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <ReactMarkdown>{result.suggestions}</ReactMarkdown>
                </CardContent>
              </Card>
              <Card className="bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-headline">Strategic Rationale</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none text-muted-foreground">
                  <ReactMarkdown>{result.rationale}</ReactMarkdown>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
