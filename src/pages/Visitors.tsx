import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import { Camera, AlertTriangle, CheckCircle, Search, Clock, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useVisitors, Visitor } from '@/hooks/useVisitors';
import { ActionPanel } from '@/components/security/ActionPanel';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { cn } from '@/lib/utils';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

export default function Visitors() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { visitors, stats, isLoading } = useVisitors();
  const [filter, setFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate('/auth');
  }, [user, loading, navigate]);

  const filteredVisitors = visitors.filter(v => {
    if (filter !== 'all' && v.status !== filter) return false;
    if (searchQuery && !v.entry_point.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Group visitors by date
  const groupedVisitors = filteredVisitors.reduce((groups, visitor) => {
    const date = new Date(visitor.detected_at).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(visitor);
    return groups;
  }, {} as Record<string, Visitor[]>);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Visitor Log" icon={<Users className="h-5 w-5 text-primary" />} />

      {/* Stats Banner */}
      <div className="container px-4 pt-4">
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-primary/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-primary">{stats.total}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Today</p>
          </div>
          <div className="bg-success/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-success">{stats.verified}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Verified</p>
          </div>
          <div className="bg-warning/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-warning">{stats.unverified}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Unverified</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by location..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2 mb-4">
          {(['all', 'verified', 'unverified'] as const).map((f) => (
            <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)} className={cn("flex-1", filter === f && 'gradient-primary')}>
              {f === 'all' ? `All (${visitors.length})` : f === 'verified' ? `Verified (${stats.verified})` : `Unverified (${stats.unverified})`}
            </Button>
          ))}
        </div>
      </div>

      {/* Visitor List grouped by date */}
      <main className="container px-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="border-border/50 animate-pulse"><CardContent className="p-4 h-24" /></Card>
            ))}
          </div>
        ) : filteredVisitors.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No visitors found</p>
            <p className="text-sm">Detected visitors will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedVisitors).map(([date, dateVisitors]) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {new Date(date).toDateString() === new Date().toDateString() ? 'Today' : format(new Date(date), 'EEEE, MMM d')}
                  </p>
                </div>
                <div className="space-y-2">
                  {dateVisitors.map((visitor) => (
                    <Card
                      key={visitor.id}
                      className="border-border/50 cursor-pointer hover:bg-secondary/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
                      onClick={() => setSelectedVisitor(visitor)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          {visitor.snapshot_url ? (
                            <img src={visitor.snapshot_url} alt="Visitor" className="h-14 w-14 rounded-xl object-cover ring-2 ring-border" />
                          ) : (
                            <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center">
                              <Camera className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              {visitor.status === 'verified' ? (
                                <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0" />
                              )}
                              <span className="font-medium truncate">{visitor.entry_point}</span>
                            </div>
                            <p className="text-sm text-muted-foreground font-mono">
                              {format(new Date(visitor.detected_at), 'h:mm:ss a')}
                            </p>
                          </div>
                          <span className={cn(
                            "px-2.5 py-1 rounded-full text-xs font-semibold",
                            visitor.status === 'verified' ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                          )}>
                            {visitor.status}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Visitor Detail Dialog */}
      <Dialog open={!!selectedVisitor} onOpenChange={() => setSelectedVisitor(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedVisitor?.status === 'verified' ? <CheckCircle className="h-5 w-5 text-success" /> : <AlertTriangle className="h-5 w-5 text-warning" />}
              {selectedVisitor?.entry_point}
            </DialogTitle>
          </DialogHeader>
          {selectedVisitor?.snapshot_url && (
            <img src={selectedVisitor.snapshot_url} alt="Visitor" className="w-full aspect-video object-cover rounded-lg" />
          )}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Detected</span><span className="font-mono">{selectedVisitor && format(new Date(selectedVisitor.detected_at), 'PPp')}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className={cn("font-medium", selectedVisitor?.status === 'verified' ? "text-success" : "text-warning")}>{selectedVisitor?.status}</span></div>
          </div>
          <ActionPanel visitorId={selectedVisitor?.id} compact />
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
