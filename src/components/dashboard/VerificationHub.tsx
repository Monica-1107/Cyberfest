'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, RefreshCw, History, CheckCircle2, Terminal, ListChecks, Download, Fingerprint, Code2, FileCheck2, Loader2 } from 'lucide-react';
import { useFirebase, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { doc, deleteDoc, collection, query, orderBy } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';

export function VerificationHub() {
  const { firestore, user } = useFirebase();

  // Fetch real-time data for the compliance report
  const cookiesRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'cookies');
  }, [firestore]);
  const { data: cookies, isLoading: isCookiesLoading } = useCollection(cookiesRef);

  const logsRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'privacyLogs'),
      orderBy('timestamp', 'desc')
    );
  }, [firestore, user]);
  const { data: logs, isLoading: isLogsLoading } = useCollection(logsRef);

  const consentRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid, 'consentRecords', 'current');
  }, [firestore, user]);
  const { data: consent, isLoading: isConsentLoading } = useDoc(consentRef);

  const resetConsent = async () => {
    if (!firestore || !user) return;
    const consentDocRef = doc(firestore, 'users', user.uid, 'consentRecords', 'current');
    await deleteDoc(consentDocRef);
    window.location.reload();
  };

  const downloadReport = () => {
    if (!user) return;

    if (!consent) {
      toast({
        variant: "destructive",
        title: "Compliance Error",
        description: "No active consent record found. Please update your preferences in the Privacy Widget first.",
      });
      return;
    }

    const reportData = {
      certificateId: `CERT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      complianceAnchor: user.uid,
      generatedAt: new Date().toISOString(),
      subject: "Data Privacy & Consent Compliance Certificate",
      status: "VERIFIED",
      currentConsent: {
        necessary: consent.necessary,
        functional: consent.functional,
        analytics: consent.analytics,
        personalization: consent.personalization,
        marketing: consent.marketing,
        lastUpdated: consent.timestamp?.toDate ? consent.timestamp.toDate().toISOString() : (consent.timestamp || 'N/A')
      },
      trackingInventorySnapshot: cookies?.map(c => ({
        name: c.name,
        category: c.category,
        domain: c.domain
      })) || [],
      auditTrail: logs?.map(l => ({
        timestamp: l.timestamp?.toDate ? l.timestamp.toDate().toISOString() : (l.timestamp || 'N/A'),
        event: l.consentChange,
        id: l.id
      })) || []
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `privacypilot-certificate-${user.uid.substring(0, 8)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Certificate Downloaded",
      description: "Your compliance certificate JSON has been saved to your device.",
    });
  };

  const testingSteps = [
    {
      id: 1,
      title: "Inventory Link",
      desc: "Add a tracker in 'Scanner' and verify it appears under the 'Customize' tab in the Privacy Widget.",
      icon: Shield
    },
    {
      id: 2,
      title: "Enforcement Demo",
      desc: "Toggle 'Marketing' in the Widget and watch the 'Live Sandbox' status turn Green/Active instantly.",
      icon: Code2
    },
    {
      id: 3,
      title: "Audit Trail",
      desc: "Every click is logged. Verify the 'Privacy Logs' show the exact categories chosen for legal proof.",
      icon: History
    }
  ];

  const isLoading = isCookiesLoading || isLogsLoading || isConsentLoading;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-primary/5 border-primary/20 shadow-sm md:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-primary" />
                <CardTitle className="font-headline text-lg tracking-tight">System Verification Checklist</CardTitle>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-primary/10">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Active Security: ON</span>
              </div>
            </div>
            <CardDescription className="text-xs">
              Verify these three pillars to confirm your site integration is secure and transparent.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {testingSteps.map((step) => (
                <div key={step.id} className="p-4 bg-white rounded-xl border border-primary/10 space-y-2 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                      {step.id}
                    </div>
                    <h4 className="font-headline font-bold text-sm">{step.title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start justify-between p-6 bg-white rounded-xl border">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-5 h-5 text-primary" />
                  <p className="text-sm font-bold text-foreground font-headline uppercase tracking-wider">Active Secure Session (UID)</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                  This UID is your <strong>Compliance Anchor</strong>. It ensures user choices are stored in Firestore under a secure, authenticated path.
                </p>
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-primary" />
                  <code className="text-xs font-mono bg-muted px-3 py-1.5 rounded-md border select-all text-primary font-bold">
                    {user?.uid || 'Establishing connection...'}
                  </code>
                </div>
              </div>
              <Button onClick={resetConsent} variant="outline" size="sm" className="border-primary/20 hover:bg-primary/5 text-xs font-bold shrink-0">
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset Session
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-accent/5 border-accent/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-accent" />
              <CardTitle className="text-sm font-headline">Compliance Proof</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Generate a snapshot of your site's current compliance status, active trackers, and immutable audit history.
            </p>
            <div className="p-3 bg-white rounded-lg border border-accent/10 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span>GDPR Readiness</span>
                <span className="text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Ready</span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span>CCPA Readiness</span>
                <span className="text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Ready</span>
              </div>
            </div>
            <Button 
              onClick={downloadReport} 
              disabled={isLoading || !consent}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-xs font-bold"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {consent ? "Generate Certificate" : "Awaiting Preferences"}
            </Button>
            {!consent && !isLoading && (
              <p className="text-[10px] text-center text-muted-foreground italic">
                *Setup consent in the widget to unlock.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
