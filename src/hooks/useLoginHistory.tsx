import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface LoginRecord {
  id: string;
  email: string | null;
  name: string | null;
  logged_in_at: string;
  device_info: string | null;
}

export function useLoginHistory() {
  const { user } = useAuth();

  const { data: history = [], isLoading } = useQuery({
    queryKey: ['login_history', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('login_history')
        .select('*')
        .eq('user_id', user.id)
        .order('logged_in_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data as LoginRecord[];
    },
    enabled: !!user,
  });

  return { history, isLoading };
}
