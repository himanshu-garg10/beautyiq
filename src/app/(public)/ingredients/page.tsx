"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Droplets, Search, ShieldCheck, Sparkles, Sun, Waves, X } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Input } from "@/components/ui/input";

const concernGuides = [
  { title: "Glow & dullness", ingredients: "Vitamin C, Niacinamide, Alpha Arbutin", concerns: "Dullness", icon: Sparkles, image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80" },
  { title: "Acne & active breakouts", ingredients: "Salicylic Acid, Niacinamide, Azelaic Acid", concerns: "Acne", icon: ShieldCheck, image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=900&q=80" },
  { title: "Whiteheads & clogged pores", ingredients: "Salicylic Acid, Niacinamide, Clay", concerns: "Acne,Visible pores", icon: ShieldCheck, image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80" },
  { title: "Blackheads & open pores", ingredients: "Salicylic Acid, Niacinamide, Retinoids", concerns: "Visible pores,Acne", icon: ShieldCheck, image: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=900&q=80" },
  { title: "Dryness & barrier", ingredients: "Ceramides, Hyaluronic Acid, Glycerin", concerns: "Dryness,Dehydration", icon: Droplets, image: "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=900&q=80" },
  { title: "Itching & sensitivity", ingredients: "Centella, Panthenol, Ceramides", concerns: "Redness", icon: Droplets, image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80" },
  { title: "Uneven tone & dark spots", ingredients: "Vitamin C, Alpha Arbutin, Tranexamic Acid", concerns: "Hyperpigmentation,Dark spots", icon: Sparkles, image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=900&q=80" },
  { title: "Oiliness & shine", ingredients: "Niacinamide, Zinc PCA, Salicylic Acid", concerns: "Acne,Visible pores", icon: ShieldCheck, image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=900&q=80" },
  { title: "Texture & roughness", ingredients: "Lactic Acid, Glycolic Acid, Urea", concerns: "Dullness,Dehydration", icon: Waves, image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=900&q=80" },
  { title: "Fine lines", ingredients: "Retinoids, Peptides, Hyaluronic Acid", concerns: "Dryness", icon: Sparkles, image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80" },
  { title: "Tanning care", ingredients: "Vitamin C, Niacinamide, Alpha Arbutin", concerns: "Hyperpigmentation,Dullness", icon: Sun, image: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=900&q=80" },
  { title: "Dark circles", ingredients: "Caffeine, Vitamin C, Peptides", concerns: "Dullness", icon: Droplets, image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80" },
  { title: "Sun protection", ingredients: "Broad-spectrum UV filters, antioxidants", concerns: "Hyperpigmentation", icon: Sun, image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=900&q=80" },
  { title: "Pigmentation", ingredients: "Vitamin C, Alpha Arbutin, Tranexamic Acid", concerns: "Hyperpigmentation,Dark spots", icon: Sparkles, image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=900&q=80" },
  { title: "Redness & irritation", ingredients: "Panthenol, Centella, Ceramides", concerns: "Redness", icon: Droplets, image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80" },
  { title: "Dehydration", ingredients: "Hyaluronic Acid, Glycerin, Betaine", concerns: "Dehydration,Dryness", icon: Droplets, image: "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=900&q=80" },
];

export default function IngredientsPage() {
  const [search, setSearch] = React.useState("");
  const visibleGuides = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return concernGuides;
    return concernGuides.filter((guide) => `${guide.title} ${guide.ingredients}`.toLowerCase().includes(query));
  }, [search]);

  return <Container className="py-6 md:py-8 space-y-6">
    <div className="flex items-start gap-2"><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search a concern or ingredient — e.g. acne, glow, Vitamin C, dryness" leftIcon={<Search className="h-4 w-4 text-sage-deep" />} /><button type="button" onClick={() => setSearch("")} disabled={!search} className="flex h-11 shrink-0 items-center gap-1.5 rounded border border-line bg-background-card px-3 text-sm font-semibold text-foreground-muted transition-colors hover:border-champagne hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"><X className="h-4 w-4" />Clear</button></div>
    <div className="grid gap-5 lg:grid-cols-2">
      {visibleGuides.map((guide) => { const Icon = guide.icon; return <Link key={guide.title} href={`/products?concern=${encodeURIComponent(guide.concerns)}`} className="group grid min-h-64 grid-cols-[.88fr_1.12fr] overflow-hidden rounded-3xl border border-line bg-background-card shadow-subtle transition-all hover:-translate-y-1 hover:border-champagne/70 hover:shadow-lg"><div className="relative overflow-hidden bg-background-elevated"><span aria-hidden="true" className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${guide.image})` }} /><span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-foreground/55 via-transparent to-transparent" /><span className="absolute bottom-4 left-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-background-card/90 text-champagne-deep shadow-subtle"><Icon className="h-4 w-4" /></span></div><div className="flex flex-col p-5 sm:p-6"><h2 className="font-display text-xl font-bold text-foreground">{guide.title}</h2><div className="mt-4 border-l-2 border-champagne pl-3"><p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-champagne-deep">Useful ingredients</p><ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-foreground-muted">{guide.ingredients.split(", ").map((ingredient) => <li key={ingredient} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-champagne-deep" />{ingredient}</li>)}</ul></div><span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-bold text-champagne-deep">See matching products <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span></div></Link>; })}
    </div>
    {visibleGuides.length === 0 ? <p className="rounded-2xl border border-line bg-background-card p-6 text-center text-sm text-foreground-muted">No concern guide matches that search. Try “acne”, “dryness”, “Vitamin C”, or “pores”.</p> : null}
  </Container>;
}
