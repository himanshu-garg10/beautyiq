import * as React from "react";
import { cn } from "@/lib/utils";

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  description?: string;
}

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  label?: string;
  orientation?: "vertical" | "horizontal";
}

export function RadioGroup({
  name,
  options,
  value,
  onChange,
  className,
  label,
  orientation = "vertical",
}: RadioGroupProps) {
  return (
    <div className="w-full space-y-2">
      {label && (
        <span className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted">
          {label}
        </span>
      )}
      <div
        className={cn(
          "flex gap-3",
          orientation === "vertical" ? "flex-col" : "flex-row flex-wrap",
          className
        )}
      >
        {options.map((opt) => {
          const isSelected = value === opt.value;
          const optId = `${name}-${opt.value}`;

          return (
            <label
              key={opt.value}
              htmlFor={optId}
              className={cn(
                "flex items-start gap-3 rounded border border-line bg-background-card p-3 cursor-pointer transition-all duration-200 hover:border-line-strong",
                isSelected && "border-sage-deep bg-sage-tint/40 shadow-sm"
              )}
            >
              <input
                type="radio"
                id={optId}
                name={name}
                value={opt.value}
                checked={isSelected}
                onChange={() => onChange?.(opt.value)}
                className="sr-only"
              />
              <div
                className={cn(
                  "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-line-strong transition-colors",
                  isSelected && "border-sage-deep bg-sage-deep"
                )}
              >
                {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">
                  {opt.label}
                </span>
                {opt.description && (
                  <span className="text-xs text-foreground-faint mt-0.5">
                    {opt.description}
                  </span>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
