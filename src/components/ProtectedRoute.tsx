import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<
    "manager" | "accountant" | "barber" | "cashier" | "delivery_driver"
  >;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, loading } = useAuth();
  const [role, setRole] = useState<
    null | "manager" | "accountant" | "barber" | "cashier" | "delivery_driver"
  >(null);
  const [checkingRole, setCheckingRole] = useState<boolean>(!!allowedRoles);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user || !allowedRoles) return;
      setCheckingRole(true);
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data?.role) setRole(data.role as any);
      setCheckingRole(false);
    };
    fetchRole();
  }, [user, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles) {
    if (checkingRole) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }
    if (!role || !allowedRoles.includes(role)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};
