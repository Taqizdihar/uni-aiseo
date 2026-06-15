import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  user: { role: string } | null;
  allowedRoles: string[];
  children: React.ReactNode;
}

export default function ProtectedRoute({
  user,
  allowedRoles,
  children,
}: ProtectedRouteProps) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = user.role;
  const isAllowed = allowedRoles.includes(role);

  if (!isAllowed) {
    // Redirect to proper dashboard based on their role
    if (role === "admin" || role === "Administrator") {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/workspace/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
