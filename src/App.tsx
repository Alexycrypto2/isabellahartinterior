import { lazy, Suspense } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import ScrollToTop from "@/components/ScrollToTop";
import { CartProvider } from "@/hooks/useCart";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";
import DeveloperPanel from './pages/DeveloperPanel';
import { Chatbot } from "@/components/Chatbot";
import { EmailCapturePopup } from "@/components/EmailCapturePopup";
import ErrorBoundary from "@/components/ErrorBoundary";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import Index from "./pages/Index";

// Lazy load non-critical pages
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Inspiration = lazy(() => import("./pages/Inspiration"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Disclosure = lazy(() => import("./pages/Disclosure"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Cart = lazy(() => import("./pages/Cart"));
const Auth = lazy(() => import("./pages/Auth"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminBlogPosts = lazy(() => import("./pages/AdminBlogPosts"));
const AdminBlogEditor = lazy(() => import("./pages/AdminBlogEditor"));
const AdminCategories = lazy(() => import("./pages/AdminCategories"));
const AdminProducts = lazy(() => import("./pages/AdminProducts"));
const AdminProductEditor = lazy(() => import("./pages/AdminProductEditor"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const AdminMedia = lazy(() => import("./pages/AdminMedia"));
const AdminSubscribers = lazy(() => import("./pages/AdminSubscribers"));
const AdminAppearance = lazy(() => import("./pages/AdminAppearance"));
const AdminContactSubmissions = lazy(() => import("./pages/AdminContactSubmissions"));
const AdminPhotoSubmissions = lazy(() => import("./pages/AdminPhotoSubmissions"));
const AdminSeasonalBanners = lazy(() => import("./pages/AdminSeasonalBanners"));
const AdminContentCalendar = lazy(() => import("./pages/AdminContentCalendar"));
const AdminAccountSettings = lazy(() => import("./pages/AdminAccountSettings"));
const AdminTeamManagement = lazy(() => import("./pages/AdminTeamManagement"));
const AdminSecurityLog = lazy(() => import("./pages/AdminSecurityLog"));
const AdminOwnershipTransfer = lazy(() => import("./pages/AdminOwnershipTransfer"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const AdminComments = lazy(() => import("./pages/AdminComments"));
const AdminTrending = lazy(() => import("./pages/AdminTrending"));
const AdminDeveloper = lazy(() => import("./pages/AdminDeveloper"));
const AdminProductCategories = lazy(() => import("./pages/AdminProductCategories"));
const AdminPinGenerator = lazy(() => import("./pages/AdminPinGenerator"));
const AdminChatDashboard = lazy(() => import("./pages/AdminChatDashboard"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const ShippingPolicy = lazy(() => import("./pages/ShippingPolicy"));
const ReturnsPolicy = lazy(() => import("./pages/ReturnsPolicy"));

// Simple loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Index />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/inspiration" element={<Inspiration />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/disclosure" element={<Disclosure />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<ProtectedAdminRoute><Admin /></ProtectedAdminRoute>} />
          <Route path="/admin/blog" element={<ProtectedAdminRoute><AdminBlogPosts /></ProtectedAdminRoute>} />
          <Route path="/admin/blog/new" element={<ProtectedAdminRoute><AdminBlogEditor /></ProtectedAdminRoute>} />
          <Route path="/admin/blog/edit/:id" element={<ProtectedAdminRoute><AdminBlogEditor /></ProtectedAdminRoute>} />
          <Route path="/admin/categories" element={<ProtectedAdminRoute><AdminCategories /></ProtectedAdminRoute>} />
          <Route path="/admin/products" element={<ProtectedAdminRoute><AdminProducts /></ProtectedAdminRoute>} />
          <Route path="/admin/products/new" element={<ProtectedAdminRoute><AdminProductEditor /></ProtectedAdminRoute>} />
          <Route path="/admin/products/edit/:id" element={<ProtectedAdminRoute><AdminProductEditor /></ProtectedAdminRoute>} />
          <Route path="/admin/settings" element={<ProtectedAdminRoute><AdminSettings /></ProtectedAdminRoute>} />
          <Route path="/admin/media" element={<ProtectedAdminRoute><AdminMedia /></ProtectedAdminRoute>} />
          <Route path="/admin/subscribers" element={<ProtectedAdminRoute><AdminSubscribers /></ProtectedAdminRoute>} />
          <Route path="/admin/appearance" element={<ProtectedAdminRoute><AdminAppearance /></ProtectedAdminRoute>} />
          <Route path="/admin/contact-submissions" element={<ProtectedAdminRoute><AdminContactSubmissions /></ProtectedAdminRoute>} />
          <Route path="/admin/photo-submissions" element={<ProtectedAdminRoute><AdminPhotoSubmissions /></ProtectedAdminRoute>} />
          <Route path="/admin/seasonal-banners" element={<ProtectedAdminRoute><AdminSeasonalBanners /></ProtectedAdminRoute>} />
          <Route path="/admin/blog/calendar" element={<ProtectedAdminRoute><AdminContentCalendar /></ProtectedAdminRoute>} />
          <Route path="/admin/account" element={<ProtectedAdminRoute><AdminAccountSettings /></ProtectedAdminRoute>} />
          <Route path="/admin/team" element={<ProtectedAdminRoute><AdminTeamManagement /></ProtectedAdminRoute>} />
          <Route path="/admin/security" element={<ProtectedAdminRoute><AdminSecurityLog /></ProtectedAdminRoute>} />
          <Route path="/admin/ownership" element={<ProtectedAdminRoute><AdminOwnershipTransfer /></ProtectedAdminRoute>} />
          <Route path="/admin/comments" element={<ProtectedAdminRoute><AdminComments /></ProtectedAdminRoute>} />
          <Route path="/admin/trending" element={<ProtectedAdminRoute><AdminTrending /></ProtectedAdminRoute>} />
          <Route path="/admin/developer" element={<ProtectedAdminRoute><AdminDeveloper /></ProtectedAdminRoute>} />
          <Route path="/admin/product-categories" element={<ProtectedAdminRoute><AdminProductCategories /></ProtectedAdminRoute>} />
          <Route path="/admin/pin-generator" element={<ProtectedAdminRoute><AdminPinGenerator /></ProtectedAdminRoute>} />
          <Route path="/admin/chat" element={<ProtectedAdminRoute><AdminChatDashboard /></ProtectedAdminRoute>} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/shipping-policy" element={<ShippingPolicy />} />
          <Route path="/returns-policy" element={<ReturnsPolicy />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/developer" element={<DeveloperPanel />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <CartProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ScrollToTop />
                <AnalyticsTracker />
                <AnimatedRoutes />
                <Chatbot />
                <EmailCapturePopup />
                <ExitIntentPopup />
              </BrowserRouter>
            </CartProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
// test
