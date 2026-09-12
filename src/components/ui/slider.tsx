import * as React from "react";
import { cn } from "@/lib/utils";

export interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  formatValue?: (val: number) => string;
}

export function Slider({
  className,
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  formatValue = (v) => `${v}`,
  disabled,
  ...props
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("w-full space-y-2", className)}>
      <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-foreground-muted">
        {label && <span>{label}</span>}
        <span className="font-mono text-sage-deep">{formatValue(value)}</span>
      </div>

      <div className="relative flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-2 w-full appearance-none rounded-full bg-line cursor-pointer accent-sage-deep focus:outline-none focus:ring-1 focus:ring-sage-deep disabled:cursor-not-allowed"
          style={{
            background: `linear-gradient(to right, var(--sage-deep) 0%, var(--sage-deep) ${percentage}%, var(--line) ${percentage}%, var(--line) 100%)`,
          }}
          {...props}
        />
      </div>

      <div className="flex justify-between text-[0.7rem] text-foreground-faint font-mono">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
}
