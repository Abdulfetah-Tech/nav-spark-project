import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth, type AppRole } from "@/contexts/AuthContext";
import { FullPageLoader } from "@/components/states/PageState";

interface ProtectedRouteProps {
  children: ReactNode;
  /** When set, only these roles may view the route. */
  roles?: AppRole[];
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { status, role } = useAuth();
  const location = useLocation();

  if (status === "loading") return <FullPageLoader label="Checking your session…" />;

  if (status === "unauthenticated") {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth?next=${next}`} replace />;
  }

  if (roles && role && !roles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (roles && !role) return <FullPageLoader label="Loading your account…" />;

  return <>{children}</>;
}
