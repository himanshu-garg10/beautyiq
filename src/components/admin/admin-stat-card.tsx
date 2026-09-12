import * as React from "react";
import { cn } from "@/lib/utils";

interface AdminStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  badge?: string;
  className?: string;
}

export function AdminStatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendUp = true,
  badge,
  className,
}: AdminStatCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-line bg-background-card p-5 shadow-subtle hover:border-line-strong transition-all duration-200 flex flex-col justify-between",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
          {title}
        </span>
        <div className="flex h-9 w-9 items-center justify-center rounded bg-sage-tint/40 text-sage-deep">
          {icon}
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-baseline gap-2">
          <p className="font-mono text-3xl font-bold tracking-tight text-foreground">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {badge && (
            <span className="text-[0.7rem] font-bold px-1.5 py-0.5 rounded bg-background-elevated text-foreground-muted">
              {badge}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1 text-xs">
          {trend && (
            <span
              className={cn(
                "font-semibold",
                trendUp ? "text-status-success" : "text-status-warning"
              )}
            >
              {trend}
            </span>
          )}
          {subtitle && (
            <span className="text-foreground-faint truncate">{subtitle}</span>
          )}
        </div>
      </div>
    </div>
  );
}
