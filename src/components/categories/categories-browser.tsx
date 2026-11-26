"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Droplets,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Waves,
  X,
  Layers,
  Heart,
  Eye,
  Smile,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { Input } from "@/components/ui/input";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

// Real product counts from src/data/products.json (440 total)
const CATEGORY_COUNTS: Record<string, number> = {
  "Face Wash": 115,
  "Treatment Products": 81,
  "Serum": 79,
  "Sunscreen": 66,
  "Moisturizer": 51,
  "Toner": 15,
  "Exfoliator": 10,
  "Cleanser": 8,
  "Face Masks": 8,
  "Eye Care": 4,
  "Lip Care": 2,
  "Acne Focused Products": 1,
};

const categories = [
  {
    name: "Face Wash",
    category: "Face Wash",
    icon: Waves,
    points: [
      "Daily gentle cleansing",
      "Removes excess oil and sweat",
      "Morning and evening routine base",
    ],
    image: "/images/categories/face-wash.jpg",
  },
  {
    name: "Serum",
    category: "Serum",
    icon: Sparkles,
    points: [
      "Concentrated active ingredients",
      "Targets dark spots, fine lines and acne",
      "Apply before moisturizer",
    ],
    image: "/images/categories/serum.jpg",
  },
  {
    name: "Treatment Products",
    category: "Treatment Products",
    icon: Sparkles,
    points: [
      "Targeted intensive skincare formulas",
      "Potent retinoids and spot treatments",
      "Improves elasticity & tone",
    ],
    image: "/images/categories/treatment-products.jpg",
  },
  {
    name: "Sunscreen",
    category: "Sunscreen",
    icon: Sun,
    points: [
      "Broad-spectrum UVA/UVB defense",
      "Non-greasy fluid & matte options",
      "Essential daily morning step",
    ],
    image: "/images/categories/sunscreen.jpg",
  },
  {
    name: "Moisturizer",
    category: "Moisturizer",
    icon: Droplets,
    points: [
      "Locks in deep hydration",
      "Gel, cream and lotion textures",
      "Calms and softens skin surface",
    ],
    image: "/images/categories/moisturizer.jpg",
  },
  {
    name: "Toner",
    category: "Toner",
    icon: Droplets,
    points: [
      "Balances skin pH after cleansing",
      "Prep layer for serums & creams",
      "Provides lightweight hydration",
    ],
    image: "/images/categories/toner.jpg",
  },
  {
    name: "Exfoliator",
    category: "Exfoliator",
    icon: Layers,
    points: [
      "Gentle AHA, BHA & PHA formulas",
      "Smoothes rough skin texture",
      "Unclogs congested pores",
    ],
    image: "/images/categories/exfoliator.jpg",
  },
  {
    name: "Cleanser",
    category: "Cleanser",
    icon: Waves,
    points: [
      "Gentle impurity cleansing",
      "Dissolves makeup and pollution",
      "Supports healthy skin barrier",
    ],
    image: "/images/categories/cleanser.jpg",
  },
  {
    name: "Face Masks",
    category: "Face Masks",
    icon: Heart,
    points: [
      "Intensive weekly skin treatment",
      "Hydrating clay & sheet options",
      "Restores natural radiance",
    ],
    image: "/images/categories/face-masks.jpg",
  },
  {
    name: "Eye Care",
    category: "Eye Care",
    icon: Eye,
    points: [
      "Hydrates delicate under-eye area",
      "Caffeine & peptide depuffing",
      "Diminishes dark circles",
    ],
    image: "/images/categories/eye-care.jpg",
  },
  {
    name: "Acne Focused Products",
    category: "Acne Focused Products",
    icon: ShieldCheck,
    points: [
      "Targets breakouts and redness",
      "Salicylic acid & benzoyl peroxide",
      "Prevents post-acne blemishes",
    ],
    image: "/images/categories/acne-focused.jpg",
  },
  {
    name: "Lip Care",
    category: "Lip Care",
    icon: Smile,
    points: [
      "Hydrating balms and overnight butter",
      "Soothes dry, chapped lips",
      "SPF protection for everyday wear",
    ],
    image: "/images/categories/lip-care.jpg",
  },
];

export function CategoriesBrowser() {
  const [search, setSearch] = React.useState("");

  const visibleCategories = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return categories;
    return categories.filter((item) =>
      `${item.name} ${item.points.join(" ")}`.toLowerCase().includes(query)
    );
  }, [search]);

  return (
    <Container className="py-6 md:py-8 space-y-6">
      {/* Sleek Search Bar */}
      <div className="flex items-start gap-2 max-w-2xl mx-auto">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search product categories — e.g. serum, sunscreen, face wash, acne"
          leftIcon={<Search className="h-4 w-4 text-sage-deep" />}
          className="bg-background-card"
        />
        <button
          type="button"
          onClick={() => setSearch("")}
          disabled={!search}
          className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-line bg-background-card px-3 text-sm font-semibold text-foreground-muted transition-colors hover:border-champagne hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          <X className="h-4 w-4" />
          <span>Clear</span>
        </button>
      </div>

      {/* Grid of Uniform Sized Cards Matching Sketch (4 columns in row) */}
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {visibleCategories.map((item, idx) => {
          const Icon = item.icon;
          return (
            <ScrollReveal key={item.name} delay={(idx % 4) * 0.06} className="h-full">
              <Link
                href={`/products?category=${encodeURIComponent(item.category)}`}
                className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line/80 bg-background-card shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-champagne/60 hover:shadow-card-hover"
              >
                {/* UPPER SECTION: Image + Top-Left Circular Badge + Category Title (as per sketch) */}
                <div className="relative h-56 w-full overflow-hidden bg-background-elevated shrink-0">
                  {/* Real Category Photo */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Subtle gradient overlay to make category title pop */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/15" />

                  {/* Top-Left Circular Icon Badge (drawn as circle with icon in sketch) */}
                  <div className="absolute top-3.5 left-3.5 h-10 w-10 rounded-full bg-background-card/90 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-md flex items-center justify-center text-sage-deep transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Category Title at the bottom of the upper section (drawn as 'Face Wash' in sketch) */}
                  <div className="absolute bottom-3.5 left-4 right-4">
                    <h2 className="font-display text-xl font-bold text-white drop-shadow-md tracking-tight group-hover:text-champagne transition-colors">
                      {item.name}
                    </h2>
                    {CATEGORY_COUNTS[item.category] !== undefined && (
                      <p className="text-[0.68rem] font-medium text-white/75 mt-0.5 drop-shadow">
                        {CATEGORY_COUNTS[item.category]} products
                      </p>
                    )}
                  </div>
                </div>

                {/* LOWER SECTION: Separated by divider, contains bullet points (as per sketch) */}
                <div className="flex-1 flex flex-col justify-between p-5 bg-background-card border-t border-line/70">
                  {/* Bullet Points list */}
                  <ul className="space-y-2.5">
                    {item.points.map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-2.5 text-xs text-foreground-muted leading-relaxed"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sage-deep group-hover:bg-champagne-deep transition-colors" />
                        <span className="font-medium text-foreground/85">
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Bottom Card Action */}
                  <div className="pt-4 mt-4 border-t border-line/40 flex items-center justify-between text-xs font-bold text-sage-deep group-hover:text-foreground transition-colors">
                    <span>View Products</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5 text-champagne-deep" />
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          );
        })}
      </div>

      {visibleCategories.length === 0 && (
        <div className="space-y-3 rounded-3xl border border-line bg-background-card p-12 text-center shadow-card">
          <p className="font-display text-lg font-bold text-foreground">
            No categories found
          </p>
          <p className="text-xs text-foreground-muted">
            Try searching for &ldquo;serum&rdquo;, &ldquo;cleanser&rdquo;, &ldquo;sunscreen&rdquo;, or clear your search query.
          </p>
          <button
            type="button"
            onClick={() => setSearch("")}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-sage-deep text-white shadow-subtle hover:bg-foreground transition-colors"
          >
            Show All Categories
          </button>
        </div>
      )}
    </Container>
  );
}
