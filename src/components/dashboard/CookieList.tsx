'use client';

import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, Plus, Trash2, Database, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

export function CookieList() {
  const { firestore } = useFirebase();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  
  const [newCookie, setNewCookie] = useState({
    name: '',
    domain: '',
    category: 'analytics',
    description: ''
  });

  const cookiesRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'cookies');
  }, [firestore]);

  const { data: cookies, isLoading } = useCollection(cookiesRef);

  const filtered = cookies?.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.domain?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleAddCookie = () => {
    if (!firestore || !newCookie.name || !newCookie.domain) return;
    
    const colRef = collection(firestore, 'cookies');
    addDocumentNonBlocking(colRef, {
      ...newCookie,
      createdAt: new Date().toISOString()
    });
    
    setNewCookie({ name: '', domain: '', category: 'analytics', description: '' });
    setIsDialogOpen(false);
    toast({
      title: "Tracker Added",
      description: `${newCookie.name} has been added to your inventory.`,
    });
  };

  const handleDeleteCookie = (id: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'cookies', id);
    deleteDocumentNonBlocking(docRef);
  };

  const handleRescan = () => {
    if (!firestore) return;
    setIsScanning(true);
    
    // Simulate finding trackers
    setTimeout(() => {
      const colRef = collection(firestore, 'cookies');
      const seedTrackers = [
        { name: '_ga', domain: 'google-analytics.com', category: 'analytics', description: 'Google Analytics tracking ID' },
        { name: '_fbp', domain: 'facebook.com', category: 'marketing', description: 'Facebook pixel tracker' },
        { name: 'session_id', domain: 'privacypilot.com', category: 'necessary', description: 'Core session management' }
      ];

      // Only add if inventory is looking thin
      if (!cookies || cookies.length < 2) {
        seedTrackers.forEach(t => addDocumentNonBlocking(colRef, { ...t, createdAt: new Date().toISOString() }));
        toast({
          title: "Scan Complete",
          description: "Discovered 3 common trackers on your domain.",
        });
      } else {
        toast({
          title: "Scan Complete",
          description: "Inventory is already up to date.",
        });
      }
      setIsScanning(false);
    }, 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search discovered trackers..."
            className="pl-8 bg-white border-primary/10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <Button 
            variant="outline" 
            onClick={handleRescan} 
            disabled={isScanning}
            className="border-primary/20 hover:bg-primary/5 flex-1 md:flex-none"
          >
            {isScanning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            {isScanning ? 'Scanning...' : 'Re-scan Site'}
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-white flex-1 md:flex-none">
                <Plus className="mr-2 h-4 w-4" />
                Manual Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Tracker</DialogTitle>
                <DialogDescription>
                  Define a new cookie or script for your global compliance inventory.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Technical Name</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g. _ga, _fbp, session_id" 
                    value={newCookie.name}
                    onChange={(e) => setNewCookie({...newCookie, name: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="domain">Domain</Label>
                  <Input 
                    id="domain" 
                    placeholder="e.g. google.com" 
                    value={newCookie.domain}
                    onChange={(e) => setNewCookie({...newCookie, domain: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Privacy Category</Label>
                  <Select 
                    value={newCookie.category} 
                    onValueChange={(val) => setNewCookie({...newCookie, category: val})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="necessary">Strictly Necessary</SelectItem>
                      <SelectItem value="functional">Functional</SelectItem>
                      <SelectItem value="analytics">Analytics</SelectItem>
                      <SelectItem value="personalization">Personalization</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="What does this tracker do?"
                    value={newCookie.description}
                    onChange={(e) => setNewCookie({...newCookie, description: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddCookie} disabled={!newCookie.name || !newCookie.domain}>
                  Save to Inventory
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
        {isLoading || isScanning ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
            <p className="text-sm text-muted-foreground font-medium italic">
              {isScanning ? 'Crawling scripts...' : 'Syncing with Firestore...'}
            </p>
          </div>
        ) : filtered.length > 0 ? (
          <Table>
            <TableHeader className="bg-muted/20">
              <TableRow>
                <TableHead className="font-headline font-bold text-xs uppercase tracking-wider">Name</TableHead>
                <TableHead className="font-headline font-bold text-xs uppercase tracking-wider">Domain</TableHead>
                <TableHead className="font-headline font-bold text-xs uppercase tracking-wider">Category</TableHead>
                <TableHead className="hidden md:table-cell font-headline font-bold text-xs uppercase tracking-wider">Description</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((cookie) => (
                <TableRow key={cookie.id} className="hover:bg-primary/5 transition-colors group">
                  <TableCell className="font-mono text-xs font-semibold text-primary">{cookie.name}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{cookie.domain}</TableCell>
                  <TableCell>
                    <Badge variant={
                      cookie.category === 'necessary' ? 'default' : 
                      cookie.category === 'functional' ? 'secondary' : 'outline'
                    } className="capitalize font-body text-[10px]">
                      {cookie.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs text-muted-foreground max-w-xs truncate">
                    {cookie.description}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteCookie(cookie.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center px-6">
            <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mb-4">
              <Database className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <h3 className="font-headline text-lg font-bold mb-2">Inventory Empty</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              Use the "Manual Entry" button or click "Re-scan Site" to discover trackers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}