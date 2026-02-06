import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Scan, Shield, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCameraContext } from '@/hooks/useCameraContext';
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
  const { stream, isStreaming, error: cameraError, startCamera, stopCamera } = useCameraContext();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  
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
  const [status, setStatus] = useState<'idle' | 'scanning' | 'verified' | 'intruder'>('idle');
  const [autoVerifyTriggered, setAutoVerifyTriggered] = useState(false);

  // Load models on mount
  useEffect(() => {
    loadModels();
  }, [loadModels]);

  // Attach stream to video element when available
  useEffect(() => {
    if (stream && videoRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(console.error);
    }
  }, [stream]);

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

  // Recording helpers
  const startRecording = useCallback(() => {
    if (!stream) return;
    
    recordedChunksRef.current = [];
    
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9'
    });
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };
    
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(100);
    setIsRecording(true);
  }, [stream]);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) {
        resolve(null);
        return;
      }
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        recordedChunksRef.current = [];
        setIsRecording(false);
        resolve(blob);
      };
      
      mediaRecorderRef.current.stop();
    });
  }, []);

  const capturePhoto = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return null;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    return canvas.toDataURL('image/jpeg', 0.8);
  }, []);

  // Run verification
  const runVerification = useCallback(async () => {
    if (!isModelLoaded || !videoRef.current || !isStreaming) return;
    
    setIsDetecting(true);
    setStatus('scanning');
    setDetectionResult(null);
    
    // Start recording for potential intruder
    startRecording();
    
    try {
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
  }, [isModelLoaded, isStreaming, detectFace, capturePhoto, startRecording, stopRecording, stopCamera, onAccessGranted, logIntruder]);

  // Manual start + verify (fallback button)
  const handleStartAndVerify = useCallback(async () => {
    if (!isModelLoaded) return;
    
    try {
      if (!isStreaming) {
        await startCamera();
        // Wait for stream to be ready
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      runVerification();
    } catch (err) {
      console.error('Start and verify error:', err);
    }
  }, [isModelLoaded, isStreaming, startCamera, runVerification]);

  // AUTO-START: When camera is already streaming (from login) and models are loaded
  useEffect(() => {
    if (isStreaming && isModelLoaded && !autoVerifyTriggered && status === 'idle' && !isDetecting) {
      setAutoVerifyTriggered(true);
      // Small delay to ensure video element is attached
      const timer = setTimeout(() => {
        runVerification();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isStreaming, isModelLoaded, autoVerifyTriggered, status, isDetecting, runVerification]);
 
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