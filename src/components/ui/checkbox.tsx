import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  description?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, checked, disabled, onChange, ...props }, ref) => {
    const generatedId = React.useId();
    const checkboxId = id || generatedId;

    return (
      <label
        htmlFor={checkboxId}
        className={cn(
          "inline-flex items-start gap-3 cursor-pointer select-none",
          disabled && "cursor-not-allowed opacity-60",
          className
        )}
      >
        <div className="relative flex items-center mt-0.5">
          <input
            id={checkboxId}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            className="peer sr-only"
            ref={ref}
            {...props}
          />
          <div className="h-5 w-5 rounded border border-line-strong bg-background-card transition-colors peer-checked:bg-sage-deep peer-checked:border-sage-deep peer-focus-visible:ring-2 peer-focus-visible:ring-sage-deep flex items-center justify-center">
            <Check className="h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
          </div>
        </div>

        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <span className="text-sm font-medium text-foreground leading-tight">
                {label}
              </span>
            )}
            {description && (
              <span className="text-xs text-foreground-faint leading-normal mt-0.5">
                {description}
              </span>
            )}
          </div>
        )}
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
