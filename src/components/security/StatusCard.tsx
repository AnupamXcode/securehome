import { Shield, ShieldCheck, ShieldX } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useDoorStatus } from '@/hooks/useDoorStatus';

export function StatusCard() {
  const { isLocked, isLoading } = useDoorStatus();

  if (isLoading) {
    return (
      <Card className="border-border/50 animate-pulse">
        <CardContent className="p-6"><div className="h-24 bg-muted rounded-lg" /></CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "border-2 transition-all duration-500 overflow-hidden relative",
      isLocked ? "border-success/30 glow-success" : "border-warning/30 glow-warning"
    )}>
      {/* Gradient overlay */}
      <div className={cn(
        "absolute inset-0 opacity-5",
        isLocked ? "bg-gradient-to-br from-success to-transparent" : "bg-gradient-to-br from-warning to-transparent"
      )} />
      <CardContent className="p-6 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "p-3 rounded-xl",
              isLocked ? "gradient-success" : "gradient-warning"
            )}>
              {isLocked ? (
                <ShieldCheck className="h-8 w-8 text-success-foreground" />
              ) : (
                <ShieldX className="h-8 w-8 text-warning-foreground" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{isLocked ? 'Armed' : 'Disarmed'}</h2>
              <p className="text-muted-foreground text-sm">{isLocked ? 'Home is secure' : 'Door is unlocked'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              {isLocked ? 'Safe' : 'Alert'}
            </span>
            <div className={cn(
              "h-3 w-3 rounded-full animate-pulse-glow",
              isLocked ? "bg-success" : "bg-warning"
            )} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
