import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import WarrantyCases from "./pages/WarrantyCases";
import Customers from "./pages/Customers";
import Devices from "./pages/Devices";
import Stores from "./pages/Stores";
import Parts from "./pages/Parts";
import Suppliers from "./pages/Suppliers";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Employees from "@/pages/Employees.tsx";
import Login from "@/pages/Login.tsx";
import ProtectedRoute from "@/components/ProtectedRoute";
import Users from "@/pages/Users.tsx"; // Импортируем защиту маршрутов

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Открытый маршрут для входа */}
            <Route path="/login" element={<Login />} />

            {/* Защищенные маршруты */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Index />} />
              <Route path="/warranty-cases" element={<WarrantyCases />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/users" element={<Users/>} />
              <Route path="/devices" element={<Devices />} />
              <Route path="/stores" element={<Stores />} />
              <Route path="/parts" element={<Parts />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/employees" element={<Employees />} />
            </Route>

            {/* 404 страница */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
);

export default App;
