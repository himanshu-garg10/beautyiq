import * as React from "react";
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "error";
  title?: string;
  onClose?: () => void;
}

const variantStyles = {
  info: "border-info/30 bg-status-info-bg text-status-info dark:bg-status-info-bg/40",
  success: "border-success/30 bg-status-success-bg text-status-success dark:bg-status-success-bg/40",
  warning: "border-warning/30 bg-status-warning-bg text-status-warning dark:bg-status-warning-bg/40",
  error: "border-error/30 bg-status-error-bg text-status-error dark:bg-status-error-bg/40",
};

const variantIcons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
};

export function Alert({
  className,
  variant = "info",
  title,
  children,
  onClose,
  ...props
}: AlertProps) {
  const IconComponent = variantIcons[variant];

  return (
    <div
      role="alert"
      className={cn(
        "relative flex w-full items-start gap-3 rounded border p-4 text-sm transition-all duration-200",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      <IconComponent className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="flex-1 space-y-1">
        {title && <h5 className="font-semibold leading-none tracking-tight">{title}</h5>}
        <div className="text-sm opacity-90 leading-relaxed">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 p-1 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Close alert"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
