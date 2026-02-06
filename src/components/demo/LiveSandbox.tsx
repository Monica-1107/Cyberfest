'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, ShieldAlert, ShieldCheck, Terminal, Cpu, Globe, Database, Wifi, WifiOff, Zap } from 'lucide-react';
import { policyEngine, type ConsentState } from '@/lib/policy-engine';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

export function LiveSandbox() {
  const { firestore } = useFirebase();
  const [consentState, setConsentState] = useState<ConsentState>(policyEngine.getSnapshot());
  const [logs, setLogs] = useState<{msg: string, type: 'info' | 'success' | 'warning'}[]>([]);
  const [lastPing, setLastPing] = useState<{id: string, allowed: boolean, timestamp: number} | null>(null);

  const cookiesRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'cookies');
  }, [firestore]);
  const { data: cookies, isLoading } = useCollection(cookiesRef);

  useEffect(() => {
    const unsubscribe = policyEngine.subscribe((newState) => {
      setConsentState(newState);
      setLogs(prev => [{ msg: `Policy Engine: Broadcast received. Policy updated.`, type: 'info' }, ...prev].slice(0, 15));
    });

    const interval = setInterval(() => {
      if (cookies && cookies.length > 0) {
        const randomCookie = cookies[Math.floor(Math.random() * cookies.length)];
        const isAllowed = policyEngine.checkConsent(randomCookie.category as any);
        
        setLastPing({
          id: randomCookie.id,
          allowed: isAllowed,
          timestamp: Date.now()
        });

        setLogs(prev => [{
          msg: `Enforcement: ${randomCookie.name} (${randomCookie.category}) -> ${isAllowed ? 'AUTHORIZED' : 'BLOCKED'}`,
          type: isAllowed ? 'success' : 'warning'
        }, ...prev].slice(0, 15));
      }
    }, 3000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [cookies]);

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="md:col-span-2 bg-white shadow-sm border-none">
        <CardHeader className="bg-primary/5 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              <h3 className="font-headline font-bold">Secure Integration Sandbox</h3>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3 text-accent animate-pulse" />
              <span className="text-[10px] font-bold uppercase text-muted-foreground">Traffic Active</span>
            </div>
          </div>
          <CardDescription>
            Live demonstration of policy enforcement for trackers discovered in your Firestore inventory.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoading ? (
              <div className="col-span-2 py-10 flex items-center justify-center">
                <p className="text-sm italic text-muted-foreground">Connecting to Firestore...</p>
              </div>
            ) : cookies && cookies.length > 0 ? (
              cookies.map((cookie) => (
                <ScriptStatus 
                  key={cookie.id}
                  name={cookie.name} 
                  category={cookie.category} 
                  active={policyEngine.checkConsent(cookie.category as any)} 
                  id={cookie.id}
                  isPinging={lastPing?.id === cookie.id}
                />
              ))
            ) : (
              <div className="col-span-2 py-10 flex flex-col items-center justify-center border-2 border-dashed rounded-xl bg-muted/20">
                <Database className="w-8 h-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm font-medium">Inventory Empty</p>
                <p className="text-xs text-muted-foreground">Add a tracker in "Scanner" to see enforcement here.</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <Terminal className="w-3 h-3" />
                Runtime Logs
              </div>
              <Badge variant="outline" className="text-[9px] font-mono">
                {new Date().toLocaleTimeString()}
              </Badge>
            </div>
            <div className="bg-slate-900 rounded-lg p-4 font-mono text-[11px] h-48 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
              {logs.length === 0 && <p className="text-slate-500 italic">Listening for activity...</p>}
              {logs.map((log, i) => (
                <p key={i} className={
                  log.type === 'success' ? 'text-green-400' : 
                  log.type === 'warning' ? 'text-amber-400' : 'text-slate-300'
                }>
                  <span className="opacity-50 mr-2">&gt;</span>
                  {log.msg}
                </p>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-accent/5 border-accent/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-accent" />
            <h3 className="text-sm font-headline font-bold">Policy Gatekeeper</h3>
          </div>
        </CardHeader>
        <CardContent className="text-xs space-y-4">
          <div className="p-4 bg-white rounded-xl border border-accent/10 space-y-3">
            <div className="space-y-2">
              <GateIndicator label="Necessary" active={true} />
              <GateIndicator label="Functional" active={consentState.functional} />
              <GateIndicator label="Analytics" active={consentState.analytics} />
              <GateIndicator label="Personalization" active={consentState.personalization} />
              <GateIndicator label="Marketing" active={consentState.marketing} />
            </div>
          </div>
          
          <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
            <h4 className="font-bold mb-1 flex items-center gap-1">
              <Activity className="w-3 h-3" />
              Logic Flow
            </h4>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Every tracking request is intercepted by the <code>PolicyEngine</code>. If unauthorized, the request is terminated before reaching the network.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function GateIndicator({ label, active }: { label: string, active: boolean }) {
  return (
    <div className="flex items-center justify-between p-2 rounded bg-muted/30">
      <span className="font-medium">{label}</span>
      {active ? (
        <Badge className="bg-green-500 h-5 px-1.5 text-[9px]"><ShieldCheck className="w-2.5 h-2.5 mr-1" /> ALLOW</Badge>
      ) : (
        <Badge variant="destructive" className="h-5 px-1.5 text-[9px]"><ShieldAlert className="w-2.5 h-2.5 mr-1" /> DENY</Badge>
      )}
    </div>
  );
}

function ScriptStatus({ name, category, active, id, isPinging }: { name: string, category: string, active: boolean, id: string, isPinging: boolean }) {
  return (
    <div className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
      active 
        ? 'border-green-500/20 bg-green-50/30' 
        : 'border-slate-100 bg-white opacity-60'
    } ${isPinging ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
      
      {isPinging && (
        <div className="absolute -top-2 -right-2 bg-primary text-white p-1 rounded-full shadow-lg">
          {active ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
        </div>
      )}

      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-headline font-bold text-sm truncate max-w-[120px]">{name}</h4>
          <p className="text-[10px] text-muted-foreground capitalize">{category}</p>
        </div>
        {active ? (
          <Badge className="bg-green-500 hover:bg-green-500 text-white text-[9px] uppercase">Active</Badge>
        ) : (
          <Badge variant="secondary" className="text-[9px] uppercase">Blocked</Badge>
        )}
      </div>
      
      <div className="flex items-center gap-2 mt-4 text-[10px] font-mono text-muted-foreground">
        <Activity className={`w-3 h-3 ${active ? 'text-green-500 animate-pulse' : 'text-slate-300'}`} />
        ID: {id.substring(0, 6)}
      </div>
    </div>
  );
}
