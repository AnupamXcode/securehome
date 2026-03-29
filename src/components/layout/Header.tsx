import { Shield, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';

interface HeaderProps {
  title?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export function Header({ title, icon, children }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2">
          {icon || (
            <div className="p-1.5 rounded-lg gradient-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
          )}
          <span className="font-bold text-lg">{title || 'Secure Home'}</span>
        </div>
        <div className="flex items-center gap-2">
          {children}
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-warning" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
