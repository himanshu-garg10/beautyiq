"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Scale,
  Star,
  Check,
  Sparkles,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

const comparisonProducts = [
  {
    id: "p1",
    name: "10% Niacinamide Face Serum",
    brand: "Minimalist",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop",
    price: 549,
    originalPrice: 599,
    unitPrice: "₹18.30 / ml",
    rating: 4.6,
    reviews: "8.4k",
    compatibility: 94,
    bestStore: "Nykaa (Lowest)",
    storesAvailable: ["Nykaa", "Amazon", "Tira", "Official"],
    keyActives: "10% Niacinamide + 1% Zinc PCA",
    cleanBadges: ["Fragrance-Free", "Non-Comedogenic", "Cruelty-Free"],
    valueScore: "Exceptional Value (9.5/10)",
    isHighlight: true,
  },
  {
    id: "p3",
    name: "Niacinamide 10% + Zinc 1%",
    brand: "The Ordinary",
    image: "https://images.unsplash.com/photo-1608248597359-577e1c841bb4?q=80&w=600&auto=format&fit=crop",
    price: 600,
    originalPrice: 600,
    unitPrice: "₹20.00 / ml",
    rating: 4.5,
    reviews: "14.2k",
    compatibility: 91,
    bestStore: "Nykaa",
    storesAvailable: ["Nykaa", "Sephora", "Amazon"],
    keyActives: "10% Niacinamide + 1% Zinc PCA",
    cleanBadges: ["Alcohol-Free", "Silicone-Free", "Vegan"],
    valueScore: "High Value (8.8/10)",
    isHighlight: false,
  },
  {
    id: "p2",
    name: "Watermelon Gel Moisturizer",
    brand: "Dot & Key",
    image: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?q=80&w=600&auto=format&fit=crop",
    price: 495,
    originalPrice: 595,
    unitPrice: "₹9.90 / ml",
    rating: 4.4,
    reviews: "3.2k",
    compatibility: 88,
    bestStore: "Amazon (Lowest)",
    storesAvailable: ["Amazon", "Nykaa", "Tira"],
    keyActives: "Hyaluronic Acid + Watermelon",
    cleanBadges: ["Paraben-Free", "Light Gel", "Cruelty-Free"],
    valueScore: "Great Budget Pick (9.0/10)",
    isHighlight: false,
  },
];

export function ComparisonShowcase() {
  return (
    <section className="border-b border-line bg-gradient-to-b from-background-elevated/30 to-background py-16 sm:py-20">
      <Container>
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-champagne-deep">
              <Scale className="h-3.5 w-3.5" />
              <span>Multi-Platform Product Matrix</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Compare Before You Buy
            </h2>
            <p className="text-sm sm:text-base text-foreground-muted leading-relaxed">
              Transparent, objective comparison across active formulations, true unit economics, and live seller prices.
            </p>
          </div>

          <Link href="/compare">
            <Button
              size="lg"
              variant="accent"
              className="rounded-full px-6 py-2.5 font-semibold text-xs gap-2 bg-foreground text-background hover:bg-foreground/90 dark:bg-champagne-deep dark:text-white shadow-sm"
            >
              <Scale className="h-3.5 w-3.5" />
              <span>Open Comparison Matrix</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* 3-Column Intelligent Comparison Grid */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {comparisonProducts.map((prod, idx) => (
            <motion.div
              key={prod.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className={`relative rounded-3xl border p-6 transition-all duration-300 flex flex-col justify-between shadow-subtle hover:shadow-md ${
                prod.isHighlight
                  ? "border-champagne/80 bg-background-card ring-2 ring-champagne/20"
                  : "border-line bg-background-card"
              }`}
            >
              {prod.isHighlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 rounded-full bg-champagne-deep text-white px-3 py-0.5 text-[0.68rem] font-bold uppercase tracking-wider shadow-xs">
                  <Sparkles className="h-3 w-3" />
                  <span>Editor&apos;s Match</span>
                </div>
              )}

              {/* Product Header */}
              <div>
                <div className="relative aspect-square w-full max-w-[200px] mx-auto overflow-hidden rounded-2xl bg-background-elevated border border-line/60">
                  <Image
                    src={prod.image}
                    alt={prod.name}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-2.5 right-2.5 rounded-full bg-background-card/95 border border-champagne/30 px-2.5 py-0.5 text-[0.68rem] font-bold text-champagne-deep font-mono shadow-xs">
                    {prod.compatibility}% Match
                  </div>
                </div>

                <div className="mt-5 text-center space-y-1">
                  <span className="text-[0.68rem] font-bold uppercase tracking-widest text-champagne-deep">
                    {prod.brand}
                  </span>
                  <h3 className="font-display text-base font-bold text-foreground truncate">
                    {prod.name}
                  </h3>
                  <div className="flex items-center justify-center gap-1 text-xs">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-foreground">{prod.rating}</span>
                    <span className="text-foreground-faint text-[0.7rem]">({prod.reviews})</span>
                  </div>
                </div>

                {/* Price & Unit Cost Row */}
                <div className="mt-4 rounded-2xl border border-line/70 bg-background-elevated/40 p-3.5 text-center space-y-1">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="font-display text-2xl font-bold text-foreground">
                      ₹{prod.price}
                    </span>
                    {prod.originalPrice > prod.price && (
                      <span className="text-xs text-foreground-faint line-through">
                        ₹{prod.originalPrice}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-[0.7rem] font-mono text-foreground-faint">
                    <span>{prod.unitPrice}</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-semibold">{prod.bestStore}</span>
                  </div>
                </div>

                {/* Attribute Comparison Points */}
                <div className="mt-5 space-y-3 text-xs border-t border-line/60 pt-4">
                  <div>
                    <span className="text-[0.65rem] uppercase font-bold text-foreground-faint block">
                      Active Formula
                    </span>
                    <p className="mt-0.5 font-semibold text-foreground">
                      {prod.keyActives}
                    </p>
                  </div>

                  <div>
                    <span className="text-[0.65rem] uppercase font-bold text-foreground-faint block">
                      Available Retailers
                    </span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {prod.storesAvailable.map((store) => (
                        <span
                          key={store}
                          className="rounded-md border border-line bg-background px-2 py-0.5 text-[0.68rem] font-medium text-foreground-muted"
                        >
                          {store}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[0.65rem] uppercase font-bold text-foreground-faint block">
                      Formulation Standards
                    </span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {prod.cleanBadges.map((badge) => (
                        <span
                          key={badge}
                          className="inline-flex items-center gap-1 rounded-full bg-champagne-tint/60 text-champagne-deep px-2 py-0.5 text-[0.68rem] font-medium"
                        >
                          <Check className="h-2.5 w-2.5 stroke-[3]" />
                          <span>{badge}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Action */}
              <div className="mt-6 pt-3 border-t border-line/60">
                <Link href={`/compare?add=${prod.id}`} className="block w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full rounded-xl text-xs font-semibold border-line hover:border-champagne/60 bg-background hover:bg-background-elevated"
                  >
                    <span>Inspect in Matrix</span>
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
