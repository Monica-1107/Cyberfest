'use client';

import React from 'react';
import { Overview } from '@/components/dashboard/Overview';
import { CookieList } from '@/components/dashboard/CookieList';
import { LogViewer } from '@/components/logs/LogViewer';
import { AIOptimizer } from '@/components/ai/AIOptimizer';
import { IntegrationGuide } from '@/components/docs/IntegrationGuide';
import { VerificationHub } from '@/components/dashboard/VerificationHub';
import { LiveSandbox } from '@/components/demo/LiveSandbox';
import { PrivacyWidget } from '@/components/widget/PrivacyWidget';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Cookie, History, Sparkles, BookOpen, Lock, CheckCircle2, PlayCircle } from 'lucide-react';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

/**
 * PrivacyPilot Dashboard
 * 
 * This is the central hub for the compliance management system.
 * It integrates all four deliverables: Widget, Policy Engine, Logs, and Integration Guide.
 */
export default function PrivacyPilotDashboard() {
  const { firestore, user } = useFirebase();

  // Get current active consent state for header status
  const consentRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid, 'consentRecords', 'current');
  }, [firestore, user]);
  const { data: consent } = useDoc(consentRef);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-primary text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-white p-1.5 rounded-lg">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-xl font-headline font-bold tracking-tight">PrivacyPilot</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-block text-xs font-semibold bg-white/10 px-3 py-1 rounded-full uppercase tracking-widest border border-white/20">
              Active Compliance Protocol
            </span>
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center border-2 border-white/20">
              <Lock className="w-4 h-4 text-accent-foreground" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 mt-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-headline font-bold text-foreground">Compliance Center</h2>
            <p className="text-muted-foreground">Transparently manage tracking, minimize data collection, and prove compliance.</p>
          </div>
          <div className="bg-white/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-primary/10 flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Enforcement Engine</p>
              <p className="text-sm font-semibold text-primary">
                {consent ? 'Policy Live & Active' : 'Waiting for Choice'}
              </p>
            </div>
            <div className={`w-2 h-2 rounded-full animate-pulse ${consent ? 'bg-accent' : 'bg-orange-500'}`} />
          </div>
        </div>

        <Overview />

        <Tabs defaultValue="verify" className="space-y-6">
          <div className="flex items-center justify-between border-b pb-1 overflow-x-auto">
            <TabsList className="bg-transparent border-none p-0 h-auto gap-8">
              <TabTrigger value="verify" icon={CheckCircle2} label="Compliance Proof" />
              <TabTrigger value="demo" icon={PlayCircle} label="Sample Integration" />
              <TabTrigger value="scanner" icon={Cookie} label="Cookie Inventory" />
              <TabTrigger value="ai" icon={Sparkles} label="AI Optimizer" />
              <TabTrigger value="logs" icon={History} label="Privacy Logs" />
              <TabTrigger value="docs" icon={BookOpen} label="Dev Guide" />
            </TabsList>
          </div>

          <TabsContent value="verify" className="mt-0">
            <VerificationHub />
          </TabsContent>

          <TabsContent value="demo" className="mt-0">
            <LiveSandbox />
          </TabsContent>

          <TabsContent value="scanner" className="mt-0">
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-xl border-none shadow-sm">
                <h3 className="text-xl font-headline mb-4">Tracker Inventory Management</h3>
                <p className="text-sm text-muted-foreground mb-6">Manage the specific cookies and scripts that the Policy Engine will control to ensure total transparency.</p>
                <CookieList />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai" className="mt-0">
            <AIOptimizer />
          </TabsContent>

          <TabsContent value="logs" className="mt-0">
            <div className="bg-white p-6 rounded-xl border-none shadow-sm">
              <div className="mb-4">
                <h3 className="text-xl font-headline text-foreground">Transparent Privacy Logs</h3>
                <p className="text-sm text-muted-foreground">User-readable record of all consent changes and active tracking categories for immutable proof.</p>
              </div>
              <LogViewer />
            </div>
          </TabsContent>

          <TabsContent value="docs" className="mt-0">
            <IntegrationGuide />
          </TabsContent>
        </Tabs>
      </main>

      {/* The Actual Widget being demonstrated */}
      <PrivacyWidget />

      {/* Footer Branding */}
      <footer className="max-w-7xl mx-auto px-4 mt-20 text-center space-y-2 border-t pt-8 pb-10">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Shield className="w-4 h-4" />
          <span className="text-sm font-headline font-semibold">PrivacyPilot Compliance System</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Demonstrating secure, transparent, and user-first consent management in real-time.
        </p>
      </footer>
    </div>
  );
}

function TabTrigger({ value, icon: Icon, label }: { value: string; icon: any; label: string }) {
  return (
    <TabsTrigger 
      value={value} 
      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-0 py-3 flex items-center gap-2 transition-all hover:text-primary/70"
    >
      <Icon className="w-4 h-4" />
      <span className="font-headline font-bold text-sm">{label}</span>
    </TabsTrigger>
  );
}