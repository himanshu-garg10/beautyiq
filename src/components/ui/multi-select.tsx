"use client";

import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type MultiSelectOption = { value: string; label: string };

type MultiSelectProps = {
  label: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  className?: string;
};

/** A compact checkbox dropdown which keeps every selected value visible and removable. */
export function MultiSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Select one or more",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  const toggle = (option: string) => {
    onChange(value.includes(option) ? value.filter((item) => item !== option) : [...value, option]);
  };

  return (
    <div ref={rootRef} className={cn("relative w-full space-y-1.5", className)}>
      <span className="block text-sm font-bold text-foreground">{label}</span>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex min-h-11 w-full items-center gap-2 rounded-xl border border-line bg-background-card px-3 py-2 text-left text-sm transition-colors",
          open ? "border-sage-deep ring-1 ring-sage-deep" : "hover:border-line-strong"
        )}
      >
        <span className="flex min-w-0 flex-1 flex-wrap gap-1.5">
          {value.length ? value.map((item) => (
            <span
              key={item}
              className="inline-flex max-w-full items-center gap-1 rounded-full bg-sage-tint px-2 py-0.5 text-xs font-semibold text-sage-deep"
              onClick={(event) => event.stopPropagation()}
            >
              <span className="truncate">{options.find((option) => option.value === item)?.label || item}</span>
              <span
                role="button"
                tabIndex={0}
                aria-label={`Remove ${item}`}
                onClick={() => toggle(item)}
                onKeyDown={(event) => event.key === "Enter" && toggle(item)}
                className="rounded-full p-0.5 hover:bg-sage-deep/15"
              ><X className="h-3 w-3" /></span>
            </span>
          )) : <span className="text-foreground-faint">{placeholder}</span>}
        </span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-foreground-faint transition-transform", open && "rotate-180")} />
      </button>

      {open ? (
        <div className="absolute z-30 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-line bg-background-card p-1.5 shadow-lg">
          {options.map((option) => {
            const selected = value.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggle(option.value)}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-foreground transition-colors hover:bg-background-elevated"
              >
                <span className={cn("flex h-4 w-4 items-center justify-center rounded border", selected ? "border-sage-deep bg-sage-deep text-white" : "border-line-strong bg-background-card")}>
                  {selected ? <Check className="h-3 w-3" /> : null}
                </span>
                {option.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
