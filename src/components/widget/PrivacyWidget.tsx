'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Check, X, Info, Loader2, Cookie, Ban, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirebase, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, serverTimestamp, collection } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { Badge } from '@/components/ui/badge';
import { policyEngine, type ConsentState } from '@/lib/policy-engine';

/**
 * PrivacyWidget Component
 * 
 * Deliverable: Consent UI widget with granular toggles and clear explanations.
 * Objective: Minimize data collection by providing easy "Necessary Only" opt-out.
 */
export function PrivacyWidget() {
  const { auth, firestore, user, isUserLoading } = useFirebase();
  const [isMinimized, setIsMinimized] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // Load trackers to show specifically which scripts are controlled
  const cookiesRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'cookies');
  }, [firestore]);
  const { data: inventory } = useCollection(cookiesRef);

  useEffect(() => {
    if (!isUserLoading && !user && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  const consentRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid, 'consentRecords', 'current');
  }, [firestore, user]);

  const { data: consent, isLoading: isConsentLoading } = useDoc(consentRef);

  const [localConsent, setLocalConsent] = useState<ConsentState>({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false,
    personalization: false
  });

  useEffect(() => {
    if (consent) {
      const updated = {
        necessary: true,
        analytics: !!consent.analytics,
        marketing: !!consent.marketing,
        functional: !!consent.functional,
        personalization: !!consent.personalization
      };
      setLocalConsent(updated);
      setIsMinimized(true);
      policyEngine.updatePolicy(updated);
    } else if (!isConsentLoading && user) {
      setIsMinimized(false);
    }
  }, [consent, isConsentLoading, user]);

  const getTrackersForCategory = (category: string) => {
    return inventory?.filter(c => c.category === category) || [];
  };

  const handleSave = () => {
    if (!consentRef || !user || !firestore) return;

    const data = {
      ...localConsent,
      userId: user.uid,
      websiteId: 'demo-site',
      timestamp: serverTimestamp()
    };

    setDocumentNonBlocking(consentRef, data, { merge: true });
    
    const activeCategories = Object.entries(localConsent)
      .filter(([_, val]) => val)
      .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1))
      .join(', ');

    const logRef = doc(firestore, `users/${user.uid}/privacyLogs/${Math.random().toString(36).substring(7)}`);
    setDocumentNonBlocking(logRef, {
      userId: user.uid,
      websiteId: 'demo-site',
      timestamp: serverTimestamp(),
      consentChange: `Custom Preferences: ${activeCategories}`,
      activeCookieIds: inventory?.filter(c => localConsent[c.category as keyof typeof localConsent]).map(c => c.id) || []
    }, { merge: true });

    setIsMinimized(true);
    setShowSettings(false);
  };

  const handleAcceptAll = () => {
    if (!consentRef || !user || !firestore) return;
    
    const all = { necessary: true, analytics: true, marketing: true, functional: true, personalization: true };
    const data = { ...all, userId: user.uid, websiteId: 'demo-site', timestamp: serverTimestamp() };

    setDocumentNonBlocking(consentRef, data, { merge: true });
    
    const logRef = doc(firestore, `users/${user.uid}/privacyLogs/${Math.random().toString(36).substring(7)}`);
    setDocumentNonBlocking(logRef, {
      userId: user.uid,
      websiteId: 'demo-site',
      timestamp: serverTimestamp(),
      consentChange: 'Opt-in All Categories',
      activeCookieIds: inventory?.map(c => c.id) || []
    }, { merge: true });

    setIsMinimized(true);
  };

  const handleRejectAll = () => {
    if (!consentRef || !user || !firestore) return;
    
    const none = { necessary: true, analytics: false, marketing: false, functional: false, personalization: false };
    const data = { ...none, userId: user.uid, websiteId: 'demo-site', timestamp: serverTimestamp() };

    setDocumentNonBlocking(consentRef, data, { merge: true });
    
    const logRef = doc(firestore, `users/${user.uid}/privacyLogs/${Math.random().toString(36).substring(7)}`);
    setDocumentNonBlocking(logRef, {
      userId: user.uid,
      websiteId: 'demo-site',
      timestamp: serverTimestamp(),
      consentChange: 'Rejected Optional (Necessary Only)',
      activeCookieIds: inventory?.filter(c => c.category === 'necessary').map(c => c.id) || []
    }, { merge: true });

    setIsMinimized(true);
  };

  if (isUserLoading || isConsentLoading) return null;

  if (isMinimized) {
    return (
      <Button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-2xl bg-primary hover:bg-primary/90 transition-transform hover:scale-110 z-50 border-4 border-white"
        size="icon"
      >
        <Shield className="w-6 h-6 text-white" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-full max-w-sm z-50 animate-in slide-in-from-bottom-10 duration-500">
      <Card className="shadow-2xl border-2 border-primary/20 overflow-hidden bg-white/95 backdrop-blur">
        <CardHeader className="bg-primary/5 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg font-headline">Privacy Controls</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsMinimized(true)} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4 max-h-[450px] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/10">
          {!showSettings ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                PrivacyPilot ensures transparency. Select your preferred level of privacy below to minimize data collection.
              </p>
              <div className="flex flex-col gap-2">
                <Button onClick={handleAcceptAll} className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-11">
                  <Check className="w-4 h-4 mr-2" />
                  Accept All
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={handleRejectAll} className="w-full border-primary/20 hover:bg-red-50 hover:text-red-600 text-xs font-semibold h-10">
                    <Ban className="w-3 h-3 mr-2" />
                    Necessary Only
                  </Button>
                  <Button variant="outline" onClick={() => setShowSettings(true)} className="w-full border-primary/20 hover:bg-primary/5 text-xs font-semibold h-10">
                    <Settings2 className="w-3 h-3 mr-2" />
                    Customize
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <ConsentToggle
                id="necessary"
                title="Strictly Necessary"
                description="Crucial for basic site operations, security, and authentication. Cannot be disabled."
                trackers={getTrackersForCategory('necessary')}
                checked={true}
                disabled={true}
                onChange={() => {}}
              />
              <ConsentToggle
                id="functional"
                title="Functional"
                description="Enables enhanced features like remembering your language or UI theme settings."
                trackers={getTrackersForCategory('functional')}
                checked={localConsent.functional}
                onChange={(val) => setLocalConsent({ ...localConsent, functional: val })}
              />
              <ConsentToggle
                id="analytics"
                title="Analytics"
                description="Helps us understand how users interact with the site so we can improve the experience."
                trackers={getTrackersForCategory('analytics')}
                checked={localConsent.analytics}
                onChange={(val) => setLocalConsent({ ...localConsent, analytics: val })}
              />
              <ConsentToggle
                id="personalization"
                title="Personalization"
                description="Allows us to tailor content specifically to your browsing behavior on this site."
                trackers={getTrackersForCategory('personalization')}
                checked={localConsent.personalization}
                onChange={(val) => setLocalConsent({ ...localConsent, personalization: val })}
              />
              <ConsentToggle
                id="marketing"
                title="Marketing"
                description="Enables cross-site tracking to deliver relevant advertisements based on your interests."
                trackers={getTrackersForCategory('marketing')}
                checked={localConsent.marketing}
                onChange={(val) => setLocalConsent({ ...localConsent, marketing: val })}
              />
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-muted/30 p-4 border-t">
          {showSettings ? (
            <div className="flex gap-2 w-full">
              <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)} className="text-xs font-bold">
                Back
              </Button>
              <Button size="sm" onClick={handleSave} className="ml-auto bg-primary text-white font-bold px-6">
                Save & Apply
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                <Info className="w-3 h-3 text-primary" />
                Policy Engine: Active
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold text-green-600">LIVE SYNC</span>
              </div>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

function ConsentToggle({ id, title, description, trackers, checked, onChange, disabled = false }: {
  id: string;
  title: string;
  description: string;
  trackers: any[];
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2 p-3 rounded-lg border border-transparent hover:border-primary/10 hover:bg-primary/5 transition-all">
      <div className="flex items-start gap-4">
        <div className="flex-1 space-y-0.5">
          <label htmlFor={id} className="text-sm font-bold block leading-none flex items-center gap-2">
            {title}
            {disabled && <Badge variant="secondary" className="text-[9px] h-4 py-0">Core</Badge>}
          </label>
          <p className="text-[10px] text-muted-foreground leading-tight">
            {description}
          </p>
        </div>
        <Switch
          id={id}
          checked={checked}
          onCheckedChange={onChange}
          disabled={disabled}
          className="data-[state=checked]:bg-primary"
        />
      </div>
      
      {trackers.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {trackers.map(t => (
            <div key={t.id} className="flex items-center gap-1 bg-white/50 border border-primary/5 px-1.5 py-0.5 rounded text-[9px] font-mono text-primary/70">
              <Cookie className="w-2 w-2" />
              {t.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
