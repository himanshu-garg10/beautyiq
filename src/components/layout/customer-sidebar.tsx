"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Sparkles,
  Heart,
  History,
  Scale,
  Settings,
  Sliders,
} from "lucide-react";
import { cn } from "@/lib/utils";

const customerNavLinks = [
  { label: "My Skin Profile", href: "/profile", icon: User },
  { label: "Skin Questionnaire", href: "/onboarding", icon: Sliders },
  { label: "Personalized Recommendations", href: "/recommendations", icon: Sparkles },
  { label: "Product Comparison", href: "/compare", icon: Scale },
  { label: "Saved Wishlist", href: "/wishlist", icon: Heart },
  { label: "Activity History", href: "/history", icon: History },
];

export function CustomerSidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "w-64 shrink-0 border-r border-line bg-background-card flex flex-col justify-between min-h-[calc(100vh-72px)] p-4",
        className
      )}
    >
      <div className="space-y-6">
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
          Customer Portal
        </div>

        <nav className="space-y-1">
          {customerNavLinks.map((link) => {
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
    </aside>
  );
}
