import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useEffect } from 'react';

export interface SecurityEvent {
  id: string;
  user_id: string;
  event_type: string;
  entry_point: string;
  snapshot_url: string | null;
  is_demo: boolean;
  created_at: string;
}

export function useEvents() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as SecurityEvent[];
    },
    enabled: !!user,
  });

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('events-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'events',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['events', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  const createDemoEvent = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');

      // Create a demo event
      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert({
          user_id: user.id,
          event_type: 'motion_detected',
          entry_point: 'Main Door',
          is_demo: true,
          snapshot_url: `https://picsum.photos/seed/${Date.now()}/400/300`,
        })
        .select()
        .single();
      
      if (eventError) throw eventError;

      // Also create a visitor entry
      const { error: visitorError } = await supabase
        .from('visitors')
        .insert({
          user_id: user.id,
          entry_point: 'Main Door',
          status: 'unverified',
          snapshot_url: event.snapshot_url,
        });
      
      if (visitorError) throw visitorError;

      return event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['visitors', user?.id] });
    },
  });

  return {
    events,
    isLoading,
    createDemoEvent: createDemoEvent.mutate,
    isCreatingDemo: createDemoEvent.isPending,
  };
}
