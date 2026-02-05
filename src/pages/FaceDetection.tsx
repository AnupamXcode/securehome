 import { useNavigate } from 'react-router-dom';
 import { FaceDetectionScreen } from '@/components/face-detection';
 import { useAuth } from '@/hooks/useAuth';
 import { useEffect } from 'react';
 
 export default function FaceDetection() {
   const navigate = useNavigate();
   const { user, loading } = useAuth();
 
   useEffect(() => {
     if (!loading && !user) {
       navigate('/auth');
     }
   }, [user, loading, navigate]);
 
   const handleAccessGranted = () => {
     navigate('/dashboard');
   };
 
   if (loading || !user) {
     return null;
   }
 
   return <FaceDetectionScreen onAccessGranted={handleAccessGranted} />;
 }