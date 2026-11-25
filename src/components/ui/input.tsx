import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3.5 text-foreground-faint">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            type={type}
            disabled={disabled}
            className={cn(
              "flex h-11 w-full rounded-xl border border-line/60 bg-background-card px-3.5 py-2 text-sm text-foreground placeholder:text-foreground-faint transition-all duration-200 focus:border-champagne focus:outline-none focus:ring-2 focus:ring-champagne/20 disabled:cursor-not-allowed disabled:opacity-50",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error && "border-status-error focus:border-status-error focus:ring-status-error/20",
              className
            )}
            ref={ref}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3.5 text-foreground-faint">
              {rightIcon}
            </div>
          )}
        </div>

        {error ? (
          <p className="text-xs text-status-error font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-foreground-faint">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
