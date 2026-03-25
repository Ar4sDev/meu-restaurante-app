import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/AppLayout";
import { CashOpenModal } from "@/components/CashOpenModal";
import Login from "./pages/Login";
import Sales from "./pages/Sales";
import Admin from "./pages/Admin";
import History from "./pages/History";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { isLoggedIn, cashOpened } = useAuth();

  if (!isLoggedIn) return <Login />;

  if (!cashOpened) return <CashOpenModal />;

  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Sales />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/historico" element={<History />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
