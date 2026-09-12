"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, Shield, User, LogOut, Search } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";

export function AdminHeader() {
  const { user, switchRole, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-line bg-background-card px-6 shadow-subtle">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-xl tracking-tight text-foreground">
            Beauty<span className="italic text-sage-deep">IQ</span>
          </span>
        </Link>

        <span className="hidden sm:inline-block h-4 w-px bg-line" aria-hidden="true" />

        <div className="hidden md:flex items-center gap-2 rounded bg-background-elevated px-3 py-1.5 text-xs text-foreground-muted">
          <Search className="h-3.5 w-3.5 text-foreground-faint" />
          <span>Quick Admin Command (Press ⌘K)</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Role Switcher Demo Control */}
        <div className="flex items-center gap-2 bg-background-elevated p-1 rounded text-xs font-mono">
          <span className="text-foreground-faint px-1">Role:</span>
          <button
            onClick={() => switchRole("customer")}
            className="px-2 py-0.5 rounded text-foreground-muted hover:bg-background-card"
          >
            Customer
          </button>
          <button
            onClick={() => switchRole("admin")}
            className="px-2 py-0.5 rounded bg-sage-deep text-white font-semibold"
          >
            Admin
          </button>
        </div>

        <ThemeToggle />

        <div className="h-5 w-px bg-line" />

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-tint text-sage-deep font-semibold text-xs">
              AD
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-foreground leading-tight">
                {user?.name || "Admin"}
              </p>
              <p className="text-[0.7rem] text-status-success font-mono">System Admin</p>
            </div>
          </div>

          <Button variant="ghost" size="icon" onClick={logout} title="Exit Admin">
            <LogOut className="h-4 w-4 text-foreground-faint hover:text-status-error" />
          </Button>
        </div>
      </div>
    </header>
  );
}
