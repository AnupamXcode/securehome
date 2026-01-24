import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export type ActionType = 'verify' | 'notify_neighbor' | 'notify_police' | 'lock_door';

export function useActions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const logAction = useMutation({
    mutationFn: async ({
      actionType,
      visitorId,
      eventId,
      details,
    }: {
      actionType: ActionType;
      visitorId?: string;
      eventId?: string;
      details?: Record<string, unknown>;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('actions')
        .insert([{
          user_id: user.id,
          action_type: actionType,
          visitor_id: visitorId || null,
          event_id: eventId || null,
          details: details || null,
        }]);
      
      if (error) throw error;
    },
  });

  const verifyPerson = async (visitorId: string) => {
    try {
      // Update visitor status
      const { error } = await supabase
        .from('visitors')
        .update({ 
          status: 'verified',
          verified_at: new Date().toISOString()
        })
        .eq('id', visitorId);
      
      if (error) throw error;

      // Log the action
      await logAction.mutateAsync({ actionType: 'verify', visitorId });
      
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
      toast.success('Person verified and added to trusted list');
    } catch (error) {
      toast.error('Failed to verify person');
      throw error;
    }
  };

  const notifyNeighbor = async (visitorId?: string) => {
    try {
      await logAction.mutateAsync({ 
        actionType: 'notify_neighbor', 
        visitorId,
        details: { notified_at: new Date().toISOString() }
      });
      toast.success('Neighbor notification sent');
    } catch (error) {
      toast.error('Failed to notify neighbor');
      throw error;
    }
  };

  const notifyPolice = async (visitorId?: string) => {
    try {
      await logAction.mutateAsync({ 
        actionType: 'notify_police', 
        visitorId,
        details: { reported_at: new Date().toISOString() }
      });
      toast.success('Police notified (simulated)');
    } catch (error) {
      toast.error('Failed to notify police');
      throw error;
    }
  };

  const toggleDoorLock = async (isLocked: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('door_status')
        .update({ is_locked: isLocked })
        .eq('user_id', user.id);
      
      if (error) throw error;

      await logAction.mutateAsync({ 
        actionType: 'lock_door',
        details: { is_locked: isLocked }
      });
      
      queryClient.invalidateQueries({ queryKey: ['door_status'] });
      toast.success(isLocked ? 'Door locked' : 'Door unlocked');
    } catch (error) {
      toast.error('Failed to toggle door lock');
      throw error;
    }
  };

  return {
    verifyPerson,
    notifyNeighbor,
    notifyPolice,
    toggleDoorLock,
    isLoading: logAction.isPending,
  };
}
