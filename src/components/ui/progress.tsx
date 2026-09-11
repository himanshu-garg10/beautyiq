import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  showValueLabel?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "sage" | "clay" | "gradient" | "success" | "warning" | "error";
  className?: string;
}

const variantGradients = {
  sage: "bg-sage-deep",
  clay: "bg-clay",
  gradient: "bg-gradient-to-r from-sage to-sage-deep",
  success: "bg-status-success",
  warning: "bg-status-warning",
  error: "bg-status-error",
};

export function Progress({
  value,
  max = 100,
  label,
  showValueLabel = true,
  size = "md",
  variant = "sage",
  className,
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const heightClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {(label || showValueLabel) && (
        <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-foreground-muted">
          {label && <span>{label}</span>}
          {showValueLabel && (
            <span className="font-mono text-sage-deep font-bold">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-line/60",
          heightClasses[size]
        )}
      >
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out rounded-full",
            variantGradients[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
