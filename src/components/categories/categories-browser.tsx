"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Droplets, Search, ShieldCheck, Sparkles, Sun, Waves, X } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Input } from "@/components/ui/input";

const categories = [
  { name: "Face Wash", category: "Face Wash", icon: Waves, points: ["Daily cleansing", "Oil and sweat removal", "Morning or evening use"], image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80" },
  { name: "Cleanser", category: "Cleanser", icon: Waves, points: ["Gentle cleansing", "Makeup removal", "Barrier-friendly options"], image: "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=900&q=80" },
  { name: "Serum", category: "Serum", icon: Sparkles, points: ["Targeted active ingredients", "Glow, spots and acne", "Layer before moisturizer"], image: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=900&q=80" },
  { name: "Moisturizer", category: "Moisturizer", icon: Droplets, points: ["Hydration support", "Cream, gel or lotion", "Barrier comfort"], image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80" },
  { name: "Sunscreen", category: "Sunscreen", icon: Sun, points: ["Daily UV protection", "AM routine step", "Cream, gel and fluid types"], image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=900&q=80" },
  { name: "Toner", category: "Toner", icon: Droplets, points: ["Post-cleanse prep", "Light hydration", "Essence-style formulas"], image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=900&q=80" },
  { name: "Exfoliator", category: "Exfoliator", icon: Sparkles, points: ["AHA, BHA and PHA options", "Texture-focused care", "Use as directed"], image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=900&q=80" },
  { name: "Acne Focused Products", category: "Acne Focused Products", icon: ShieldCheck, points: ["Acne and pimple care", "Pore-focused formulas", "Targeted routine steps"], image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=900&q=80" },
  { name: "Face Masks", category: "Face Masks", icon: Waves, points: ["Occasional care", "Hydration or cleansing", "Wash-off and leave-on"], image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80" },
  { name: "Lip Care", category: "Lip Care", icon: Droplets, points: ["Lip balm and repair", "Dryness comfort", "Day or night use"], image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=80" },
  { name: "Eye Care", category: "Eye Care", icon: Sparkles, points: ["Eye-area hydration", "Caffeine and peptide options", "Gentle application"], image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80" },
  { name: "Treatment Products", category: "Treatment Products", icon: Sparkles, points: ["Specific routine needs", "Targeted actives", "Use with product guidance"], image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=900&q=80" },
];

export function CategoriesBrowser() {
  const [search, setSearch] = React.useState("");
  const visibleCategories = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return categories;
    return categories.filter((item) => `${item.name} ${item.points.join(" ")}`.toLowerCase().includes(query));
  }, [search]);

  return <Container className="py-3 md:py-4 space-y-4">
    <div className="flex items-start gap-2"><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search product categories — e.g. serum, sunscreen, acne" leftIcon={<Search className="h-4 w-4 text-sage-deep" />} /><button type="button" onClick={() => setSearch("")} disabled={!search} className="flex h-11 shrink-0 items-center gap-1.5 rounded border border-line bg-background-card px-3 text-sm font-semibold text-foreground-muted transition-colors hover:border-champagne hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"><X className="h-4 w-4" />Clear</button></div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{visibleCategories.map((item) => { const Icon = item.icon; return <Link key={item.name} href={`/products?category=${encodeURIComponent(item.category)}`} className="group relative flex min-h-72 flex-col overflow-hidden rounded-3xl border border-line bg-background-card p-5 shadow-subtle transition-all duration-300 hover:-translate-y-1 hover:border-champagne/70 hover:shadow-lg"><span aria-hidden="true" className="absolute inset-0 bg-cover bg-center opacity-20 transition-opacity duration-300 group-hover:opacity-30" style={{ backgroundImage: `url(${item.image})` }} /><span aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-background-card/90 via-background-card/85 to-background-card/95" /><span className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-champagne-tint text-champagne-deep"><Icon className="h-4 w-4" /></span><h2 className="relative mt-5 font-display text-xl font-bold text-foreground">{item.name}</h2><ul className="relative mt-3 space-y-1.5 text-sm leading-relaxed text-foreground-muted">{item.points.map((point) => <li key={point} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-champagne-deep" />{point}</li>)}</ul><span className="relative mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-bold text-champagne-deep">Open products <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span></Link>; })}</div>
    {visibleCategories.length === 0 ? <p className="rounded-2xl border border-line bg-background-card p-6 text-center text-sm text-foreground-muted">No category matches that search. Try “serum”, “cleanser”, “acne”, or “sunscreen”.</p> : null}
  </Container>;
}
