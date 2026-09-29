import * as React from "react";
import { cn } from "@/lib/utils";

export interface PillOption {
  id: string;
  label: string;
  count?: number;
}

export interface PillsProps {
  options: PillOption[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  className?: string;
  size?: "sm" | "md";
}

export function Pills({
  options,
  selectedIds,
  onToggle,
  className,
  size = "md",
}: PillsProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((opt) => {
        const isSelected = selectedIds.includes(opt.id);

        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onToggle(opt.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border border-line bg-background-card font-medium transition-all duration-200 hover:border-line-strong",
              size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm",
              isSelected &&
                "border-sage-deep bg-sage-tint text-sage-deep font-semibold shadow-xs"
            )}
          >
            <span>{opt.label}</span>
            {opt.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.2 text-[0.7rem] font-mono",
                  isSelected
                    ? "bg-sage-deep text-white"
                    : "bg-background-elevated text-foreground-muted"
                )}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
