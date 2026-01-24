import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { StatusCard } from '@/components/security/StatusCard';
import { StatsGrid } from '@/components/security/StatsGrid';
import { CameraPreview } from '@/components/security/CameraPreview';
import { RecentActivity } from '@/components/security/RecentActivity';
import { ActionPanel } from '@/components/security/ActionPanel';
import { BottomNav } from '@/components/layout/BottomNav';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-2xl gradient-primary animate-pulse">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg gradient-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">SecureHome</span>
          </div>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-4 space-y-4">
        <StatusCard />
        <StatsGrid />
        <CameraPreview />
        <ActionPanel />
        <RecentActivity />
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
