import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import { Bell, AlertTriangle, Camera, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useVisitors, Visitor } from '@/hooks/useVisitors';
import { ActionPanel } from '@/components/security/ActionPanel';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function Alerts() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { visitors, isLoading } = useVisitors();
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const alerts = visitors.filter(v => v.status === 'unverified');

  useEffect(() => {
    if (!loading && !user) navigate('/auth');
  }, [user, loading, navigate]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Alerts" icon={<Bell className="h-5 w-5 text-warning" />}>
        {alerts.length > 0 && (
          <span className="bg-warning text-warning-foreground text-xs font-bold px-2 py-0.5 rounded-full">{alerts.length}</span>
        )}
      </Header>

      <main className="container px-4 py-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="border-border/50 animate-pulse"><CardContent className="p-4 h-32" /></Card>
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-success opacity-50" />
            <p className="text-lg font-medium">All Clear!</p>
            <p className="text-sm">No pending alerts at this time</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <Card
                key={alert.id}
                className="border-warning/30 bg-warning/5 cursor-pointer hover:bg-warning/10 transition-all"
                onClick={() => setSelectedVisitor(alert)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      {alert.snapshot_url ? (
                        <img src={alert.snapshot_url} alt="Alert" className="h-20 w-20 rounded-lg object-cover" />
                      ) : (
                        <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center"><Camera className="h-8 w-8 text-muted-foreground" /></div>
                      )}
                      <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-warning animate-pulse-glow" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="h-4 w-4 text-warning" />
                        <span className="font-semibold text-warning">Unverified Visitor</span>
                      </div>
                      <p className="text-sm font-medium">{alert.entry_point}</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {format(new Date(alert.detected_at), 'h:mm a')} • {formatDistanceToNow(new Date(alert.detected_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <ActionPanel visitorId={alert.id} compact />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={!!selectedVisitor} onOpenChange={() => setSelectedVisitor(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-warning"><AlertTriangle className="h-5 w-5" /> Alert: {selectedVisitor?.entry_point}</DialogTitle>
          </DialogHeader>
          {selectedVisitor?.snapshot_url && <img src={selectedVisitor.snapshot_url} alt="Alert" className="w-full aspect-video object-cover rounded-lg" />}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Detected</span><span className="font-mono">{selectedVisitor && format(new Date(selectedVisitor.detected_at), 'PPp')}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Location</span><span>{selectedVisitor?.entry_point}</span></div>
          </div>
          <ActionPanel visitorId={selectedVisitor?.id} />
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
