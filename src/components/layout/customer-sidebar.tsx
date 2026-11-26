"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  Package,
  Award,
  Scale,
  Heart,
  History,
  Bell,
  User,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationService } from "@/services/notification.service";
import { useAuth } from "@/context/auth-context";

const customerNavLinks = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Browse Products", href: "/products", icon: Package },
  { label: "Recommendations", href: "/recommendations", icon: Award },
  { label: "Product Comparison", href: "/compare", icon: Scale },
  { label: "Saved Wishlist", href: "/wishlist", icon: Heart },
  { label: "Activity History", href: "/history", icon: History },
  { label: "Notifications", href: "/notifications", icon: Bell, hasBadge: true },
  { label: "My Skin Profile", href: "/profile", icon: User },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function CustomerSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [unreadNotifs, setUnreadNotifs] = React.useState(0);

  React.useEffect(() => {
    if (user) {
      setUnreadNotifs(NotificationService.getUnreadCount(user.id));
    }
  }, [user, pathname]);

  return (
    <aside
      className={cn(
        "w-64 shrink-0 border-r border-line bg-background-card flex flex-col justify-between min-h-[calc(100vh-72px)] p-4",
        className
      )}
    >
      <div className="space-y-6">
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted flex items-center justify-between">
          <span>Customer Command Center</span>
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
                  "flex items-center justify-between px-3.5 py-2.5 rounded text-sm font-medium transition-colors duration-150",
                  isActive
                    ? "bg-sage-deep text-white shadow-xs font-semibold"
                    : "text-foreground-muted hover:bg-background-elevated hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{link.label}</span>
                </div>
                {link.hasBadge && unreadNotifs > 0 && (
                  <span
                    className={cn(
                      "flex h-5 min-w-5 items-center justify-center rounded-full text-[0.65rem] font-bold px-1.5",
                      isActive ? "bg-white text-sage-deep" : "bg-sage-deep text-white"
                    )}
                  >
                    {unreadNotifs}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {user && (
        <div className="p-3 rounded-lg border border-line bg-background-elevated/50 space-y-1 text-xs">
          <span className="text-foreground-faint text-[0.65rem] uppercase font-bold tracking-wider block">
            Active Skin Profile
          </span>
          <p className="font-semibold text-foreground truncate">
            {user.skinProfile?.skinType || "Combination"} Skin
          </p>
          <span className="text-[0.7rem] text-sage-deep font-medium block">
            {user.skinProfile?.isOnboardingComplete ? "✓ Profile Verified" : "Needs Completion"}
          </span>
        </div>
      )}
    </aside>
  );
}
