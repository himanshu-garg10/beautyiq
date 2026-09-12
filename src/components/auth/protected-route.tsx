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
    const isAdminOnly = allowedRoles.length === 1 && allowedRoles[0] === "admin";

    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center max-w-md text-center space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-clay-tint text-clay shadow-xs">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">
            {isAdminOnly ? "Admin Access Restricted" : "Access Restricted"}
          </h2>
          <p className="text-xs text-foreground-muted mt-1 leading-relaxed">
            {isAdminOnly
              ? `You are currently logged in as a ${role}. Regular customer accounts do not have permission to access the BeautyIQ Admin Console.`
              : `This area requires ${allowedRoles.join(" or ")} permissions. You are currently browsing as ${role}.`}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
          {role === "customer" && (
            <a href="/dashboard">
              <Button variant="primary" size="sm">
                Return to Customer Dashboard
              </Button>
            </a>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => switchRole(allowedRoles[0] || "customer")}
          >
            Switch to Demo {allowedRoles[0] || "admin"}
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
