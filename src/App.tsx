import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import TrackingResult from "./pages/TrackingResult";
import NotFound from "./pages/NotFound";
import { PaymentConfirmation } from "./pages/PaymentConfirmation";
import { FreteExpressConfirmed } from "./pages/FreteExpressConfirmed";

// Páginas administrativas
import { AdminLogin } from "./pages/AdminLogin";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminImport } from "./pages/AdminImport";
import { AdminLeads } from "./pages/AdminLeads";
import { AdminSettings } from "./pages/AdminSettings";
import { AdminLayout } from "./components/AdminLayout";
import { AuthProvider, ProtectedRoute } from "./hooks/useAuth";
import { ChatProvider } from "./contexts/ChatContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <ChatProvider>
              <Routes>
                {/* Rotas públicas */}
                <Route path="/" element={<Index />} />
                <Route path=":quickCode" element={<Index />} />
                <Route path="/rastreio/:code" element={<TrackingResult />} />
                <Route path="/pagamento-confirmado" element={<PaymentConfirmation />} />
                <Route path="/frete-express-confirmado" element={<FreteExpressConfirmed />} />
                
                {/* Rotas administrativas */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="import" element={<AdminImport />} />
                  <Route path="leads" element={<AdminLeads />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route index element={<AdminDashboard />} />
                </Route>
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ChatProvider>
          </AuthProvider>
        </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
