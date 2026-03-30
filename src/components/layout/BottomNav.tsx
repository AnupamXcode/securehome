import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Bell, Settings, Scan } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Home' },
  { path: '/visitors', icon: Users, label: 'Visitors' },
  { path: '/alerts', icon: Bell, label: 'Alerts' },
  { path: '/detect', icon: Scan, label: 'Detect' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-t border-border/50">
      <div className="container flex items-center justify-around h-16 px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "animate-scale-in")} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <div className="h-1 w-1 rounded-full bg-primary mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
