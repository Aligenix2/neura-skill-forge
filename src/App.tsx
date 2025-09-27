import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ComingSoon from "./pages/ComingSoon";
import ComingSoonSignedIn from "./pages/ComingSoonSignedIn";
import Auth from "./pages/Auth";
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";
import Speech from "./pages/Speech";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/coming-soon" element={<ComingSoon />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/speech" element={
              <ProtectedRoute>
                <Speech />
              </ProtectedRoute>
            } />
            <Route path="/coding" element={
              <ProtectedRoute>
                <ComingSoonSignedIn />
              </ProtectedRoute>
            } />
            <Route path="/entrepreneurship" element={
              <ProtectedRoute>
                <ComingSoonSignedIn />
              </ProtectedRoute>
            } />
            <Route path="/coming-soon-signed-in" element={
              <ProtectedRoute>
                <ComingSoonSignedIn />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
