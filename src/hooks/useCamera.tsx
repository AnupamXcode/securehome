 import { useState, useRef, useCallback, useEffect } from 'react';
 
 export interface UseCameraReturn {
   videoRef: React.RefObject<HTMLVideoElement>;
   canvasRef: React.RefObject<HTMLCanvasElement>;
   isStreaming: boolean;
   error: string | null;
   startCamera: () => Promise<void>;
   stopCamera: () => void;
   capturePhoto: () => string | null;
   startRecording: () => void;
   stopRecording: () => Promise<Blob | null>;
   isRecording: boolean;
 }
 
 export function useCamera(): UseCameraReturn {
   const videoRef = useRef<HTMLVideoElement>(null);
   const canvasRef = useRef<HTMLCanvasElement>(null);
   const streamRef = useRef<MediaStream | null>(null);
   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
   const recordedChunksRef = useRef<Blob[]>([]);
   
   const [isStreaming, setIsStreaming] = useState(false);
   const [isRecording, setIsRecording] = useState(false);
   const [error, setError] = useState<string | null>(null);
 
   const startCamera = useCallback(async () => {
     try {
       setError(null);
       const stream = await navigator.mediaDevices.getUserMedia({
         video: { 
           facingMode: 'user',
           width: { ideal: 640 },
           height: { ideal: 480 }
         },
         audio: false
       });
       
       streamRef.current = stream;
       
       if (videoRef.current) {
         videoRef.current.srcObject = stream;
         await videoRef.current.play();
         setIsStreaming(true);
       }
     } catch (err) {
       const message = err instanceof Error ? err.message : 'Failed to access camera';
       setError(message);
       console.error('Camera error:', err);
     }
   }, []);
 
   const stopCamera = useCallback(() => {
     if (streamRef.current) {
       streamRef.current.getTracks().forEach(track => track.stop());
       streamRef.current = null;
     }
     if (videoRef.current) {
       videoRef.current.srcObject = null;
     }
     setIsStreaming(false);
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
 
   const startRecording = useCallback(() => {
     if (!streamRef.current) return;
     
     recordedChunksRef.current = [];
     
     const mediaRecorder = new MediaRecorder(streamRef.current, {
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
   }, []);
 
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
 
   // Cleanup on unmount
   useEffect(() => {
     return () => {
       stopCamera();
     };
   }, [stopCamera]);
 
   return {
     videoRef,
     canvasRef,
     isStreaming,
     error,
     startCamera,
     stopCamera,
     capturePhoto,
     startRecording,
     stopRecording,
     isRecording
   };
 }