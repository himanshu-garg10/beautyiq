"use client";

import * as React from "react";
import { ArrowRight, Sparkles, Wand2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useChatContext } from "@/context/chat-context";

const suggestions = [
  "Oily skin with acne, lightweight moisturizer under ₹800",
  "Fragrance-free soothing serum for sensitive skin",
  "Niacinamide serum to fade dark spots and marks",
  "Matte mineral sunscreen for oily skin under ₹1000",
];

export function AiSearch() {
  const { openChat, sendMessage } = useChatContext();
  const [value, setValue] = React.useState("");
  const [focused, setFocused] = React.useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const query = value.trim() || "I have oily skin with acne and want a lightweight moisturizer under ₹800";
    openChat();
    void sendMessage(query);
  }

  function handleSuggestionClick(s: string) {
    setValue(s);
    openChat();
    void sendMessage(s);
  }

  return (
    <div className="w-full space-y-4">
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl border bg-background-card p-2 sm:p-2.5 shadow-md transition-all duration-300",
            focused
              ? "border-sage-deep shadow-lg ring-2 ring-sage-deep/20"
              : "border-line hover:border-line-strong"
          )}
        >
          {/* Pulsing Sparkles Icon */}
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sage-tint text-sage-deep">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
            {focused && (
              <motion.span
                className="absolute inset-0 rounded-lg bg-sage/20"
                initial={{ scale: 0.8, opacity: 0.6 }}
                animate={{ scale: 1.4, opacity: 0 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
              />
            )}
          </div>

          <label htmlFor="ai-search" className="sr-only">
            Describe your skincare needs in natural language
          </label>
          <input
            id="ai-search"
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="e.g. Oily skin, acne marks, need a fragrance-free serum under ₹1000..."
            className="min-w-0 flex-1 bg-transparent px-2 text-[0.92rem] text-foreground placeholder:text-foreground-faint focus:outline-none md:text-[0.98rem]"
          />

          <button
            type="submit"
            aria-label="Analyze requirements with AI"
            className="flex h-10 sm:h-11 items-center gap-1.5 px-4 shrink-0 rounded-lg bg-sage-deep text-white font-semibold text-xs transition-all hover:bg-sage shadow-subtle hover:shadow-md"
          >
            <span>Analyze</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>

      {/* Suggestion Prompts */}
      <div className="flex flex-wrap items-center gap-2 pt-0.5">
        <span className="text-[0.72rem] font-mono uppercase tracking-wider text-foreground-faint flex items-center gap-1">
          <Wand2 className="h-3 w-3 text-sage-deep" /> Try asking:
        </span>
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => handleSuggestionClick(s)}
            className="rounded-full border border-line bg-background-card/80 px-3 py-1 text-xs text-foreground-muted transition-all hover:border-sage-deep hover:text-foreground hover:bg-sage-tint/40 shadow-xs"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
