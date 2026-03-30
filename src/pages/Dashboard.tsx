import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Header } from '@/components/layout/Header';
import { StatusCard } from '@/components/security/StatusCard';
import { StatsGrid } from '@/components/security/StatsGrid';
import { VisitorChart } from '@/components/security/VisitorChart';
import { CameraPreview } from '@/components/security/CameraPreview';
import { RecentActivity } from '@/components/security/RecentActivity';
import { ActionPanel } from '@/components/security/ActionPanel';
import { BottomNav } from '@/components/layout/BottomNav';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate('/auth');
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

  if (!user) return null;

  const displayName = profile?.name || user.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="container px-4 py-4 space-y-5">
        {/* Greeting */}
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">{getGreeting()}, {displayName} 👋</h2>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <StatusCard />
        <StatsGrid />
        <VisitorChart />
        <CameraPreview />
        <ActionPanel />
        <RecentActivity />
      </main>
      <BottomNav />
    </div>
  );
}
