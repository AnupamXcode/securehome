import { Camera, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useVisitors } from '@/hooks/useVisitors';
import { useEvents } from '@/hooks/useEvents';

export function CameraPreview() {
  const { visitors } = useVisitors();
  const { createDemoEvent, isCreatingDemo } = useEvents();
  
  const lastSnapshot = visitors[0]?.snapshot_url;

  return (
    <Card className="border-border/50 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Camera Feed
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse-glow" />
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative aspect-video bg-muted">
          {lastSnapshot ? (
            <img
              src={lastSnapshot}
              alt="Last camera snapshot"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <Camera className="h-16 w-16 opacity-50" />
              <p className="text-sm">No snapshot available</p>
            </div>
          )}
          <div className="absolute bottom-3 left-3 right-3 flex gap-2">
            <Button 
              size="sm" 
              variant="secondary"
              className="glass flex-1"
              onClick={() => createDemoEvent()}
              disabled={isCreatingDemo}
            >
              <Play className="h-4 w-4 mr-2" />
              {isCreatingDemo ? 'Simulating...' : 'Trigger Demo Alert'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
