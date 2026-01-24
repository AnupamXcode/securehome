import { Users, UserCheck, UserX, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useVisitors } from '@/hooks/useVisitors';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'primary' | 'success' | 'warning' | 'destructive';
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    primary: 'text-primary bg-primary/10',
    success: 'text-success bg-success/10',
    warning: 'text-warning bg-warning/10',
    destructive: 'text-destructive bg-destructive/10',
  };

  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsGrid() {
  const { stats, isLoading } = useVisitors();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-border/50 animate-pulse">
            <CardContent className="p-4 h-20" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard
        icon={<Users className="h-5 w-5" />}
        label="Today"
        value={stats.total}
        color="primary"
      />
      <StatCard
        icon={<UserCheck className="h-5 w-5" />}
        label="Verified"
        value={stats.verified}
        color="success"
      />
      <StatCard
        icon={<UserX className="h-5 w-5" />}
        label="Unverified"
        value={stats.unverified}
        color="warning"
      />
      <StatCard
        icon={<Activity className="h-5 w-5" />}
        label="Active Alerts"
        value={stats.unverified}
        color="destructive"
      />
    </div>
  );
}
