import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, disabled, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted"
          >
            {label}
          </label>
        )}

        <textarea
          id={textareaId}
          disabled={disabled}
          className={cn(
            "flex min-h-[100px] w-full rounded border border-line bg-background-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground-faint transition-all duration-200 focus:border-sage-deep focus:outline-none focus:ring-1 focus:ring-sage-deep disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-status-error focus:border-status-error focus:ring-status-error",
            className
          )}
          ref={ref}
          {...props}
        />

        {error ? (
          <p className="text-xs text-status-error font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-foreground-faint">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
