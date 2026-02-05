 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from './useAuth';
 import { toast } from 'sonner';
 
 export interface VerifiedPerson {
   id: string;
   user_id: string;
   name: string;
   photo_url: string | null;
   face_descriptor: number[];
   created_at: string;
   updated_at: string;
 }
 
 export function useVerifiedPersons() {
   const { user } = useAuth();
   const queryClient = useQueryClient();
 
   const { data: verifiedPersons = [], isLoading } = useQuery({
     queryKey: ['verified_persons', user?.id],
     queryFn: async () => {
       if (!user) return [];
       
       const { data, error } = await supabase
         .from('verified_persons')
         .select('*')
         .eq('user_id', user.id)
         .order('created_at', { ascending: false });
       
       if (error) throw error;
       
       return data.map(p => ({
         ...p,
         face_descriptor: (p.face_descriptor as number[]) || []
       })) as VerifiedPerson[];
     },
     enabled: !!user,
   });
 
   const addVerifiedPerson = useMutation({
     mutationFn: async ({
       name,
       photoBlob,
       descriptor
     }: {
       name: string;
       photoBlob: Blob;
       descriptor: Float32Array;
     }) => {
       if (!user) throw new Error('Not authenticated');
 
       // Upload photo to storage
       const fileName = `${user.id}/${Date.now()}.jpg`;
       const { error: uploadError } = await supabase.storage
         .from('verified-persons')
         .upload(fileName, photoBlob, {
           contentType: 'image/jpeg'
         });
       
       if (uploadError) throw uploadError;
 
       // Get public URL
       const { data: urlData } = supabase.storage
         .from('verified-persons')
         .getPublicUrl(fileName);
 
       // Insert verified person record
       const { error } = await supabase
         .from('verified_persons')
         .insert([{
           user_id: user.id,
           name,
           photo_url: urlData.publicUrl,
           face_descriptor: Array.from(descriptor)
         }]);
       
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['verified_persons', user?.id] });
       toast.success('Person added to verified list');
     },
     onError: (error) => {
       console.error('Add verified person error:', error);
       toast.error('Failed to add verified person');
     }
   });
 
   const removeVerifiedPerson = useMutation({
     mutationFn: async (personId: string) => {
       if (!user) throw new Error('Not authenticated');
 
       const { error } = await supabase
         .from('verified_persons')
         .delete()
         .eq('id', personId)
         .eq('user_id', user.id);
       
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['verified_persons', user?.id] });
       toast.success('Person removed from verified list');
     },
     onError: () => {
       toast.error('Failed to remove person');
     }
   });
 
   return {
     verifiedPersons,
     isLoading,
     addVerifiedPerson: addVerifiedPerson.mutate,
     removeVerifiedPerson: removeVerifiedPerson.mutate,
     isAdding: addVerifiedPerson.isPending,
     isRemoving: removeVerifiedPerson.isPending
   };
 }