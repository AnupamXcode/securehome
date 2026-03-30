import { formatDistanceToNow, format } from 'date-fns';
import { Camera, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
    <Card className="border-border/50 hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {recentVisitors.map((visitor) => (
          <div
            key={visitor.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/60 transition-colors duration-200"
          >
            <div className="relative">
              <Avatar className="h-11 w-11 border-2 border-border">
                <AvatarImage src={visitor.snapshot_url || ''} alt="Visitor" />
                <AvatarFallback><Camera className="h-4 w-4 text-muted-foreground" /></AvatarFallback>
              </Avatar>
              <div className={cn(
                "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background",
                visitor.status === 'verified' ? 'bg-success' : 'bg-warning'
              )} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                {visitor.status === 'verified' ? (
                  <CheckCircle className="h-3.5 w-3.5 text-success shrink-0" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0" />
                )}
                <span className="font-medium text-sm truncate">{visitor.entry_point}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {format(new Date(visitor.detected_at), 'h:mm a')} · {formatDistanceToNow(new Date(visitor.detected_at), { addSuffix: true })}
              </p>
            </div>
            <span className={cn(
              "px-2.5 py-1 rounded-full text-xs font-semibold capitalize",
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
