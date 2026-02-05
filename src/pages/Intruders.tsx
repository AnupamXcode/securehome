 import { useEffect } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { AlertTriangle, Play, Camera } from 'lucide-react';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import { useAuth } from '@/hooks/useAuth';
 import { useIntruderLogs } from '@/hooks/useIntruderLogs';
 import { BottomNav } from '@/components/layout/BottomNav';
 import { format } from 'date-fns';
 
 export default function Intruders() {
   const { user, loading } = useAuth();
   const navigate = useNavigate();
   const { intruderLogs, isLoading } = useIntruderLogs();
 
   useEffect(() => {
     if (!loading && !user) {
       navigate('/auth');
     }
   }, [user, loading, navigate]);
 
   if (loading || !user) {
     return null;
   }
 
   return (
     <div className="min-h-screen bg-background pb-20">
       {/* Header */}
       <header className="sticky top-0 z-50 glass border-b border-border/50">
         <div className="container px-4 py-4">
           <h1 className="text-xl font-bold flex items-center gap-2">
             <AlertTriangle className="h-5 w-5 text-destructive" />
             Intruder Logs
           </h1>
         </div>
       </header>
 
       <main className="container px-4 py-4">
         {isLoading ? (
           <div className="flex items-center justify-center py-20">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
           </div>
         ) : intruderLogs.length === 0 ? (
           <Card className="border-border/50">
             <CardContent className="py-12 text-center">
               <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
               <p className="text-muted-foreground">No intruder events recorded</p>
               <p className="text-sm text-muted-foreground mt-1">
                 Detected unknown persons will appear here
               </p>
             </CardContent>
           </Card>
         ) : (
           <div className="space-y-4">
             {intruderLogs.map((log) => (
               <Card key={log.id} className="border-destructive/20 overflow-hidden">
                 <CardContent className="p-0">
                   <div className="flex">
                     {/* Thumbnail */}
                     <div className="w-24 h-24 flex-shrink-0 bg-muted">
                       {log.photo_url ? (
                         <img
                           src={log.photo_url}
                           alt="Intruder"
                           className="w-full h-full object-cover"
                         />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center">
                           <Camera className="h-8 w-8 text-muted-foreground" />
                         </div>
                       )}
                     </div>
                     
                     {/* Details */}
                     <div className="flex-1 p-3">
                       <div className="flex items-start justify-between mb-2">
                         <Badge variant="destructive" className="text-xs">
                           Unknown Person
                         </Badge>
                         {log.video_url && (
                           <a 
                             href={log.video_url} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="text-xs text-primary flex items-center gap-1"
                           >
                             <Play className="h-3 w-3" />
                             Video
                           </a>
                         )}
                       </div>
                       <p className="text-sm text-muted-foreground">
                         {format(new Date(log.detected_at), 'MMM d, yyyy h:mm a')}
                       </p>
                       {log.action_taken && (
                         <p className="text-xs text-muted-foreground mt-1">
                           Action: {log.action_taken}
                         </p>
                       )}
                     </div>
                   </div>
                 </CardContent>
               </Card>
             ))}
           </div>
         )}
       </main>
 
       <BottomNav />
     </div>
   );
 }