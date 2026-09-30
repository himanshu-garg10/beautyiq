"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Star,
  CheckCircle2,
  Heart,
  Scale,
  ArrowRight,
  ShieldCheck,
  Brain,
  Info,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { useComparison } from "@/context/comparison-context";
import { cn } from "@/lib/utils";

export function AiRecommendationShowcase() {
  const { user, toggleWishlist } = useAuth();
  const { addToast } = useToast();
  const { isInComparison, addToComparison, removeFromComparison } = useComparison();

  const productId = "p1";
  const isSaved = user?.wishlistIds?.includes(productId) || false;
  const isCompared = isInComparison(productId);

  const handleWishlist = () => {
    toggleWishlist(productId);
    addToast({
      type: isSaved ? "info" : "success",
      title: isSaved ? "Removed from Wishlist" : "Saved to Wishlist",
      description: "Minimalist 10% Niacinamide Face Serum",
    });
  };

  const handleCompare = () => {
    if (isCompared) {
      removeFromComparison(productId);
      addToast({
        type: "info",
        title: "Removed from Comparison",
        description: "10% Niacinamide Face Serum",
      });
    } else {
      addToComparison(productId);
      addToast({
        type: "success",
        title: "Added to Comparison Matrix",
        description: "10% Niacinamide Face Serum",
      });
    }
  };

  return (
    <section className="border-b border-line bg-gradient-to-b from-background via-champagne-tint/20 to-background py-16 sm:py-20">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-champagne/40 bg-champagne-tint/70 text-xs font-semibold text-champagne-deep">
            <Brain className="h-3.5 w-3.5 text-champagne-deep" />
            <span>AI Recommendation Engine</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.6rem] font-bold tracking-tight text-foreground">
            Recommendations That Understand You
          </h2>

          <p className="text-base text-foreground-muted leading-relaxed">
            Every recommendation is calculated using multi-variable dermatology algorithms,
            not advertising budgets or commercial sponsorship.
          </p>
        </div>

        {/* Large AI Recommendation Showcase Card */}
        <div className="mt-12 max-w-4xl mx-auto rounded-3xl border border-line/80 bg-background-card p-6 sm:p-8 lg:p-10 shadow-lg relative overflow-hidden">
          {/* Subtle background glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-16 -right-16 w-80 h-80 rounded-full bg-champagne-tint/60 blur-3xl opacity-60 dark:opacity-20"
          />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-center">
            {/* Left: Product Imagery & Badges (5 cols) */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[3/4] w-full max-w-sm mx-auto overflow-hidden rounded-2xl bg-background-elevated border border-line shadow-sm">
                <Image
                  src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=700&auto=format&fit=crop"
                  alt="Minimalist 10% Niacinamide Face Serum"
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />

                {/* Compatibility Badge Overlay */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 rounded-full border border-champagne/40 bg-background-card/95 px-3 py-1 shadow-sm backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5 text-champagne-deep" />
                  <span className="text-xs font-bold text-champagne-deep font-mono">
                    92% Compatibility
                  </span>
                </div>

                {/* Wishlist Button Overlay */}
                <button
                  type="button"
                  onClick={handleWishlist}
                  aria-label="Wishlist"
                  className={cn(
                    "absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-line bg-background-card/90 backdrop-blur-md transition-transform hover:scale-110 shadow-xs",
                    isSaved ? "text-rose-500 bg-rose-50 border-rose-200" : "text-foreground-muted"
                  )}
                >
                  <Heart className={cn("h-4 w-4", isSaved && "fill-current")} />
                </button>
              </div>
            </div>

            {/* Right: Scientific Analysis & AI Explanations (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Brand, Rating & Price Header */}
              <div className="space-y-1.5 pb-3 border-b border-line/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-champagne-deep">
                    Minimalist • 30 ml
                  </span>
                  <div className="flex items-center gap-1 text-xs">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-foreground">4.6</span>
                    <span className="text-foreground-faint">(8,420 reviews)</span>
                  </div>
                </div>

                <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground leading-snug">
                  10% Niacinamide Face Serum with Zinc PCA
                </h3>

                <div className="flex items-baseline gap-2.5 pt-1">
                  <span className="font-display text-2xl font-bold text-foreground">₹549</span>
                  <span className="text-sm text-foreground-faint line-through">₹599</span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                    Best Price on Nykaa
                  </span>
                </div>
              </div>

              {/* Ingredient Match Breakdown */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground-faint block">
                  Ingredient Match Breakdown:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl border border-line bg-background-elevated/40 p-2.5">
                    <span className="font-semibold text-foreground block">Niacinamide (10%)</span>
                    <span className="text-[0.72rem] text-foreground-muted">
                      Suppresses excess sebum &amp; strengthens barrier
                    </span>
                  </div>
                  <div className="rounded-xl border border-line bg-background-elevated/40 p-2.5">
                    <span className="font-semibold text-foreground block">Zinc PCA (1%)</span>
                    <span className="text-[0.72rem] text-foreground-muted">
                      Antibacterial action against breakout-causing microbes
                    </span>
                  </div>
                </div>
              </div>

              {/* Why This Product? */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground-faint block">
                  Why This Product Fits You:
                </span>
                <ul className="space-y-1.5 text-xs text-foreground-muted">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-champagne-deep shrink-0 mt-0.5" />
                    <span>Non-comedogenic gel texture perfectly suited for oily &amp; combination profiles.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-champagne-deep shrink-0 mt-0.5" />
                    <span>Free of synthetic fragrance, essential oils, drying alcohols, and parabens.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-champagne-deep shrink-0 mt-0.5" />
                    <span>Clinical concentration yields proven efficacy within 4–6 weeks of ritual use.</span>
                  </li>
                </ul>
              </div>

              {/* Small AI Explanation Panel (Required) */}
              <div className="rounded-xl border border-champagne/40 bg-champagne-tint/60 p-3 text-xs text-foreground flex items-start gap-2.5 shadow-xs">
                <Sparkles className="h-4 w-4 text-champagne-deep shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <span className="font-bold text-champagne-deep">AI Explanation: </span>
                  Recommended because it matches your selected preferences and has strong ingredient compatibility.
                </p>
              </div>

              {/* Interactive CTA Controls */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link href="/products/p1">
                  <Button
                    size="sm"
                    variant="accent"
                    className="rounded-full px-5 py-2 font-semibold text-xs bg-foreground text-background hover:bg-foreground/90 dark:bg-champagne-deep dark:text-white"
                  >
                    <span>View Full Formula Specs</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>

                <button
                  type="button"
                  onClick={handleCompare}
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full border transition-all shadow-xs",
                    isCompared
                      ? "border-champagne-deep bg-champagne-deep text-white"
                      : "border-line bg-background-card hover:bg-background-elevated text-foreground"
                  )}
                >
                  <Scale className="h-3.5 w-3.5" />
                  <span>{isCompared ? "Added to Matrix" : "Compare Across Stores"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
