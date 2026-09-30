"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Star,
  Heart,
  Scale,
  Sparkles,
  ArrowRight,
  Flame,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { products } from "@/lib/mock-data";

export function TrendingProducts() {
  // Select top trending formulations
  const trendingList = [
    { ...products[0], badge: "Trending #1" },
    { ...products[1], badge: "Top Value" },
    { ...products[2], badge: "Most Compared" },
    { ...products[3], badge: "Clinical Pick" },
  ];

  return (
    <section className="border-b border-line bg-background py-16 sm:py-20">
      <Container>
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              <Flame className="h-3.5 w-3.5 fill-current" />
              <span>Community &amp; Matrix Momentum</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Trending on BeautyIQ
            </h2>
            <p className="text-sm sm:text-base text-foreground-muted leading-relaxed">
              Formulations receiving the highest compatibility scores and cross-store comparison queries this week.
            </p>
          </div>

          <Link href="/products" className="shrink-0">
            <Button
              variant="outline"
              className="rounded-full px-5 py-2 font-semibold text-xs border-line hover:border-champagne/60 bg-background-card hover:bg-background-elevated gap-1.5 shadow-xs"
            >
              <span>Explore All Trending</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* 4 Trending Cards Grid */}
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {trendingList.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
              className="relative"
            >
              {/* Special Trending Badge Overlay */}
              <div className="absolute top-2.5 right-12 z-20 pointer-events-none">
                <span className="flex items-center gap-1 text-[0.65rem] font-bold text-white bg-rose-600/90 backdrop-blur-xs px-2 py-0.5 rounded-full shadow-xs">
                  <Flame className="h-2.5 w-2.5 fill-current" />
                  {item.badge}
                </span>
              </div>

              <ProductCard product={item} />
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
