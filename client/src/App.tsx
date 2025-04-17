import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import AuthPage from "@/pages/auth-page";

// Client Pages
import HomePage from "@/pages/client/home-page";
import OrderPage from "@/pages/client/order-page";
import OrderTrackingPage from "@/pages/client/order-tracking-page";
import OrderHistoryPage from "@/pages/client/order-history-page";
import ProfilePage from "@/pages/client/profile-page";

// Provider Pages
import ProviderDashboardPage from "@/pages/provider/dashboard-page";
import ProviderOrdersPage from "@/pages/provider/orders-page";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/auth" component={AuthPage} />
      
      {/* Client routes */}
      <ProtectedRoute path="/" component={HomePage} allowedUserType="client" />
      <ProtectedRoute path="/order" component={OrderPage} allowedUserType="client" />
      <ProtectedRoute path="/order/:id" component={OrderTrackingPage} allowedUserType="client" />
      <ProtectedRoute path="/orders" component={OrderHistoryPage} allowedUserType="client" />
      <ProtectedRoute path="/profile" component={ProfilePage} allowedUserType="client" />
      
      {/* Provider routes */}
      <ProtectedRoute path="/provider/dashboard" component={ProviderDashboardPage} allowedUserType="provider" />
      <ProtectedRoute path="/provider/orders" component={ProviderOrdersPage} allowedUserType="provider" />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
