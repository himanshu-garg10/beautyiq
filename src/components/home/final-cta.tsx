"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, ShieldCheck, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden border-t border-line bg-gradient-to-b from-background via-champagne-tint/30 to-background py-16 sm:py-20">
      {/* Subtle ambient luxury blur */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[280px] rounded-full bg-champagne-tint/70 blur-3xl opacity-60 dark:opacity-20"
      />

      <Container className="relative">
        <div className="mx-auto max-w-3xl rounded-3xl border border-champagne/40 bg-background-card/90 p-8 sm:p-12 text-center shadow-lg backdrop-blur-sm space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-champagne/40 bg-champagne-tint/70 text-xs font-semibold text-champagne-deep">
            <Sparkles className="h-3.5 w-3.5 text-champagne-deep" />
            <span>Personalized Intelligence Engine</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight">
            Find Your Beauty Match
          </h2>

          <p className="max-w-xl mx-auto text-base sm:text-lg text-foreground-muted leading-relaxed">
            Stop guessing. Let BeautyIQ help you discover products that fit your preferences.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <Link href="/onboarding">
              <Button
                size="lg"
                variant="accent"
                className="rounded-full px-8 py-3.5 font-semibold text-sm shadow-md hover:shadow-lg transition-all gap-2 bg-foreground text-background hover:bg-foreground/90 dark:bg-champagne-deep dark:text-white"
              >
                <span>Start Your Beauty Journey</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="/skin-scan">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-6 py-3.5 font-medium text-sm border-sage/40 hover:border-sage-deep/60 bg-background hover:bg-sage-tint/40 gap-2"
              >
                <Camera className="h-4 w-4 text-sage-deep" />
                <span>Try Skin Scan</span>
              </Button>
            </Link>

            <Link href="/products">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-6 py-3.5 font-medium text-sm border-line hover:border-champagne/60 bg-background hover:bg-background-elevated"
              >
                <span>Explore Products</span>
              </Button>
            </Link>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-foreground-faint font-medium border-t border-line/60">
            <span>✓ Guest browsing available</span>
            <span>✓ Ingredient-first product discovery</span>
            <span>✓ Source-linked offers when available</span>
          </div>
        </div>
      </Container>
    </section>
  );
}
