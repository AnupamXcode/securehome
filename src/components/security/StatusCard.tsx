import { Shield, ShieldCheck, ShieldX } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useDoorStatus } from '@/hooks/useDoorStatus';

export function StatusCard() {
  const { isLocked, isLoading } = useDoorStatus();

  if (isLoading) {
    return (
      <Card className="border-border/50 animate-pulse">
        <CardContent className="p-6">
          <div className="h-24 bg-muted rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "border-border/50 transition-all duration-300",
      isLocked ? "glow-success" : "glow-warning"
    )}>
      <CardContent className="p-6">
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
              <h2 className="text-2xl font-bold">
                {isLocked ? 'Armed' : 'Disarmed'}
              </h2>
              <p className="text-muted-foreground text-sm">
                {isLocked ? 'Home is secure' : 'Door is unlocked'}
              </p>
            </div>
          </div>
          <div className={cn(
            "h-3 w-3 rounded-full animate-pulse-glow",
            isLocked ? "bg-success" : "bg-warning"
          )} />
        </div>
      </CardContent>
    </Card>
  );
}
