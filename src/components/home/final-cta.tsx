"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Camera, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden border-t border-line/70 bg-[image:var(--gradient-hero)] py-16 sm:py-24">
      {/* Subtle ambient luxury blur */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-champagne/20 blur-3xl opacity-75 dark:opacity-20"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-1/4 top-1/3 h-52 w-52 rounded-full bg-sage-tint/60 blur-3xl opacity-60 dark:opacity-15"
      />

      <Container className="relative">
        <ScrollReveal>
          <div className="mx-auto max-w-4xl space-y-6 rounded-4xl border border-champagne/35 bg-[image:var(--gradient-card)] p-8 text-center shadow-elevated backdrop-blur-md sm:p-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-champagne/40 bg-champagne-tint/80 px-3.5 py-1 text-xs font-semibold tracking-wide text-champagne-deep">
              <Sparkles className="h-3.5 w-3.5 text-champagne-deep" />
              <span>Personalized Intelligence Engine</span>
            </div>

            <h2 className="font-display text-3xl font-medium leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Find Your Beauty Match
            </h2>

            <p className="mx-auto max-w-xl text-base leading-relaxed text-foreground-muted sm:text-lg">
              Stop guessing. Let BeautyIQ help you discover products that fit your preferences.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
              <Link href="/onboarding">
                <Button
                  size="lg"
                  variant="accent"
                  className="rounded-full px-8"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Start Your Beauty Journey
                </Button>
              </Link>

              <Link href="/skin-scan">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-sage/40 px-6 hover:border-sage-deep/60 hover:bg-sage-tint/40"
                  leftIcon={<Camera className="h-4 w-4 text-sage-deep" />}
                >
                  Try Skin Scan
                </Button>
              </Link>

              <Link href="/products">
                <Button size="lg" variant="outline" className="rounded-full px-6">
                  Explore Products
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 border-t border-line/60 pt-5 text-xs font-medium text-foreground-faint">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-sage-deep" />
                Guest browsing available
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-sage-deep" />
                Ingredient-first product discovery
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-sage-deep" />
                Source-linked offers when available
              </span>
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
