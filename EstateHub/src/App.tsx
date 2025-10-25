import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Community from "./pages/Community";
import Wishlist from "./pages/Wishlist";
import ListProperty from "./pages/ListProperty";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Preloader from "./components/Preloader";
import { motion, AnimatePresence } from "framer-motion";

const queryClient = new QueryClient();

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AnimatePresence mode="wait">
          {loading ? (
            <Preloader key="preloader" onFinish={() => setLoading(false)} />
          ) : (
            <motion.div
              key="app-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/properties" element={<Properties />} />
                  <Route path="/property/:id" element={<PropertyDetail />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/list-property" element={<ListProperty />} />
                  <Route path="/admin" element={<Admin />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </motion.div>
          )}
        </AnimatePresence>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
