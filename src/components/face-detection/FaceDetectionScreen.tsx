 import { useState, useEffect, useCallback } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { Camera, Scan, Shield, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { useCamera } from '@/hooks/useCamera';
 import { useFaceDetection, FaceDetectionResult } from '@/hooks/useFaceDetection';
 import { useVerifiedPersons } from '@/hooks/useVerifiedPersons';
 import { useIntruderLogs } from '@/hooks/useIntruderLogs';
 import { IntruderAlertDialog } from './IntruderAlertDialog';
 import { cn } from '@/lib/utils';
 
 interface FaceDetectionScreenProps {
   onAccessGranted: () => void;
 }
 
 export function FaceDetectionScreen({ onAccessGranted }: FaceDetectionScreenProps) {
   const navigate = useNavigate();
   const { 
     videoRef, 
     canvasRef, 
     isStreaming, 
     error: cameraError,
     startCamera, 
     stopCamera,
     capturePhoto,
     startRecording,
     stopRecording,
     isRecording
   } = useCamera();
   
   const {
     isModelLoaded,
     isLoading: modelsLoading,
     error: modelError,
     loadModels,
     detectFace,
     updateVerifiedPersons
   } = useFaceDetection();
   
   const { verifiedPersons } = useVerifiedPersons();
   const { logIntruder } = useIntruderLogs();
   
   const [isDetecting, setIsDetecting] = useState(false);
   const [detectionResult, setDetectionResult] = useState<FaceDetectionResult | null>(null);
   const [showIntruderAlert, setShowIntruderAlert] = useState(false);
   const [intruderPhoto, setIntruderPhoto] = useState<string | null>(null);
   const [currentIntruderId, setCurrentIntruderId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'verified' | 'intruder'>('idle');
  const [autoStartAttempted, setAutoStartAttempted] = useState(false);

  // Load models on mount
  useEffect(() => {
    loadModels();
  }, [loadModels]);

  // Update verified persons in face detection
  useEffect(() => {
    if (verifiedPersons.length > 0) {
      updateVerifiedPersons(
        verifiedPersons.map(p => ({
          id: p.id,
          name: p.name,
          descriptor: p.face_descriptor
        }))
      );
    }
  }, [verifiedPersons, updateVerifiedPersons]);

 
  // Combined start camera + detect in one tap
  const handleStartAndVerify = useCallback(async () => {
    if (!isModelLoaded) return;
    
    // Clear any previous errors
    
    try {
      // Start camera if not already streaming
      if (!isStreaming) {
        await startCamera();
        // Wait for video to be ready
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      if (!videoRef.current) return;
      
      setIsDetecting(true);
      setStatus('scanning');
      setDetectionResult(null);
      
      // Start recording for potential intruder
      startRecording();
      
      // Run face detection
      const result = await detectFace(videoRef.current);
      
      if (!result) {
        setStatus('idle');
        setIsDetecting(false);
        stopRecording();
        return;
      }
      
      setDetectionResult(result);
      
      if (result.isVerified) {
        setStatus('verified');
        stopRecording();
        
        // Grant access after short delay
        setTimeout(() => {
          stopCamera();
          onAccessGranted();
        }, 1500);
      } else {
        setStatus('intruder');
        
        // Capture photo
        const photoDataUrl = capturePhoto();
        setIntruderPhoto(photoDataUrl);
        
        // Wait 5 seconds to capture video
        setTimeout(async () => {
          const videoBlob = await stopRecording();
          
          // Convert photo to blob
          let photoBlob: Blob | null = null;
          if (photoDataUrl) {
            const response = await fetch(photoDataUrl);
            photoBlob = await response.blob();
          }
          
          // Log intruder
          if (photoBlob) {
            await logIntruder({
              photoBlob,
              videoBlob: videoBlob || undefined,
              descriptor: result.descriptor || undefined
            });
          }
          
          // Show intruder alert dialog
          setShowIntruderAlert(true);
        }, 5000);
      }
    } catch (err) {
      console.error('Detection error:', err);
      setStatus('idle');
      stopRecording();
    } finally {
      setIsDetecting(false);
    }
  }, [videoRef, isStreaming, isModelLoaded, startCamera, detectFace, capturePhoto, startRecording, stopRecording, stopCamera, onAccessGranted, logIntruder]);

  // Auto-start camera and verification when models are loaded
  useEffect(() => {
    if (isModelLoaded && !autoStartAttempted && !isStreaming && status === 'idle') {
      setAutoStartAttempted(true);
      // Small delay to ensure component is fully mounted
      const timer = setTimeout(() => {
        handleStartAndVerify();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isModelLoaded, autoStartAttempted, isStreaming, status, handleStartAndVerify]);
 
   const handleIntruderAlertClose = () => {
     setShowIntruderAlert(false);
     setStatus('idle');
     setDetectionResult(null);
     setIntruderPhoto(null);
   };
 
   const statusColors = {
     idle: 'border-border',
     scanning: 'border-primary animate-pulse',
     verified: 'border-success',
     intruder: 'border-destructive'
   };
 
   const error = cameraError || modelError;
 
   return (
     <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
       <Card className="w-full max-w-md">
         <CardHeader className="text-center">
           <div className="mx-auto mb-4 p-3 rounded-2xl gradient-primary">
             <Shield className="h-8 w-8 text-primary-foreground" />
           </div>
           <CardTitle className="text-2xl">Face Verification</CardTitle>
           <p className="text-muted-foreground text-sm mt-2">
             Position your face in the frame and click Detect
           </p>
         </CardHeader>
         
         <CardContent className="space-y-4">
           {/* Camera Preview */}
           <div 
             className={cn(
               "relative aspect-[4/3] bg-muted rounded-xl overflow-hidden border-2 transition-colors",
               statusColors[status]
             )}
           >
             <video
               ref={videoRef}
               className="w-full h-full object-cover"
               playsInline
               muted
             />
             <canvas ref={canvasRef} className="hidden" />
             
             {!isStreaming && (
               <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                 <Camera className="h-16 w-16 opacity-50 mb-2" />
                 <p className="text-sm">Camera not started</p>
               </div>
             )}
             
             {/* Status Overlay */}
             {status === 'scanning' && (
               <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                 <div className="flex flex-col items-center gap-2">
                   <Loader2 className="h-10 w-10 text-primary animate-spin" />
                   <p className="text-sm font-medium">Scanning face...</p>
                 </div>
               </div>
             )}
             
             {status === 'verified' && detectionResult && (
               <div className="absolute inset-0 flex items-center justify-center bg-success/20">
                 <div className="flex flex-col items-center gap-2 text-success">
                   <CheckCircle className="h-16 w-16" />
                   <p className="text-lg font-bold">Access Granted</p>
                   <p className="text-sm">Welcome, {detectionResult.matchedPersonName}</p>
                 </div>
               </div>
             )}
             
             {status === 'intruder' && (
               <div className="absolute inset-0 flex items-center justify-center bg-destructive/20">
                 <div className="flex flex-col items-center gap-2 text-destructive">
                   <AlertTriangle className="h-16 w-16" />
                   <p className="text-lg font-bold">Unknown Person</p>
                   <p className="text-sm">Recording evidence...</p>
                 </div>
               </div>
             )}
             
             {/* Recording indicator */}
             {isRecording && (
               <div className="absolute top-3 right-3 flex items-center gap-2 bg-destructive text-destructive-foreground px-2 py-1 rounded-full">
                 <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
                 <span className="text-xs font-medium">REC</span>
               </div>
             )}
           </div>
           
           {/* Error Display */}
           {error && (
             <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
               {error}
             </div>
           )}
           
           {/* Model Loading Status */}
           {modelsLoading && (
             <div className="flex items-center gap-2 text-muted-foreground text-sm">
               <Loader2 className="h-4 w-4 animate-spin" />
               Loading face detection models...
             </div>
           )}
           
            {/* Single Verify Button */}
            <Button
              className="w-full h-14 text-lg gradient-primary"
              onClick={handleStartAndVerify}
              disabled={!isModelLoaded || modelsLoading || isDetecting || status !== 'idle'}
            >
              {modelsLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Loading AI Models...
                </>
              ) : isDetecting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Scan className="h-5 w-5 mr-2" />
                  Tap to Verify
                </>
              )}
            </Button>
            
            {/* Stop button only when camera is active */}
            {isStreaming && status === 'idle' && !isDetecting && (
              <Button
                variant="outline"
                className="w-full"
                onClick={stopCamera}
              >
                Stop Camera
              </Button>
            )}
           
           {/* Skip link for development */}
           <Button
             variant="ghost"
             className="w-full text-muted-foreground"
             onClick={onAccessGranted}
           >
             Skip verification (demo)
           </Button>
         </CardContent>
       </Card>
       
       {/* Intruder Alert Dialog */}
       <IntruderAlertDialog
         open={showIntruderAlert}
         onOpenChange={setShowIntruderAlert}
         photoUrl={intruderPhoto}
         onClose={handleIntruderAlertClose}
       />
     </div>
   );
 }