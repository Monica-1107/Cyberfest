'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Terminal, Copy, Check, ExternalLink, Code2, ShieldCheck, Lock, Cpu, Globe, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

export function IntegrationGuide() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({
      title: "Copied to clipboard",
      description: "You can now paste this snippet into your project.",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const codeSnippets = {
    secureReact: `// 1. Policy-Aware React Integration
import { useEffect } from 'react';
import { policyEngine } from '@/lib/policy-engine';

export function AnalyticsTracker() {
  useEffect(() => {
    // The Policy Engine acts as the absolute gatekeeper
    const initTracker = () => {
      if (policyEngine.checkConsent('analytics')) {
        console.log('Authorized: Initializing Google Analytics...');
        // window.gtag('config', 'UA-XXXXX-Y');
      }
    };

    // Initialize on mount
    initTracker();

    // Subscribe to real-time changes if the user updates choices
    const unsubscribe = policyEngine.subscribe((state) => {
      if (state.analytics) {
        initTracker();
      } else {
        console.log('Revoked: Terminating Analytics sessions.');
        // Logic to clear cookies/sessions
      }
    });

    return () => unsubscribe();
  }, []);

  return null;
}`,
    vanilla: `// 2. Vanilla JS / Legacy Script Integration
// Listen for the secure broadcast event from the PrivacyPilot Widget
window.addEventListener('pp_policy_update', (event) => {
  const { analytics, marketing } = event.detail;
  
  if (analytics) {
    console.log('User authorized Analytics. Injecting scripts...');
    // Programmatically load tracking scripts
    const script = document.createElement('script');
    script.src = 'https://www.googletagmanager.com/gtag/js?id=UA-ID';
    document.head.appendChild(script);
  }
});`,
    securityRules: `// 3. Backend Enforcement (firestore.rules)
// This ensures that only the authenticated user can access their own choices.
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/consentRecords/current {
      allow get, write: if request.auth != null 
                        && request.auth.uid == userId;
    }
    
    match /users/{userId}/privacyLogs/{logId} {
      allow get: if request.auth.uid == userId;
      allow create: if request.auth.uid == userId;
    }
  }
}`
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 bg-white shadow-sm overflow-hidden border-none">
          <CardHeader className="border-b bg-muted/5">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              <CardTitle className="font-headline text-xl">Security Integration Protocol</CardTitle>
            </div>
            <CardDescription>
              Follow these three pillars to implement transparent and secure tracking enforcement.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="react" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50 p-1">
                <TabsTrigger value="react" className="font-headline text-xs font-bold">React Hook</TabsTrigger>
                <TabsTrigger value="vanilla" className="font-headline text-xs font-bold">Vanilla Event</TabsTrigger>
                <TabsTrigger value="auth" className="font-headline text-xs font-bold">Cloud Rules</TabsTrigger>
              </TabsList>
              
              <TabsContent value="react" className="space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 text-[10px] font-bold text-primary bg-primary/5 p-2 rounded uppercase tracking-widest">
                  <ShieldCheck className="w-3 h-3" />
                  Recommended: Policy-Aware Components
                </div>
                <div className="relative group">
                  <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg text-[11px] overflow-x-auto font-mono leading-relaxed max-h-[400px]">
                    {codeSnippets.secureReact}
                  </pre>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 text-slate-400 hover:text-white"
                    onClick={() => copyToClipboard(codeSnippets.secureReact, 'react')}
                  >
                    {copiedId === 'react' ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="vanilla" className="space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 text-[10px] font-bold text-accent bg-accent/5 p-2 rounded uppercase tracking-widest">
                  <Globe className="w-3 h-3" />
                  Vanilla JS: Global Event Listener
                </div>
                <div className="relative group">
                  <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg text-[11px] overflow-x-auto font-mono leading-relaxed max-h-[400px]">
                    {codeSnippets.vanilla}
                  </pre>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 text-slate-400 hover:text-white"
                    onClick={() => copyToClipboard(codeSnippets.vanilla, 'vanilla')}
                  >
                    {copiedId === 'vanilla' ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="auth" className="space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 text-[10px] font-bold text-orange-600 bg-orange-50 p-2 rounded uppercase tracking-widest">
                  <Lock className="w-3 h-3" />
                  Enforcement: Backend Security Rules
                </div>
                <div className="relative group">
                  <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg text-[11px] overflow-x-auto font-mono max-h-[400px]">
                    {codeSnippets.securityRules}
                  </pre>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 text-slate-400 hover:text-white"
                    onClick={() => copyToClipboard(codeSnippets.securityRules, 'rules')}
                  >
                    {copiedId === 'rules' ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-primary text-white border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-headline flex items-center gap-2">
                <Cpu className="w-5 h-5" /> Enforcement Engine
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm">
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold shrink-0">1</div>
                <div className="space-y-1">
                  <p className="font-bold leading-none">Identity Hook</p>
                  <p className="text-white/70 text-[11px]">Anonymous Auth establishes the secure UID required for persistence.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold shrink-0">2</div>
                <div className="space-y-1">
                  <p className="font-bold leading-none">Firestore Sync</p>
                  <p className="text-white/70 text-[11px]">Choices are saved to the cloud, allowing policy enforcement across any device.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold shrink-0">3</div>
                <div className="space-y-1">
                  <p className="font-bold leading-none">Real-Time Broadcast</p>
                  <p className="text-white/70 text-[11px]">PolicyEngine notifies all browser components to block or allow scripts instantly.</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="p-4 bg-accent/5 rounded-xl border border-accent/10 flex items-start gap-3">
            <Key className="w-5 h-5 text-accent mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-accent">Deployment Tip</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Always set <b>Authorized Domains</b> in your Firebase settings to prevent third-party sites from spoofing your consent records.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
