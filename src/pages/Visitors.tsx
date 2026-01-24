import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import { Camera, AlertTriangle, CheckCircle, Filter, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useVisitors, Visitor } from '@/hooks/useVisitors';
import { ActionPanel } from '@/components/security/ActionPanel';
import { BottomNav } from '@/components/layout/BottomNav';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function Visitors() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { visitors, isLoading } = useVisitors();
  const [filter, setFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const filteredVisitors = visitors.filter(v => {
    if (filter !== 'all' && v.status !== filter) return false;
    if (searchQuery && !v.entry_point.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (loading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container px-4 py-3">
          <h1 className="text-xl font-bold mb-3">Visitor Log</h1>
          
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter buttons */}
          <div className="flex gap-2">
            {(['all', 'verified', 'unverified'] as const).map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? 'default' : 'outline'}
                onClick={() => setFilter(f)}
                className={filter === f ? 'gradient-primary' : ''}
              >
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </header>

      {/* Visitor List */}
      <main className="container px-4 py-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="border-border/50 animate-pulse">
                <CardContent className="p-4 h-24" />
              </Card>
            ))}
          </div>
        ) : filteredVisitors.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No visitors found</p>
            <p className="text-sm">Detected visitors will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredVisitors.map((visitor) => (
              <Card 
                key={visitor.id} 
                className="border-border/50 cursor-pointer hover:bg-secondary/30 transition-colors animate-slide-up"
                onClick={() => setSelectedVisitor(visitor)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {visitor.snapshot_url ? (
                      <img
                        src={visitor.snapshot_url}
                        alt="Visitor snapshot"
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                        <Camera className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {visitor.status === 'verified' ? (
                          <CheckCircle className="h-4 w-4 text-success" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-warning" />
                        )}
                        <span className="font-medium">{visitor.entry_point}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(visitor.detected_at), 'MMM d, h:mm a')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(visitor.detected_at), { addSuffix: true })}
                      </p>
                    </div>
                    <span className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium",
                      visitor.status === 'verified' 
                        ? "bg-success/10 text-success" 
                        : "bg-warning/10 text-warning"
                    )}>
                      {visitor.status}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Visitor Detail Dialog */}
      <Dialog open={!!selectedVisitor} onOpenChange={() => setSelectedVisitor(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedVisitor?.status === 'verified' ? (
                <CheckCircle className="h-5 w-5 text-success" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-warning" />
              )}
              {selectedVisitor?.entry_point}
            </DialogTitle>
          </DialogHeader>
          
          {selectedVisitor?.snapshot_url && (
            <img
              src={selectedVisitor.snapshot_url}
              alt="Visitor snapshot"
              className="w-full aspect-video object-cover rounded-lg"
            />
          )}
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Detected</span>
              <span>{selectedVisitor && format(new Date(selectedVisitor.detected_at), 'PPp')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className={cn(
                "font-medium",
                selectedVisitor?.status === 'verified' ? "text-success" : "text-warning"
              )}>
                {selectedVisitor?.status}
              </span>
            </div>
          </div>

          <ActionPanel visitorId={selectedVisitor?.id} compact />
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
