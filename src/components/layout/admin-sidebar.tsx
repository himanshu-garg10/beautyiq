"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Award,
  FolderTree,
  FlaskConical,
  Globe,
  Store,
  Tag,
  Users,
  Flag,
  LifeBuoy,
  Database,
  ClipboardList,
  Settings,
  Shield,
  Layers,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminDataService } from "@/services/admin-data.service";

interface NavGroup {
  group: string;
  items: {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
  }[];
}

export function AdminSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const [openReports, setOpenReports] = React.useState(0);
  const [openSupport, setOpenSupport] = React.useState(0);

  React.useEffect(() => {
    AdminDataService.getDashboardMetrics().then((m) => {
      setOpenReports(m.openReportsCount);
      setOpenSupport(m.openSupportCount);
    });
  }, [pathname]);

  const navGroups: NavGroup[] = [
    {
      group: "Overview",
      items: [
        { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      group: "Catalog",
      items: [
        { label: "Products", href: "/admin/products", icon: Package },
        { label: "Catalog Control", href: "/admin/catalog", icon: Database },
        { label: "Brands", href: "/admin/brands", icon: Award },
        { label: "Categories", href: "/admin/categories", icon: FolderTree },
        { label: "Ingredients", href: "/admin/ingredients", icon: FlaskConical },
      ],
    },
    {
      group: "Marketplace",
      items: [
        { label: "Platforms", href: "/admin/platforms", icon: Globe },
        { label: "Sellers", href: "/admin/sellers", icon: Store },
        { label: "Product Listings", href: "/admin/listings", icon: Tag },
      ],
    },
    {
      group: "Customers",
      items: [
        { label: "Customer Management", href: "/admin/customers", icon: Users },
      ],
    },
    {
      group: "Operations",
      items: [
        {
          label: "Product Reports",
          href: "/admin/reports",
          icon: Flag,
          badge: openReports > 0 ? openReports : undefined,
        },
        {
          label: "Support Requests",
          href: "/admin/support",
          icon: LifeBuoy,
          badge: openSupport > 0 ? openSupport : undefined,
        },
        { label: "Data Quality", href: "/admin/data-quality", icon: Database },
      ],
    },
    {
      group: "System",
      items: [
        { label: "Activity Logs", href: "/admin/logs", icon: ClipboardList },
        { label: "Settings", href: "/admin/settings", icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        "w-64 shrink-0 border-r border-line bg-background-card flex flex-col justify-between min-h-[calc(100vh-64px)] p-4 overflow-y-auto",
        className
      )}
    >
      <div className="space-y-6">
        <div className="px-3 py-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-sage-deep bg-sage-tint/40 rounded border border-sage/20">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Admin Portal</span>
          </div>
          <span className="text-[0.65rem] px-1.5 py-0.5 rounded bg-sage-deep text-white font-mono">
            v1.0
          </span>
        </div>

        <nav className="space-y-5">
          {navGroups.map((group) => (
            <div key={group.group} className="space-y-1">
              <span className="px-3 text-[0.68rem] font-bold uppercase tracking-wider text-foreground-faint block">
                {group.group}
              </span>
              <div className="space-y-0.5">
                {group.items.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition-colors duration-150",
                        isActive
                          ? "bg-sage-deep text-white font-semibold shadow-xs"
                          : "text-foreground-muted hover:bg-background-elevated hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{link.label}</span>
                      </div>
                      {link.badge !== undefined && (
                        <span
                          className={cn(
                            "px-1.5 py-0.2 rounded-full text-[0.65rem] font-bold",
                            isActive
                              ? "bg-white text-sage-deep"
                              : "bg-clay text-white"
                          )}
                        >
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="border-t border-line pt-4 px-3 mt-6">
        <div className="flex items-center gap-3 text-xs text-foreground-faint">
          <Layers className="h-4 w-4 text-sage-deep shrink-0" />
          <div className="truncate">
            <p className="font-semibold text-foreground truncate">BeautyIQ Core Admin</p>
            <p className="text-[0.7rem] text-foreground-muted">Operational Boundary</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
