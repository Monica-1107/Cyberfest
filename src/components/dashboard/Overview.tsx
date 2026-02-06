'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cookie, History, Shield, Lock, Unlock, Cloud, Fingerprint, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useFirebase, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc } from 'firebase/firestore';

/**
 * Overview Component
 * 
 * Provides high-level metrics demonstrating transparency and cloud-sync capability.
 */
export function Overview() {
  const { firestore, user } = useFirebase();

  // 1. Get real-time count of global cookies
  const cookiesRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'cookies');
  }, [firestore]);
  const { data: cookies } = useCollection(cookiesRef);

  // 2. Get real-time count of user's personal audit logs
  const logsRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'privacyLogs');
  }, [firestore, user]);
  const { data: logs } = useCollection(logsRef);

  // 3. Get current active consent state
  const consentRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid, 'consentRecords', 'current');
  }, [firestore, user]);
  const { data: consent } = useDoc(consentRef);

  const activeCount = [consent?.necessary, consent?.analytics, consent?.marketing, consent?.functional, consent?.personalization].filter(Boolean).length;
  const totalCategories = 5;
  const consentProgress = (activeCount / totalCategories) * 100;

  const stats = [
    { 
      title: 'Tracker Inventory', 
      value: cookies?.length?.toString() || '0', 
      icon: Cookie, 
      color: 'text-primary', 
      description: 'Total trackers documented for transparency.' 
    },
    { 
      title: 'Audit History', 
      value: logs?.length?.toString() || '0', 
      icon: History, 
      color: 'text-accent', 
      description: 'Immutable records proving your choices are honored.' 
    },
    { 
      title: 'Compliance Status', 
      value: consent ? 'Compliant' : 'Awaiting Choice', 
      icon: CheckCircle2, 
      color: consent ? 'text-green-500' : 'text-orange-500', 
      progress: consent ? 100 : 0,
      description: consent ? 'Secure consent anchor exists in Firestore.' : 'No active policy configured yet.'
    },
    { 
      title: 'Privacy Identity', 
      value: user?.uid ? `${user.uid.substring(0, 8)}...` : 'Connecting', 
      icon: Fingerprint, 
      color: user ? 'text-primary' : 'text-muted', 
      description: 'Secure UID protecting your choices via Auth.' 
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-white shadow-sm border-none transition-all hover:shadow-md group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
              {stat.title}
            </CardTitle>
            <stat.icon className={cn("h-4 w-4", stat.color)} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-headline tracking-tight truncate">{stat.value}</div>
            
            <div className="flex items-center gap-1.5 mt-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] text-green-600 font-bold uppercase tracking-widest flex items-center gap-1">
                <Cloud className="w-2 h-2" /> Live Cloud Sync
              </span>
            </div>

            {stat.progress !== undefined && (
              <div className="mt-2">
                <Progress value={stat.progress} className="h-1 bg-muted" />
              </div>
            )}
            <p className="text-[10px] text-muted-foreground mt-3 font-medium leading-tight">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}