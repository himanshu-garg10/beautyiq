import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      options,
      placeholder = "Select an option",
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            id={selectId}
            disabled={disabled}
            className={cn(
              "flex h-11 w-full appearance-none rounded border border-line bg-background-card px-3.5 py-2 pr-10 text-sm text-foreground transition-all duration-200 focus:border-sage-deep focus:outline-none focus:ring-1 focus:ring-sage-deep disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-status-error focus:border-status-error focus:ring-status-error",
              className
            )}
            ref={ref}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>

          <ChevronDown className="pointer-events-none absolute right-3.5 h-4 w-4 text-foreground-faint" />
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
Select.displayName = "Select";

export { Select };
