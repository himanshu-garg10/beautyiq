"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FlaskConical,
  Users,
  Database,
  Activity,
  Shield,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminNavLinks = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Products Catalog", href: "/admin/products", icon: Package },
  { label: "Ingredients DB", href: "/admin/ingredients", icon: FlaskConical },
  { label: "Customer Accounts", href: "/admin/users", icon: Users },
  { label: "Data Quality Pipeline", href: "/admin/data-quality", icon: Database },
  { label: "System Health & Scrapes", href: "/admin/health", icon: Activity },
];

export function AdminSidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "w-64 shrink-0 border-r border-line bg-background-card flex flex-col justify-between min-h-[calc(100vh-64px)] p-4",
        className
      )}
    >
      <div className="space-y-6">
        <div className="px-3 py-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sage-deep bg-sage-tint/50 rounded">
          <Shield className="h-4 w-4" />
          <span>BeautyIQ Admin Portal</span>
        </div>

        <nav className="space-y-1">
          {adminNavLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded text-sm font-medium transition-colors duration-150",
                  isActive
                    ? "bg-sage-deep text-white shadow-xs font-semibold"
                    : "text-foreground-muted hover:bg-background-elevated hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-line pt-4 px-3">
        <div className="flex items-center gap-3 text-xs text-foreground-faint">
          <Layers className="h-4 w-4 text-sage-deep" />
          <div>
            <p className="font-semibold text-foreground">BeautyIQ Core v1.0</p>
            <p>Admin Control Boundary</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
