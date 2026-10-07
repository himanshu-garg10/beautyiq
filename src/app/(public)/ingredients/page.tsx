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
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { Input } from "@/components/ui/input";

const concernGuides = [
  {
    title: "Glow & dullness",
    ingredients: "Vitamin C, Niacinamide, Alpha Arbutin",
    concerns: "Dullness",
    icon: Sparkles,
    image: "/images/concerns/glow-and-dullness.png",
  },
  {
    title: "Acne & active breakouts",
    ingredients: "Salicylic Acid, Niacinamide, Azelaic Acid",
    concerns: "Acne",
    icon: ShieldCheck,
    image: "/images/concerns/acne-and-active-breakouts.jpg",
  },
  {
    title: "Whiteheads & clogged pores",
    ingredients: "Salicylic Acid, Niacinamide, Clay",
    concerns: "Acne,Visible pores",
    icon: ShieldCheck,
    image: "/images/concerns/whiteheads-and-clogged-pores.jpg",
  },
  {
    title: "Blackheads & open pores",
    ingredients: "Salicylic Acid, Niacinamide, Retinoids",
    concerns: "Visible pores,Acne",
    icon: ShieldCheck,
    image: "/images/concerns/blackheads-and-open-pores.jpg",
  },
  {
    title: "Dryness & barrier",
    ingredients: "Ceramides, Hyaluronic Acid, Glycerin",
    concerns: "Dryness,Dehydration",
    icon: Droplets,
    image: "/images/concerns/dryness-and-barrier.jpg",
  },
  {
    title: "Itching & sensitivity",
    ingredients: "Centella, Panthenol, Ceramides",
    concerns: "Redness",
    icon: Droplets,
    image: "/images/concerns/itching-and-sensitivity.jpg",
  },
  {
    title: "Uneven tone & dark spots",
    ingredients: "Vitamin C, Alpha Arbutin, Tranexamic Acid",
    concerns: "Hyperpigmentation,Dark spots",
    icon: Sparkles,
    image: "/images/concerns/uneven-tone-and-dark-spots.jpg",
  },
  {
    title: "Oiliness & shine",
    ingredients: "Niacinamide, Zinc PCA, Salicylic Acid",
    concerns: "Acne,Visible pores",
    icon: ShieldCheck,
    image: "/images/concerns/oiliness-and-shine.jpg",
  },
  {
    title: "Texture & roughness",
    ingredients: "Lactic Acid, Glycolic Acid, Urea",
    concerns: "Dullness,Dehydration",
    icon: Waves,
    image: "/images/concerns/texture-and-roughness.jpg",
  },
  {
    title: "Fine lines",
    ingredients: "Retinoids, Peptides, Hyaluronic Acid",
    concerns: "Dryness",
    icon: Sparkles,
    image: "/images/concerns/fine-lines.jpg",
  },
  {
    title: "Tanning care",
    ingredients: "Vitamin C, Niacinamide, Alpha Arbutin",
    concerns: "Hyperpigmentation,Dullness",
    icon: Sun,
    image: "/images/concerns/tanning-care.jpg",
  },
  {
    title: "Dark circles",
    ingredients: "Caffeine, Vitamin C, Peptides",
    concerns: "Dullness",
    icon: Droplets,
    image: "/images/concerns/dark-circles.jpg",
  },
  {
    title: "Sun protection",
    ingredients: "Broad-spectrum UV filters, Antioxidants",
    concerns: "Hyperpigmentation",
    icon: Sun,
    image: "/images/concerns/sun-protection.jpg",
  },
  {
    title: "Pigmentation",
    ingredients: "Vitamin C, Alpha Arbutin, Tranexamic Acid",
    concerns: "Hyperpigmentation,Dark spots",
    icon: Sparkles,
    image: "/images/concerns/pigmentation.jpg",
  },
  {
    title: "Redness & irritation",
    ingredients: "Panthenol, Centella, Ceramides",
    concerns: "Redness",
    icon: Droplets,
    image: "/images/concerns/redness-and-irritation.jpg",
  },
  {
    title: "Dehydration",
    ingredients: "Hyaluronic Acid, Glycerin, Betaine",
    concerns: "Dehydration,Dryness",
    icon: Droplets,
    image: "/images/concerns/dehydration.jpg",
  },
];

export default function IngredientsPage() {
  const [search, setSearch] = React.useState("");

  const visibleGuides = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return concernGuides;
    return concernGuides.filter((guide) =>
      `${guide.title} ${guide.ingredients}`.toLowerCase().includes(query)
    );
  }, [search]);

  return (
    <Container className="py-6 md:py-8 space-y-6">
      {/* Sleek Centered Search Bar & Clear Button (identical to Categories) */}
      <div className="flex items-start gap-2 max-w-2xl mx-auto">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search a concern or ingredient — e.g. acne, glow, Vitamin C, dryness"
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

      {/* Grid of 3 Columns in one row */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visibleGuides.map((guide) => {
          const Icon = guide.icon;
          return (
            <Link
              key={guide.title}
              href={`/products?concern=${encodeURIComponent(guide.concerns)}`}
              className="group flex flex-col h-full rounded-3xl border border-line bg-background-card overflow-hidden shadow-subtle hover:shadow-xl hover:border-sage-deep/50 hover:-translate-y-1.5 transition-all duration-300"
            >
              {/* Upper Section: Image + Top-Left Circular Badge + Title */}
              <div className="relative h-56 w-full overflow-hidden bg-background-elevated shrink-0">
                <img
                  src={guide.image}
                  alt={guide.title}
                  className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/15" />
                <div className="absolute top-3.5 left-3.5 h-10 w-10 rounded-full bg-background-card/90 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-md flex items-center justify-center text-sage-deep transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="absolute bottom-3.5 left-4 right-4">
                  <h2 className="font-display text-xl font-bold text-white drop-shadow-md tracking-tight group-hover:text-champagne transition-colors">
                    {guide.title}
                  </h2>
                </div>
              </div>

              {/* Lower Section: Divider + Bullet Points + Action */}
              <div className="flex-1 flex flex-col justify-between p-5 bg-background-card border-t border-line/70">
                <div className="space-y-2.5">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-champagne-deep">
                    Targeted Actives
                  </p>
                  <ul className="space-y-2.5">
                    {guide.ingredients.split(", ").map((ingredient) => (
                      <li
                        key={ingredient}
                        className="flex items-start gap-2.5 text-xs text-foreground-muted leading-relaxed"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sage-deep group-hover:bg-champagne-deep transition-colors" />
                        <span className="font-medium text-foreground/85">
                          {ingredient}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 mt-4 border-t border-line/40 flex items-center justify-between text-xs font-bold text-sage-deep group-hover:text-foreground transition-colors">
                  <span>See matching products</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5 text-champagne-deep" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {visibleGuides.length === 0 && (
        <div className="rounded-3xl border border-line bg-background-card p-12 text-center space-y-3">
          <p className="font-display text-lg font-bold text-foreground">
            No concern guide matches that search
          </p>
          <p className="text-xs text-foreground-muted">
            Try searching for &ldquo;acne&rdquo;, &ldquo;dryness&rdquo;, &ldquo;Vitamin C&rdquo;, or &ldquo;pores&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => setSearch("")}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-sage-deep text-white shadow-subtle hover:bg-foreground transition-colors"
          >
            Show All Concerns
          </button>
        </div>
      )}
    </Container>
  );
}
