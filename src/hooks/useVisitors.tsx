import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useEffect } from 'react';

export interface Visitor {
  id: string;
  user_id: string;
  snapshot_url: string | null;
  entry_point: string;
  status: 'verified' | 'unverified';
  detected_at: string;
  verified_at: string | null;
  created_at: string;
}

export function useVisitors() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: visitors = [], isLoading } = useQuery({
    queryKey: ['visitors', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('visitors')
        .select('*')
        .eq('user_id', user.id)
        .order('detected_at', { ascending: false });
      
      if (error) throw error;
      return data as Visitor[];
    },
    enabled: !!user,
  });

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('visitors-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'visitors',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['visitors', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  const verifyVisitor = useMutation({
    mutationFn: async (visitorId: string) => {
      const { error } = await supabase
        .from('visitors')
        .update({ 
          status: 'verified',
          verified_at: new Date().toISOString()
        })
        .eq('id', visitorId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitors', user?.id] });
    },
  });

  const todayVisitors = visitors.filter(v => {
    const today = new Date();
    const visitDate = new Date(v.detected_at);
    return visitDate.toDateString() === today.toDateString();
  });

  const stats = {
    total: todayVisitors.length,
    verified: todayVisitors.filter(v => v.status === 'verified').length,
    unverified: todayVisitors.filter(v => v.status === 'unverified').length,
  };

  return {
    visitors,
    todayVisitors,
    stats,
    isLoading,
    verifyVisitor: verifyVisitor.mutate,
  };
}
