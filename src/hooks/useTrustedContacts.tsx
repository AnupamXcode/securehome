import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface TrustedContact {
  id: string;
  user_id: string;
  name: string;
  phone_number: string;
  is_primary: boolean;
  created_at: string;
}

export function useTrustedContacts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['trusted_contacts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('trusted_contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false });
      
      if (error) throw error;
      return data as TrustedContact[];
    },
    enabled: !!user,
  });

  const addContact = useMutation({
    mutationFn: async ({ name, phone_number }: { name: string; phone_number: string }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('trusted_contacts')
        .insert({
          user_id: user.id,
          name,
          phone_number,
          is_primary: contacts.length === 0,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trusted_contacts', user?.id] });
    },
  });

  const deleteContact = useMutation({
    mutationFn: async (contactId: string) => {
      const { error } = await supabase
        .from('trusted_contacts')
        .delete()
        .eq('id', contactId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trusted_contacts', user?.id] });
    },
  });

  const primaryContact = contacts.find(c => c.is_primary);

  return {
    contacts,
    primaryContact,
    isLoading,
    addContact: addContact.mutate,
    deleteContact: deleteContact.mutate,
    isAdding: addContact.isPending,
  };
}
