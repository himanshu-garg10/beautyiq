"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  FlaskConical,
  Search,
  ShieldCheck,
  Sparkles,
  Scale,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { useChatContext } from "@/context/chat-context";

const EASE_EDITORIAL: [number, number, number, number] = [0.22, 1, 0.36, 1];

const steps = [
  {
    icon: Sparkles,
    step: "01",
    title: "Tell us your goal",
    text: "Describe glow, acne, dryness, sensitivity, or a routine need.",
    accent: "text-champagne-deep bg-champagne-tint border-champagne/40",
    offsetClass: "lg:mr-6",
    floatDelay: "0s",
  },
  {
    icon: FlaskConical,
    step: "02",
    title: "Understand the formula",
    text: "Review listed ingredients and cosmetic details before deciding.",
    accent: "text-sage-deep bg-sage-tint border-sage/35",
    offsetClass: "lg:ml-6",
    floatDelay: "0.9s",
  },
  {
    icon: Scale,
    step: "03",
    title: "Compare verified offers",
    text: "See store offers only when a source has been added to the catalog.",
    accent: "text-champagne-deep bg-champagne-tint border-champagne/40",
    offsetClass: "lg:mr-3",
    floatDelay: "1.8s",
  },
];

const popularSearches = [
  { label: "Glow", query: "glow" },
  { label: "Acne care", query: "acne" },
  { label: "Dry skin", query: "dryness" },
  { label: "Sunscreen", query: "sunscreen" },
];

export function HeroSection() {
  const router = useRouter();
  const { openChat } = useChatContext();
  const [query, setQuery] = React.useState("");

  function searchCatalog(event: React.FormEvent) {
    event.preventDefault();
    const value = query.trim();
    if (value) router.push(`/products?q=${encodeURIComponent(value)}`);
  }

  return (
    <section className="relative isolate flex min-h-[90vh] items-center overflow-hidden border-b border-line/60 bg-[image:var(--gradient-hero)]">
      {/* Ambient botanical / editorial glow orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-36 top-10 h-[26rem] w-[26rem] rounded-full bg-sage-tint/55 blur-3xl opacity-80 dark:opacity-25"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-0 h-[30rem] w-[30rem] rounded-full bg-champagne/25 blur-3xl opacity-85 dark:opacity-20"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/4 h-72 w-72 -translate-x-1/2 rounded-full bg-blush-tint/45 blur-3xl opacity-60 dark:opacity-15"
      />

      <Container className="relative flex w-full items-center py-12 sm:py-16 lg:py-20">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1.08fr_.92fr] lg:gap-16">
          {/* Left editorial column */}
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE_EDITORIAL }}
              className="glass mb-6 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide text-champagne-deep shadow-glass"
            >
              <Sparkles className="h-3.5 w-3.5 text-champagne-deep" />
              <span>Beauty discovery, made clearer</span>
            </motion.div>

            <h1 className="font-display text-5xl font-light leading-[1.1] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.08, ease: EASE_EDITORIAL }}
                className="block"
              >
                Find beauty that
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.16, ease: EASE_EDITORIAL }}
                className="text-gold-gradient mt-1 block font-medium italic"
              >
                fits your skin.
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.22, ease: EASE_EDITORIAL }}
              className="mt-6 max-w-xl text-lg font-light leading-relaxed text-foreground-muted"
            >
              Search a growing beauty catalog, understand ingredients, and use an AI-guided brief to narrow products for your routine.
            </motion.p>

            <motion.form
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.28, ease: EASE_EDITORIAL }}
              onSubmit={searchCatalog}
              className="mt-8 flex max-w-xl items-center gap-2 rounded-2xl border border-line/80 bg-background-card/90 p-2 shadow-elevated backdrop-blur-md transition-all duration-300 focus-within:border-champagne/80 focus-within:shadow-card-hover"
            >
              <Search className="ml-2.5 h-5 w-5 shrink-0 text-champagne-deep" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm text-foreground outline-none placeholder:text-foreground-faint focus-visible:outline-none sm:text-base"
                placeholder="Search products, brands, or ingredients"
                aria-label="Search BeautyIQ catalog"
              />
              <Button
                type="submit"
                variant="accent"
                className="shrink-0 rounded-xl px-4 sm:px-5"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Search
              </Button>
            </motion.form>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: EASE_EDITORIAL }}
              className="mt-3.5 flex flex-wrap items-center gap-2 text-xs text-foreground-faint"
            >
              <span className="font-medium">Popular:</span>
              {popularSearches.map((item) => (
                <Link
                  key={item.query}
                  href={`/products?q=${encodeURIComponent(item.query)}`}
                  className="rounded-full border border-line/80 bg-background-card/75 px-3 py-1 font-medium text-foreground-muted transition-all duration-200 hover:-translate-y-0.5 hover:border-champagne/70 hover:bg-champagne-tint hover:text-foreground hover:shadow-xs"
                >
                  {item.label}
                </Link>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.36, ease: EASE_EDITORIAL }}
              className="mt-6 flex flex-wrap items-center gap-3"
            >
              <Button variant="outline" className="rounded-full" onClick={openChat}>
                Ask BeautyIQ AI
              </Button>
              <Link
                href="/products"
                className="group inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-foreground-muted transition-colors hover:text-champagne-deep"
              >
                Browse catalog
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.44 }}
              className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-line/60 pt-5 text-xs font-medium text-foreground-muted"
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-sage-deep" />
                No invented prices
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-sage-deep" />
                Source-linked catalog entries
              </span>
            </motion.div>
          </div>

          {/* Right editorial floating visual composition (CSS + SVG only) */}
          <motion.aside
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.18, ease: EASE_EDITORIAL }}
            className="relative"
          >
            {/* Subtle decorative editorial concentric arcs behind glass stack */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 -z-20 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-champagne/20 blur-3xl opacity-80 dark:opacity-30"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-2 top-4 -z-10 h-64 w-64 rounded-full border border-champagne/25 animate-spin-slow"
            />
            <svg
              aria-hidden="true"
              viewBox="0 0 420 420"
              fill="none"
              className="pointer-events-none absolute -right-6 -top-8 -z-10 h-[26rem] w-[26rem] opacity-40 dark:opacity-20 animate-spin-slow"
            >
              <circle
                cx="210"
                cy="210"
                r="190"
                stroke="var(--champagne)"
                strokeWidth="1"
                strokeDasharray="4 6"
              />
              <circle
                cx="210"
                cy="210"
                r="138"
                stroke="var(--sage)"
                strokeWidth="0.75"
                strokeOpacity="0.6"
              />
              <circle
                cx="210"
                cy="210"
                r="82"
                fill="url(#heroOrbGradient)"
                fillOpacity="0.22"
              />
              <defs>
                <radialGradient id="heroOrbGradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(210 210) rotate(90) scale(82)">
                  <stop stopColor="var(--champagne)" />
                  <stop offset="1" stopColor="var(--champagne)" stopOpacity="0" />
                </radialGradient>
              </defs>
            </svg>

            <div className="space-y-4">
              {/* Editorial composition header pill */}
              <div className="flex items-center justify-between px-1">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-champagne-deep">
                    BeautyIQ Flow
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-medium tracking-tight text-foreground">
                    Make every choice intentional.
                  </h2>
                </div>
                <span className="glass flex h-10 w-10 items-center justify-center rounded-2xl text-champagne-deep shadow-glass">
                  <Sparkles className="h-5 w-5" />
                </span>
              </div>

              {/* 3 floating staggered glass feature cards */}
              <ol className="space-y-3.5">
                {steps.map((step, idx) => {
                  const Icon = step.icon;
                  const floatClass =
                    idx === 0
                      ? "animate-float"
                      : idx === 1
                        ? "animate-float-delayed"
                        : "animate-float-slow";
                  return (
                    <li
                      key={step.title}
                      className={`${floatClass} glass group rounded-3xl p-4 sm:p-5 shadow-card transition-all duration-300 hover:border-champagne/60 hover:shadow-card-hover ${step.offsetClass}`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${step.accent} transition-transform duration-300 group-hover:scale-105`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-display text-lg font-semibold leading-tight text-foreground">
                              {step.title}
                            </h3>
                            <span className="font-mono text-[11px] font-medium text-foreground-faint">
                              {step.step}
                            </span>
                          </div>
                          <p className="mt-1 text-sm leading-relaxed text-foreground-muted">
                            {step.text}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>

              {/* Interactive AI CTA anchored cleanly below floating cards */}
              <div className="pt-1 lg:mr-3">
                <Button
                  type="button"
                  onClick={openChat}
                  variant="primary"
                  size="lg"
                  className="w-full justify-between rounded-2xl px-6 shadow-elevated"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Chat with BeautyIQ AI
                </Button>
              </div>
            </div>
          </motion.aside>
        </div>
      </Container>
    </section>
  );
}
