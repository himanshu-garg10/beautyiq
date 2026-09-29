"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  description?: string;
}

interface ToastItemProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const toastIcons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const toastStyles = {
  success: "border-status-success/30 bg-background-card text-status-success",
  error: "border-status-error/30 bg-background-card text-status-error",
  info: "border-status-info/30 bg-background-card text-status-info",
  warning: "border-status-warning/30 bg-background-card text-status-warning",
};

export function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const Icon = toastIcons[toast.type];

  return (
    <div
      className={cn(
        "flex w-full max-w-sm items-start gap-3 rounded border p-4 shadow-lg transition-all duration-300 animate-fade-in",
        toastStyles[toast.type]
      )}
    >
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="flex-1">
        <h6 className="font-semibold text-sm text-foreground">{toast.title}</h6>
        {toast.description && (
          <p className="text-xs text-foreground-muted mt-0.5">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-foreground-faint hover:text-foreground p-0.5 rounded"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
