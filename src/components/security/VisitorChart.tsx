import { useMemo } from 'react';
import { format, subDays, startOfDay } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { useVisitors } from '@/hooks/useVisitors';

export function VisitorChart() {
  const { visitors, isLoading } = useVisitors();

  const chartData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dayStart = startOfDay(date);
      const dayEnd = new Date(dayStart.getTime() + 86400000);

      const dayVisitors = visitors.filter((v) => {
        const d = new Date(v.detected_at);
        return d >= dayStart && d < dayEnd;
      });

      return {
        day: format(date, 'EEE'),
        date: format(date, 'MMM d'),
        verified: dayVisitors.filter((v) => v.status === 'verified').length,
        unverified: dayVisitors.filter((v) => v.status !== 'verified').length,
      };
    });
    return days;
  }, [visitors]);

  if (isLoading) {
    return (
      <Card className="border-border/50 animate-pulse">
        <CardContent className="p-6"><div className="h-48 bg-muted rounded-lg" /></CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Visitor Activity (7 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} className="text-muted-foreground" />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} className="text-muted-foreground" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))',
                }}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.date || ''}
              />
              <Bar dataKey="verified" name="Verified" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="unverified" name="Unknown" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
