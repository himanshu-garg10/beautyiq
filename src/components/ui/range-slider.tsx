"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type RangeSliderProps = {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  formatValue?: (value: number) => string;
  className?: string;
};

/** Two-thumb price range control. Both limits are set directly from the bar. */
export function RangeSlider({ label, min, max, step = 1, value, onChange, formatValue = String, className }: RangeSliderProps) {
  const [low, high] = value;
  const lowPercent = ((low - min) / (max - min)) * 100;
  const highPercent = ((high - min) / (max - min)) * 100;

  return (
    <div className={cn("w-full space-y-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-foreground">{label}</span>
        <span className="text-xs font-semibold text-sage-deep">{formatValue(low)} – {formatValue(high)}</span>
      </div>
      <div className="relative h-6">
        <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-line" />
        <div className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-sage-deep" style={{ left: `${lowPercent}%`, right: `${100 - highPercent}%` }} />
        <input
          aria-label={`${label} minimum`}
          type="range"
          min={min}
          max={max}
          step={step}
          value={low}
          onChange={(event) => onChange([Math.min(Number(event.target.value), high), high])}
          className="range-thumb pointer-events-none absolute inset-0 z-10 h-6 w-full appearance-none bg-transparent"
        />
        <input
          aria-label={`${label} maximum`}
          type="range"
          min={min}
          max={max}
          step={step}
          value={high}
          onChange={(event) => onChange([low, Math.max(Number(event.target.value), low)])}
          className="range-thumb pointer-events-none absolute inset-0 z-20 h-6 w-full appearance-none bg-transparent"
        />
      </div>
      <div className="flex justify-between text-[0.7rem] font-mono text-foreground-faint"><span>{formatValue(min)}</span><span>{formatValue(max)}</span></div>
    </div>
  );
}
