import { UserCheck, Users, Phone, Lock, Unlock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useActions } from '@/hooks/useActions';
import { useDoorStatus } from '@/hooks/useDoorStatus';
import { cn } from '@/lib/utils';

interface ActionPanelProps {
  visitorId?: string;
  compact?: boolean;
}

export function ActionPanel({ visitorId, compact = false }: ActionPanelProps) {
  const { verifyPerson, notifyNeighbor, notifyPolice, toggleDoorLock, isLoading } = useActions();
  const { isLocked } = useDoorStatus();

  const actions = [
    {
      id: 'verify',
      label: 'Verify Person',
      icon: UserCheck,
      color: 'success' as const,
      onClick: () => visitorId && verifyPerson(visitorId),
      disabled: !visitorId,
    },
    {
      id: 'neighbor',
      label: 'Notify Neighbor',
      icon: Users,
      color: 'primary' as const,
      onClick: () => notifyNeighbor(visitorId),
    },
    {
      id: 'police',
      label: 'Notify Police',
      icon: Phone,
      color: 'destructive' as const,
      onClick: () => notifyPolice(visitorId),
    },
    {
      id: 'lock',
      label: isLocked ? 'Unlock Door' : 'Lock Door',
      icon: isLocked ? Unlock : Lock,
      color: 'warning' as const,
      onClick: () => toggleDoorLock(!isLocked),
    },
  ];

  const colorClasses = {
    success: 'bg-success/10 text-success hover:bg-success hover:text-success-foreground border-success/20',
    primary: 'bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border-primary/20',
    destructive: 'bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/20',
    warning: 'bg-warning/10 text-warning hover:bg-warning hover:text-warning-foreground border-warning/20',
  };

  if (compact) {
    return (
      <div className="grid grid-cols-4 gap-2">
        {actions.map((action) => (
          <Button
            key={action.id}
            variant="outline"
            size="sm"
            className={cn("flex-col h-auto py-3 gap-1", colorClasses[action.color])}
            onClick={action.onClick}
            disabled={isLoading || action.disabled}
          >
            <action.icon className="h-5 w-5" />
            <span className="text-[10px] leading-tight text-center">{action.label}</span>
          </Button>
        ))}
      </div>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Button
            key={action.id}
            variant="outline"
            className={cn(
              "flex flex-col h-auto py-4 gap-2 transition-all",
              colorClasses[action.color]
            )}
            onClick={action.onClick}
            disabled={isLoading || action.disabled}
          >
            <action.icon className="h-6 w-6" />
            <span className="text-sm font-medium">{action.label}</span>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
