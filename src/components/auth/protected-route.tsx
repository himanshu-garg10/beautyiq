"use client";

import * as React from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import type { UserRole } from "@/types";
import { Lock, ShieldAlert, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({
  children,
  allowedRoles = ["customer", "admin"],
}: ProtectedRouteProps) {
  const { user, role, openAuthModal } = useAuth();

  // Visitor not authenticated
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center max-w-md text-center space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sage-tint text-sage-deep shadow-xs">
          <Lock className="h-7 w-7" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Sign In to Continue
          </h2>
          <p className="text-xs text-foreground-muted mt-2 leading-relaxed">
            Please sign in or create a free account to access your personalized skin profile, routine tracker, and saved wishlist.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-3 w-full sm:w-auto">
          <Button
            id="protected-route-login-btn"
            variant="accent"
            size="md"
            onClick={() => openAuthModal("login")}
            className="w-full sm:w-auto font-semibold shadow-subtle"
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Sign In / Register
          </Button>
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" size="md" className="w-full sm:w-auto">
              Explore Homepage
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // User logged in but lacks required role
  if (!allowedRoles.includes(role)) {
    const isAdminOnly = allowedRoles.length === 1 && allowedRoles[0] === "admin";

    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center max-w-md text-center space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-clay-tint text-clay shadow-xs">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">
            {isAdminOnly ? "Admin Access Restricted" : "Access Restricted"}
          </h2>
          <p className="text-xs text-foreground-muted mt-2 leading-relaxed">
            {isAdminOnly
              ? "You are currently logged in with a standard customer account. This portal requires administrator permissions."
              : `This area requires ${allowedRoles.join(" or ")} permissions.`}
          </p>
        </div>

        <div className="pt-2">
          <Link href="/dashboard">
            <Button variant="primary" size="sm">
              Return to Customer Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

