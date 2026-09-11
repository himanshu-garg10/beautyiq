import * as React from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: "underline" | "pills";
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  className,
  variant = "underline",
}: TabsProps) {
  return (
    <div
      className={cn(
        "flex overflow-x-auto no-scrollbar",
        variant === "underline"
          ? "border-b border-line gap-6"
          : "bg-background-elevated p-1 rounded-md gap-1",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 focus:outline-none",
              variant === "underline"
                ? cn(
                    "py-3 border-b-2",
                    isActive
                      ? "border-sage-deep text-sage-deep font-semibold"
                      : "border-transparent text-foreground-muted hover:text-foreground hover:border-line-strong"
                  )
                : cn(
                    "px-4 py-2 rounded-sm",
                    isActive
                      ? "bg-background-card text-foreground shadow-xs font-semibold"
                      : "text-foreground-muted hover:text-foreground"
                  )
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-mono",
                  isActive
                    ? "bg-sage-tint text-sage-deep"
                    : "bg-background-elevated text-foreground-faint"
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
