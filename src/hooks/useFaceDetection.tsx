 import { useState, useCallback, useRef, useEffect } from 'react';
 import * as faceapi from 'face-api.js';
 
 export interface FaceDetectionResult {
   isVerified: boolean;
   confidence: number;
   matchedPersonId?: string;
   matchedPersonName?: string;
   descriptor: Float32Array | null;
 }
 
 export interface VerifiedPerson {
   id: string;
   name: string;
   descriptor: number[];
 }
 
 export function useFaceDetection() {
   const [isModelLoaded, setIsModelLoaded] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const verifiedPersonsRef = useRef<VerifiedPerson[]>([]);
   const labeledDescriptorsRef = useRef<faceapi.LabeledFaceDescriptors[]>([]);
 
   // Load face-api.js models
   const loadModels = useCallback(async () => {
     if (isModelLoaded) return;
     
     setIsLoading(true);
     setError(null);
     
     try {
      // Load models from CDN
      const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
       
       await Promise.all([
         faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
         faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
         faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
       ]);
       
       setIsModelLoaded(true);
       console.log('Face detection models loaded');
     } catch (err) {
       const message = err instanceof Error ? err.message : 'Failed to load face detection models';
       setError(message);
       console.error('Model loading error:', err);
     } finally {
       setIsLoading(false);
     }
   }, [isModelLoaded]);
 
   // Update verified persons database
   const updateVerifiedPersons = useCallback((persons: VerifiedPerson[]) => {
     verifiedPersonsRef.current = persons;
     
     // Create labeled face descriptors for face matching
     labeledDescriptorsRef.current = persons
       .filter(p => p.descriptor && p.descriptor.length === 128)
       .map(person => {
         const descriptor = new Float32Array(person.descriptor);
         return new faceapi.LabeledFaceDescriptors(
           person.id,
           [descriptor]
         );
       });
   }, []);
 
   // Detect face from video element
   const detectFace = useCallback(async (
     videoElement: HTMLVideoElement
   ): Promise<FaceDetectionResult | null> => {
     if (!isModelLoaded) {
       setError('Models not loaded');
       return null;
     }
 
     try {
       const detection = await faceapi
         .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
         .withFaceLandmarks()
         .withFaceDescriptor();
 
       if (!detection) {
         return null;
       }
 
       const descriptor = detection.descriptor;
       
       // If no verified persons, return as unknown
       if (labeledDescriptorsRef.current.length === 0) {
         return {
           isVerified: false,
           confidence: 0,
           descriptor
         };
       }
 
       // Match against verified persons
       const faceMatcher = new faceapi.FaceMatcher(
         labeledDescriptorsRef.current,
         0.6 // Distance threshold
       );
       
       const match = faceMatcher.findBestMatch(descriptor);
       
       if (match.label !== 'unknown') {
         const matchedPerson = verifiedPersonsRef.current.find(p => p.id === match.label);
         return {
           isVerified: true,
           confidence: 1 - match.distance,
           matchedPersonId: match.label,
           matchedPersonName: matchedPerson?.name || 'Unknown',
           descriptor
         };
       }
 
       return {
         isVerified: false,
         confidence: 1 - match.distance,
         descriptor
       };
     } catch (err) {
       console.error('Face detection error:', err);
       return null;
     }
   }, [isModelLoaded]);
 
   // Extract face descriptor from image
   const extractDescriptor = useCallback(async (
     imageElement: HTMLImageElement | HTMLCanvasElement
   ): Promise<Float32Array | null> => {
     if (!isModelLoaded) {
       setError('Models not loaded');
       return null;
     }
 
     try {
       const detection = await faceapi
         .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions())
         .withFaceLandmarks()
         .withFaceDescriptor();
 
       return detection?.descriptor || null;
     } catch (err) {
       console.error('Descriptor extraction error:', err);
       return null;
     }
   }, [isModelLoaded]);
 
   return {
     isModelLoaded,
     isLoading,
     error,
     loadModels,
     detectFace,
     extractDescriptor,
     updateVerifiedPersons
   };
 }