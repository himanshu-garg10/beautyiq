"use client";

import * as React from "react";
import { useAuth } from "@/context/auth-context";
import type { UserRole } from "@/types";
import { EmptyState } from "@/components/ui/empty-state";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({
  children,
  allowedRoles = ["customer", "admin"],
}: ProtectedRouteProps) {
  const { user, role, switchRole } = useAuth();

  if (!user || !allowedRoles.includes(role)) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <EmptyState
          title="Access Restricted"
          description={`This area requires ${allowedRoles.join(
            " or "
          )} permissions. You are currently browsing as ${role}.`}
          icon={<ShieldAlert className="h-7 w-7 text-status-warning" />}
          actionLabel="Switch to Demo Admin/Customer"
          onAction={() => switchRole(allowedRoles[0] || "customer")}
        />
      </div>
    );
  }

  return <>{children}</>;
}
