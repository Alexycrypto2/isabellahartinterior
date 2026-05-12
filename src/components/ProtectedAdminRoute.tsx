import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const ProtectedAdminRoute = ({ children }: { children: ReactNode }) => {
  const { user, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageLoader />;

  if (!user) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <h1 className="font-serif text-3xl md:text-4xl mb-3">Access Denied</h1>
        <p className="text-muted-foreground max-w-md mb-6">
          You don't have permission to view this page. This area is restricted to administrators.
        </p>
        <a
          href="/"
          className="inline-flex items-center px-5 py-2.5 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition"
        >
          Return Home
        </a>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;