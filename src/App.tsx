import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CameraProvider } from "@/hooks/useCameraContext";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import FaceDetection from "./pages/FaceDetection";
import Visitors from "./pages/Visitors";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";
import Intruders from "./pages/Intruders";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CameraProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<FaceDetection />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/detect" element={<FaceDetection />} />
              <Route path="/visitors" element={<Visitors />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/intruders" element={<Intruders />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CameraProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
