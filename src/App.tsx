import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { POS } from "./pages/POS";
import { Inventory } from "./pages/Inventory";
import { Reports } from "./pages/Reports";
import { Commission } from "./pages/Commission";
import { Users } from "./pages/Users";
import { Settings } from "./pages/Settings";
import { Services } from "./pages/Services";
import { Auth } from "./pages/Auth";
import { Dashboard } from "./pages/Dashboard";
import ClockInOut from "./pages/ClockInOut";
import Deliveries from "./pages/Deliveries";
import DriverDashboard from "./pages/DriverDashboard";
import Approvals from "./pages/Approvals";
import Expenses from "./pages/Expenses";
import Suppliers from "./pages/Suppliers";
import { Customers } from "./pages/Customers";
import { PurchaseOrders } from "./pages/PurchaseOrders";
import { StockAlerts } from "./pages/StockAlerts";
import { BusinessProvider } from "@/contexts/BusinessContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <BusinessProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Dashboard />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pos"
                element={
                  <ProtectedRoute allowedRoles={["manager", "cashier"]}>
                    <MainLayout>
                      <POS />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inventory"
                element={
                  <ProtectedRoute allowedRoles={["manager"]}>
                    <MainLayout>
                      <Inventory />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute allowedRoles={["manager"]}>
                    <MainLayout>
                      <Reports />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/services"
                element={
                  <ProtectedRoute allowedRoles={["manager"]}>
                    <MainLayout>
                      <Services />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/commissions"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Commission />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute allowedRoles={["manager"]}>
                    <MainLayout>
                      <Users />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Settings />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clock"
                element={
                  <ProtectedRoute allowedRoles={["barber"]}>
                    <MainLayout>
                      <ClockInOut />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/deliveries"
                element={
                  <ProtectedRoute allowedRoles={["manager", "cashier"]}>
                    <MainLayout>
                      <Deliveries />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/driver"
                element={
                  <ProtectedRoute allowedRoles={["delivery_driver"]}>
                    <MainLayout>
                      <DriverDashboard />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/approvals"
                element={
                  <ProtectedRoute allowedRoles={["manager", "accountant"]}>
                    <MainLayout>
                      <Approvals />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/expenses"
                element={
                  <ProtectedRoute allowedRoles={["manager", "accountant"]}>
                    <MainLayout>
                      <Expenses />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/suppliers"
                element={
                  <ProtectedRoute allowedRoles={["manager"]}>
                    <MainLayout>
                      <Suppliers />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customers"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Customers />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/purchase-orders"
                element={
                  <ProtectedRoute allowedRoles={["manager"]}>
                    <MainLayout>
                      <PurchaseOrders />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stock-alerts"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <StockAlerts />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BusinessProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
