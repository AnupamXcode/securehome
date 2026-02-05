 import { useState, useRef, useCallback } from 'react';
 import { UserPlus, Trash2, Camera, Upload, Loader2, User } from 'lucide-react';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
 } from '@/components/ui/dialog';
 import { useVerifiedPersons } from '@/hooks/useVerifiedPersons';
 import { useFaceDetection } from '@/hooks/useFaceDetection';
 import { useCamera } from '@/hooks/useCamera';
 import { toast } from 'sonner';
 
 export function VerifiedPersonsManager() {
   const { verifiedPersons, isLoading, addVerifiedPerson, removeVerifiedPerson, isAdding } = useVerifiedPersons();
   const { isModelLoaded, loadModels, extractDescriptor } = useFaceDetection();
   const { videoRef, canvasRef, isStreaming, startCamera, stopCamera, capturePhoto } = useCamera();
   
   const [dialogOpen, setDialogOpen] = useState(false);
   const [name, setName] = useState('');
   const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
   const [isExtracting, setIsExtracting] = useState(false);
   const fileInputRef = useRef<HTMLInputElement>(null);
 
   const handleCapture = useCallback(() => {
     const photo = capturePhoto();
     if (photo) {
       setCapturedPhoto(photo);
       stopCamera();
     }
   }, [capturePhoto, stopCamera]);
 
   const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
     const file = event.target.files?.[0];
     if (!file) return;
     
     const reader = new FileReader();
     reader.onload = (e) => {
       setCapturedPhoto(e.target?.result as string);
     };
     reader.readAsDataURL(file);
   }, []);
 
   const handleAddPerson = useCallback(async () => {
     if (!name.trim() || !capturedPhoto) {
       toast.error('Please provide a name and photo');
       return;
     }
     
     if (!isModelLoaded) {
       await loadModels();
     }
     
     setIsExtracting(true);
     
     try {
       // Create image element from captured photo
       const img = new Image();
       img.crossOrigin = 'anonymous';
       
       await new Promise<void>((resolve, reject) => {
         img.onload = () => resolve();
         img.onerror = () => reject(new Error('Failed to load image'));
         img.src = capturedPhoto;
       });
       
       // Extract face descriptor
       const descriptor = await extractDescriptor(img);
       
       if (!descriptor) {
         toast.error('No face detected in the image. Please try again.');
         return;
       }
       
       // Convert photo to blob
       const response = await fetch(capturedPhoto);
       const photoBlob = await response.blob();
       
       // Add verified person
       addVerifiedPerson({
         name: name.trim(),
         photoBlob,
         descriptor
       });
       
       // Reset form
       setName('');
       setCapturedPhoto(null);
       setDialogOpen(false);
     } catch (error) {
       console.error('Add person error:', error);
       toast.error('Failed to process face. Please try again.');
     } finally {
       setIsExtracting(false);
     }
   }, [name, capturedPhoto, isModelLoaded, loadModels, extractDescriptor, addVerifiedPerson]);
 
   const handleDialogClose = useCallback(() => {
     setDialogOpen(false);
     setName('');
     setCapturedPhoto(null);
     stopCamera();
   }, [stopCamera]);
 
   return (
     <Card className="border-border/50">
       <CardHeader className="pb-3">
         <div className="flex items-center justify-between">
           <CardTitle className="text-lg flex items-center gap-2">
             <User className="h-5 w-5 text-primary" />
             Verified Persons
           </CardTitle>
           
           <Dialog open={dialogOpen} onOpenChange={(open) => {
             if (!open) handleDialogClose();
             else setDialogOpen(true);
           }}>
             <DialogTrigger asChild>
               <Button size="sm" className="gradient-primary">
                 <UserPlus className="h-4 w-4 mr-2" />
                 Add Person
               </Button>
             </DialogTrigger>
             
             <DialogContent className="sm:max-w-md">
               <DialogHeader>
                 <DialogTitle>Add Verified Person</DialogTitle>
               </DialogHeader>
               
               <div className="space-y-4">
                 {/* Name Input */}
                 <div className="space-y-2">
                   <Label htmlFor="name">Name</Label>
                   <Input
                     id="name"
                     placeholder="Enter person's name"
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                   />
                 </div>
                 
                 {/* Photo Capture */}
                 <div className="space-y-2">
                   <Label>Photo</Label>
                   
                   {capturedPhoto ? (
                     <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                       <img
                         src={capturedPhoto}
                         alt="Captured"
                         className="w-full h-full object-cover"
                       />
                       <Button
                         size="sm"
                         variant="secondary"
                         className="absolute bottom-2 right-2"
                         onClick={() => setCapturedPhoto(null)}
                       >
                         Retake
                       </Button>
                     </div>
                   ) : isStreaming ? (
                     <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                       <video
                         ref={videoRef}
                         className="w-full h-full object-cover"
                         playsInline
                         muted
                       />
                       <canvas ref={canvasRef} className="hidden" />
                       <Button
                         size="sm"
                         className="absolute bottom-2 right-2 gradient-primary"
                         onClick={handleCapture}
                       >
                         Capture
                       </Button>
                     </div>
                   ) : (
                     <div className="flex gap-2">
                       <Button
                         variant="outline"
                         className="flex-1"
                         onClick={startCamera}
                       >
                         <Camera className="h-4 w-4 mr-2" />
                         Use Camera
                       </Button>
                       <Button
                         variant="outline"
                         className="flex-1"
                         onClick={() => fileInputRef.current?.click()}
                       >
                         <Upload className="h-4 w-4 mr-2" />
                         Upload Photo
                       </Button>
                       <input
                         ref={fileInputRef}
                         type="file"
                         accept="image/*"
                         className="hidden"
                         onChange={handleFileUpload}
                       />
                     </div>
                   )}
                 </div>
                 
                 {/* Submit Button */}
                 <Button
                   className="w-full gradient-primary"
                   onClick={handleAddPerson}
                   disabled={!name.trim() || !capturedPhoto || isAdding || isExtracting}
                 >
                   {(isAdding || isExtracting) && (
                     <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                   )}
                   {isExtracting ? 'Processing face...' : isAdding ? 'Adding...' : 'Add Person'}
                 </Button>
               </div>
             </DialogContent>
           </Dialog>
         </div>
       </CardHeader>
       
       <CardContent>
         {isLoading ? (
           <div className="flex items-center justify-center py-8">
             <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
           </div>
         ) : verifiedPersons.length === 0 ? (
           <div className="text-center py-8 text-muted-foreground">
             <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
             <p className="text-sm">No verified persons yet</p>
             <p className="text-xs">Add people to grant them automatic access</p>
           </div>
         ) : (
           <div className="space-y-2">
             {verifiedPersons.map((person) => (
               <div
                 key={person.id}
                 className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
               >
                 {person.photo_url ? (
                   <img
                     src={person.photo_url}
                     alt={person.name}
                     className="h-12 w-12 rounded-full object-cover"
                   />
                 ) : (
                   <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                     <User className="h-6 w-6 text-primary" />
                   </div>
                 )}
                 <div className="flex-1 min-w-0">
                   <p className="font-medium truncate">{person.name}</p>
                   <p className="text-xs text-muted-foreground">
                     Added {new Date(person.created_at).toLocaleDateString()}
                   </p>
                 </div>
                 <Button
                   variant="ghost"
                   size="icon"
                   className="text-destructive hover:text-destructive hover:bg-destructive/10"
                   onClick={() => removeVerifiedPerson(person.id)}
                 >
                   <Trash2 className="h-4 w-4" />
                 </Button>
               </div>
             ))}
           </div>
         )}
       </CardContent>
     </Card>
   );
 }