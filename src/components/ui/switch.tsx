import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className,
}: SwitchProps) {
  const switchId = React.useId();

  return (
    <label
      htmlFor={switchId}
      className={cn(
        "inline-flex items-center gap-3 cursor-pointer select-none",
        disabled && "cursor-not-allowed opacity-60",
        className
      )}
    >
      <div className="relative inline-flex items-center">
        <input
          id={switchId}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="h-6 w-11 rounded-full bg-line-strong peer-checked:bg-sage-deep peer-focus-visible:ring-2 peer-focus-visible:ring-sage-deep transition-colors duration-200" />
        <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform duration-200 peer-checked:translate-x-5 shadow-xs" />
      </div>

      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-sm font-medium text-foreground">{label}</span>
          )}
          {description && (
            <span className="text-xs text-foreground-faint">{description}</span>
          )}
        </div>
      )}
    </label>
  );
}
