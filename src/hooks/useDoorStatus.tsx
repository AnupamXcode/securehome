import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface DoorStatus {
  id: string;
  user_id: string;
  is_locked: boolean;
  last_updated: string;
}

export function useDoorStatus() {
  const { user } = useAuth();

  const { data: doorStatus, isLoading } = useQuery({
    queryKey: ['door_status', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('door_status')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data as DoorStatus;
    },
    enabled: !!user,
  });

  return {
    doorStatus,
    isLocked: doorStatus?.is_locked ?? true,
    isLoading,
  };
}
