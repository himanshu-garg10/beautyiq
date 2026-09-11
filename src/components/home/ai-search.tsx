"use client";

import * as React from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const suggestions = [
  "Oily skin, acne, moisturizer under ₹800",
  "Fragrance-free serum for sensitive skin",
  "Something to fade dark spots",
];

export function AiSearch() {
  const [value, setValue] = React.useState("");
  const [focused, setFocused] = React.useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Visual prototype only — no functionality yet.
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        <div
          className={cn(
            "flex items-center gap-3 rounded-md border bg-white px-5 py-4 shadow-[0_1px_2px_rgba(38,36,32,0.04)] transition-all duration-200",
            focused
              ? "border-sage-deep shadow-[0_4px_18px_rgba(75,90,62,0.12)]"
              : "border-line-strong"
          )}
        >
          <span className="relative flex h-6 w-6 shrink-0 items-center justify-center">
            <Sparkles className="h-[18px] w-[18px] text-sage-deep" aria-hidden="true" />
            {focused && (
              <motion.span
                className="absolute inset-0 rounded-full bg-sage/20"
                initial={{ scale: 0.6, opacity: 0.6 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 1.1, repeat: Infinity, ease: "easeOut" }}
              />
            )}
          </span>

          <label htmlFor="ai-search" className="sr-only">
            Describe your skincare needs
          </label>
          <input
            id="ai-search"
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="I have oily skin, acne, and want a lightweight moisturizer under ₹800"
            className="min-w-0 flex-1 bg-transparent text-[0.95rem] text-ink placeholder:text-ink-faint focus:outline-none md:text-base"
          />

          <button
            type="submit"
            aria-label="Find my products"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-ink text-ivory transition-colors hover:bg-sage-deep"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs text-ink-faint">Try:</span>
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setValue(s)}
            className="rounded-full border border-line-strong bg-transparent px-3.5 py-1.5 text-xs text-ink-soft transition-colors hover:border-sage-deep hover:text-ink"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
