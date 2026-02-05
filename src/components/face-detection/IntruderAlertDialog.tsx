 import { UserCheck, Users, Phone, Lock, X } from 'lucide-react';
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogDescription,
 } from '@/components/ui/dialog';
 import { Button } from '@/components/ui/button';
 import { useActions } from '@/hooks/useActions';
 import { cn } from '@/lib/utils';
 
 interface IntruderAlertDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   photoUrl: string | null;
   onClose: () => void;
   intruderLogId?: string;
 }
 
 export function IntruderAlertDialog({
   open,
   onOpenChange,
   photoUrl,
   onClose,
   intruderLogId
 }: IntruderAlertDialogProps) {
   const { notifyNeighbor, notifyPolice, toggleDoorLock, isLoading } = useActions();
 
   const actions = [
     {
       id: 'verify',
       label: 'Verify Person',
       description: 'Add to trusted list',
       icon: UserCheck,
       color: 'success' as const,
       onClick: () => {
         // Would need to create a new verified person flow
         onClose();
       },
     },
     {
       id: 'neighbor',
       label: 'Notify Neighbor',
       description: 'Send alert to trusted contact',
       icon: Users,
       color: 'primary' as const,
       onClick: async () => {
         await notifyNeighbor();
         onClose();
       },
     },
     {
       id: 'police',
       label: 'Notify Police',
       description: 'Report suspicious activity',
       icon: Phone,
       color: 'destructive' as const,
       onClick: async () => {
         await notifyPolice();
         onClose();
       },
     },
     {
       id: 'lock',
       label: 'Lock Door',
       description: 'Secure all entry points',
       icon: Lock,
       color: 'warning' as const,
       onClick: async () => {
         await toggleDoorLock(true);
         onClose();
       },
     },
   ];
 
   const colorClasses = {
     success: 'bg-success/10 text-success hover:bg-success hover:text-success-foreground border-success/20',
     primary: 'bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border-primary/20',
     destructive: 'bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/20',
     warning: 'bg-warning/10 text-warning hover:bg-warning hover:text-warning-foreground border-warning/20',
   };
 
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="sm:max-w-md">
         <DialogHeader>
           <div className="flex items-center justify-between">
             <DialogTitle className="text-destructive flex items-center gap-2">
               🚨 Intruder Detected
             </DialogTitle>
           </div>
           <DialogDescription>
             An unknown person was detected. Choose an action below.
           </DialogDescription>
         </DialogHeader>
         
         {/* Intruder Photo */}
         {photoUrl && (
           <div className="relative aspect-video bg-muted rounded-lg overflow-hidden border border-destructive/20">
             <img
               src={photoUrl}
               alt="Detected intruder"
               className="w-full h-full object-cover"
             />
             <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs font-medium">
               CAPTURED
             </div>
           </div>
         )}
         
         {/* Action Buttons */}
         <div className="grid grid-cols-2 gap-3 mt-4">
           {actions.map((action) => (
             <Button
               key={action.id}
               variant="outline"
               className={cn(
                 "flex flex-col h-auto py-4 gap-1 transition-all",
                 colorClasses[action.color]
               )}
               onClick={action.onClick}
               disabled={isLoading}
             >
               <action.icon className="h-6 w-6" />
               <span className="text-sm font-medium">{action.label}</span>
               <span className="text-[10px] opacity-70">{action.description}</span>
             </Button>
           ))}
         </div>
         
         <Button
           variant="ghost"
           className="w-full mt-2"
           onClick={onClose}
         >
           Dismiss
         </Button>
       </DialogContent>
     </Dialog>
   );
 }