"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Scale,
  Star,
  CheckCircle2,
  TrendingDown,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-champagne-tint/30 to-background border-b border-line/60">
      {/* Subtle luxury ambient ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[340px] bg-champagne-tint/80 rounded-full blur-3xl opacity-60 dark:opacity-20"
      />

      <Container className="relative pt-8 pb-12 sm:pt-12 sm:pb-16 lg:pt-14 lg:pb-16">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
          
          {/* ================= LEFT COLUMN ================= */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="space-y-6 max-w-xl"
          >
            {/* Subtle Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-champagne/40 bg-champagne-tint/70 text-xs font-semibold text-champagne-deep dark:bg-champagne-tint/20">
              <Sparkles className="h-3.5 w-3.5 text-champagne-deep animate-pulse" />
              <span>AI-Powered Skincare &amp; Price Intelligence</span>
            </div>

            {/* Main Editorial Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.6rem] font-bold tracking-tight text-foreground leading-[1.12]">
              Beauty Shopping, <br />
              <span className="italic font-normal text-champagne-deep">Made Intelligent.</span>
            </h1>

            {/* Supporting Subtitle */}
            <p className="text-base sm:text-lg leading-relaxed text-foreground-muted font-normal">
              Discover products that actually fit you. Get personalized recommendations,
              understand ingredients, and compare beauty products across platforms.
            </p>

            {/* Primary & Secondary Call to Actions */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link href="/recommendations">
                <Button
                  size="lg"
                  variant="accent"
                  className="rounded-full px-6 py-3 font-semibold text-sm shadow-md hover:shadow-lg transition-all gap-2 bg-foreground text-background hover:bg-foreground/90 dark:bg-champagne-deep dark:text-white"
                >
                  <span>Get Personalized Recommendations</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/products">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-6 py-3 font-medium text-sm border-line hover:border-champagne/60 bg-background-card hover:bg-background-elevated transition-all"
                >
                  <span>Explore Products</span>
                </Button>
              </Link>
            </div>

            {/* Value Highlights Pill Row */}
            <div className="flex flex-wrap items-center gap-5 pt-3 text-xs text-foreground-muted font-medium border-t border-line/60">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-champagne-deep" />
                <span>350+ Clinical Actives Scored</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Scale className="h-4 w-4 text-champagne-deep" />
                <span>Real-Time Store Price Compare</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-champagne-deep" />
                <span>Zero Sponsored Bias</span>
              </div>
            </div>
          </motion.div>

          {/* ================= RIGHT COLUMN: BEAUTYIQ INTELLIGENCE PANEL ================= */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, ease: "easeOut", delay: 0.12 }}
            className="relative mx-auto w-full max-w-lg lg:max-w-none"
          >
            {/* Visual Frame Container */}
            <div className="relative mx-auto h-[430px] sm:h-[460px] w-full max-w-[460px] rounded-3xl border border-line/70 bg-gradient-to-br from-background-card via-background to-background-elevated/40 p-5 shadow-xl overflow-visible">
              
              {/* Floating Top AI Recommended Badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="absolute -top-3.5 right-6 z-20 flex items-center gap-1.5 rounded-full border border-champagne/40 bg-champagne-tint px-3 py-1 shadow-sm backdrop-blur-md"
              >
                <Sparkles className="h-3 w-3 text-champagne-deep" />
                <span className="text-[0.68rem] font-bold uppercase tracking-wider text-champagne-deep">
                  AI Recommended
                </span>
              </motion.div>

              {/* Main Featured Product Card (Minimalist 10% Niacinamide) */}
              <div className="relative rounded-2xl border border-line bg-background-card p-4 shadow-sm transition-all hover:shadow-md">
                <div className="flex gap-4 items-center">
                  <div className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-xl bg-background-elevated border border-line/50">
                    <Image
                      src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop"
                      alt="10% Niacinamide Face Serum"
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[0.68rem] font-bold uppercase tracking-widest text-champagne-deep">
                        Minimalist
                      </span>
                      <div className="flex items-center gap-1 text-xs">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-[0.72rem] text-foreground">4.6</span>
                        <span className="text-foreground-faint text-[0.68rem]">(8.4k)</span>
                      </div>
                    </div>

                    <h3 className="font-display text-sm sm:text-base font-bold text-foreground leading-snug truncate">
                      10% Niacinamide Face Serum
                    </h3>

                    <p className="text-xs text-foreground-muted line-clamp-1">
                      Pure Vitamin B3 + 1% Zinc PCA
                    </p>

                    <div className="flex items-baseline gap-2 pt-0.5">
                      <span className="font-display text-base font-bold text-foreground">₹549</span>
                      <span className="text-xs text-foreground-faint line-through">₹599</span>
                      <span className="text-[0.65rem] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded">
                        Lowest Price
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary Supporting Product Preview (Dot & Key Watermelon) */}
              <div className="mt-3.5 rounded-2xl border border-line/60 bg-background-card/70 p-3.5 shadow-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-background-elevated border border-line/40">
                    <Image
                      src="https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?q=80&w=400&auto=format&fit=crop"
                      alt="Watermelon Gel Moisturizer"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[0.62rem] font-bold uppercase text-foreground-faint">
                      Dot &amp; Key
                    </span>
                    <p className="text-xs font-semibold text-foreground truncate">
                      Watermelon Gel Moisturizer
                    </p>
                    <span className="text-[0.7rem] font-bold text-foreground">₹495</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-full bg-champagne-tint/70 border border-champagne/30 text-[0.68rem] font-bold text-champagne-deep">
                  <Sparkles className="h-3 w-3" />
                  <span>88% Match</span>
                </div>
              </div>

              {/* FLOATING GLASS UI CARD 1: 92% Compatibility Match */}
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="absolute -left-4 sm:-left-6 bottom-20 z-20 w-44 sm:w-48 rounded-2xl border border-line/80 bg-background-card/95 p-3.5 shadow-lg backdrop-blur-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-foreground-faint">
                    Compatibility
                  </span>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="font-display text-2xl font-bold text-foreground">92%</span>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Match
                  </span>
                </div>
                <p className="mt-0.5 text-[0.68rem] text-foreground-muted leading-tight">
                  High compatibility with your skin profile
                </p>
              </motion.div>

              {/* FLOATING GLASS UI CARD 2: Best for Your Preferences */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="absolute left-6 right-6 -bottom-5 z-20 rounded-2xl border border-line/80 bg-background-card/95 p-3 shadow-lg backdrop-blur-md flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-champagne-tint text-champagne-deep">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[0.72rem] font-bold text-foreground">Best for your preferences</p>
                    <p className="text-[0.65rem] text-foreground-faint truncate">
                      Niacinamide 10% • Oil-Control • Fragrance-Free
                    </p>
                  </div>
                </div>
                <Link
                  href="/recommendations"
                  className="shrink-0 text-[0.68rem] font-bold text-champagne-deep hover:underline flex items-center gap-0.5"
                >
                  <span>Quiz</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </motion.div>

              {/* FLOATING GLASS UI CARD 3: 3 Stores Compared */}
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.45 }}
                className="absolute -right-3 sm:-right-5 top-28 z-20 rounded-2xl border border-line/80 bg-background-card/95 px-3 py-2 shadow-lg backdrop-blur-md"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <TrendingDown className="h-3.5 w-3.5 text-emerald-600" />
                  <span>3 stores compared</span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-[0.68rem] font-mono text-foreground-faint">
                  <span className="text-emerald-600 font-bold">Nykaa: ₹549</span>
                  <span>•</span>
                  <span>Amazon: ₹599</span>
                </div>
              </motion.div>

            </div>
          </motion.div>

        </div>
      </Container>
    </section>
  );
}
