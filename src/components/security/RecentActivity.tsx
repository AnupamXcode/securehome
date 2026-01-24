import { formatDistanceToNow } from 'date-fns';
import { Camera, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useVisitors } from '@/hooks/useVisitors';
import { cn } from '@/lib/utils';

export function RecentActivity() {
  const { visitors, isLoading } = useVisitors();
  const recentVisitors = visitors.slice(0, 5);

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (recentVisitors.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Camera className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No recent activity</p>
            <p className="text-sm">Detections will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentVisitors.map((visitor) => (
          <div
            key={visitor.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 animate-slide-up"
          >
            {visitor.snapshot_url ? (
              <img
                src={visitor.snapshot_url}
                alt="Detection snapshot"
                className="h-12 w-12 rounded-lg object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                <Camera className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {visitor.status === 'verified' ? (
                  <CheckCircle className="h-4 w-4 text-success" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-warning" />
                )}
                <span className="font-medium truncate">
                  {visitor.entry_point}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(visitor.detected_at), { addSuffix: true })}
              </p>
            </div>
            <span className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              visitor.status === 'verified' 
                ? "bg-success/10 text-success" 
                : "bg-warning/10 text-warning"
            )}>
              {visitor.status}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
