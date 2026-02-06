'use client';

import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { History, Search, Loader2, Cookie } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';

export function LogViewer() {
  const { firestore, user } = useFirebase();
  const [searchTerm, setSearchTerm] = useState('');

  const logsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'privacyLogs'),
      orderBy('timestamp', 'desc')
    );
  }, [firestore, user]);

  const { data: logs, isLoading } = useCollection(logsQuery);

  const filtered = logs?.filter(l => 
    l.consentChange?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search audit trail..."
            className="pl-8 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
            <p className="text-sm text-muted-foreground">Loading audit logs...</p>
          </div>
        ) : filtered.length > 0 ? (
          <Table>
            <TableHeader className="bg-muted/20">
              <TableRow>
                <TableHead className="font-headline">Timestamp</TableHead>
                <TableHead className="font-headline">Consent Event</TableHead>
                <TableHead className="font-headline">Active Types</TableHead>
                <TableHead className="text-right font-headline">Audit ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((log) => (
                <TableRow key={log.id} className="hover:bg-muted/5">
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {log.timestamp?.toDate ? format(log.timestamp.toDate(), 'MMM d, HH:mm:ss') : 'Pending...'}
                  </TableCell>
                  <TableCell className="font-medium text-sm">{log.consentChange}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {log.activeCookieIds?.map((type: string) => (
                        <Badge key={type} variant="secondary" className="text-[10px] capitalize py-0 px-1.5">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-[10px] text-muted-foreground">
                    {log.id.substring(0, 6)}...
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
            <History className="w-12 h-12 text-muted-foreground/20 mb-4" />
            <h3 className="font-headline text-lg mb-2">No activity recorded yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Privacy logs will appear here once users begin interacting with the consent widget.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
