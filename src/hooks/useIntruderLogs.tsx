 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from './useAuth';
 import { toast } from 'sonner';
 
 export interface IntruderLog {
   id: string;
   user_id: string;
   photo_url: string | null;
   video_url: string | null;
   face_descriptor: number[] | null;
   action_taken: string | null;
   detected_at: string;
   created_at: string;
 }
 
 export function useIntruderLogs() {
   const { user } = useAuth();
   const queryClient = useQueryClient();
 
   const { data: intruderLogs = [], isLoading } = useQuery({
     queryKey: ['intruder_logs', user?.id],
     queryFn: async () => {
       if (!user) return [];
       
       const { data, error } = await supabase
         .from('intruder_logs')
         .select('*')
         .eq('user_id', user.id)
         .order('detected_at', { ascending: false });
       
       if (error) throw error;
       return data as IntruderLog[];
     },
     enabled: !!user,
   });
 
   const logIntruder = useMutation({
     mutationFn: async ({
       photoBlob,
       videoBlob,
       descriptor
     }: {
       photoBlob: Blob;
       videoBlob?: Blob;
       descriptor?: Float32Array;
     }) => {
       if (!user) throw new Error('Not authenticated');
 
       const timestamp = Date.now();
       
       // Upload photo
       const photoFileName = `${user.id}/${timestamp}.jpg`;
       const { error: photoError } = await supabase.storage
         .from('intruders')
         .upload(photoFileName, photoBlob, {
           contentType: 'image/jpeg'
         });
       
       if (photoError) throw photoError;
 
       const { data: photoUrlData } = supabase.storage
         .from('intruders')
         .getPublicUrl(photoFileName);
 
       let videoUrl = null;
       
       // Upload video if provided
       if (videoBlob) {
         const videoFileName = `${user.id}/${timestamp}.webm`;
         const { error: videoError } = await supabase.storage
           .from('intruders')
           .upload(videoFileName, videoBlob, {
             contentType: 'video/webm'
           });
         
         if (!videoError) {
           const { data: videoUrlData } = supabase.storage
             .from('intruders')
             .getPublicUrl(videoFileName);
           videoUrl = videoUrlData.publicUrl;
         }
       }
 
       // Insert intruder log
       const { error } = await supabase
         .from('intruder_logs')
         .insert([{
           user_id: user.id,
           photo_url: photoUrlData.publicUrl,
           video_url: videoUrl,
           face_descriptor: descriptor ? Array.from(descriptor) : null,
           detected_at: new Date().toISOString()
         }]);
       
       if (error) throw error;
       
       return { photoUrl: photoUrlData.publicUrl, videoUrl };
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['intruder_logs', user?.id] });
     },
     onError: (error) => {
       console.error('Log intruder error:', error);
       toast.error('Failed to log intruder');
     }
   });
 
   const updateIntruderAction = useMutation({
     mutationFn: async ({
       logId,
       actionTaken
     }: {
       logId: string;
       actionTaken: string;
     }) => {
       if (!user) throw new Error('Not authenticated');
 
       const { error } = await supabase
         .from('intruder_logs')
         .update({ action_taken: actionTaken })
         .eq('id', logId)
         .eq('user_id', user.id);
       
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['intruder_logs', user?.id] });
     }
   });
 
   return {
     intruderLogs,
     isLoading,
     logIntruder: logIntruder.mutateAsync,
     updateIntruderAction: updateIntruderAction.mutate,
     isLogging: logIntruder.isPending
   };
 }