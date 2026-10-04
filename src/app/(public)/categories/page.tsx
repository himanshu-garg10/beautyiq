import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Droplets, Sparkles, Sun, Waves } from "lucide-react";
import { Container } from "@/components/layout/container";

export const metadata: Metadata = {
  title: "Discover Beauty Categories — BeautyIQ",
  description: "Browse the BeautyIQ catalog by skincare category.",
};

const categories = [
  { name: "Face Wash & Cleansers", category: "Face Wash", icon: Waves, description: "Start with daily cleansing and gentle makeup removal." },
  { name: "Serums & Treatments", category: "Serum", icon: Sparkles, description: "Explore targeted formulas for glow, spots, acne and texture." },
  { name: "Moisturizers", category: "Moisturizer", icon: Droplets, description: "Find barrier-supporting creams, gels and lotions." },
  { name: "Sunscreens", category: "Sunscreen", icon: Sun, description: "Browse daily UV-protection products in the catalog." },
  { name: "Toners & Essences", category: "Toner", icon: Droplets, description: "Lightweight hydration and prep steps for your routine." },
  { name: "Exfoliators", category: "Exfoliator", icon: Sparkles, description: "Explore exfoliation products and read ingredient details first." },
  { name: "Masks & Lip Care", category: "Face Masks", icon: Waves, description: "Discover occasional-care and finishing routine products." },
  { name: "All available products", category: "", icon: Sparkles, description: "Search everything currently imported or source-linked in BeautyIQ." },
];

export default function CategoriesPage() {
  return <Container className="py-8 md:py-10">
    <div className="mb-8 max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-champagne-deep">Discover</p><h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Choose a skincare category.</h1><p className="mt-3 text-sm leading-relaxed text-foreground-muted">These links open the BeautyIQ catalog already filtered by routine step. New source-linked and imported products appear here as the catalog grows.</p></div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{categories.map((item) => { const Icon = item.icon; const href = item.category ? `/products?category=${encodeURIComponent(item.category)}` : "/products"; return <Link key={item.name} href={href} className="group min-h-48 rounded-3xl border border-line bg-background-card p-6 shadow-subtle transition-all duration-300 hover:-translate-y-1 hover:border-champagne/60 hover:bg-champagne-tint/20 hover:shadow-lg"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-champagne-tint text-champagne-deep"><Icon className="h-5 w-5" /></span><h2 className="mt-6 font-display text-xl font-bold text-foreground">{item.name}</h2><p className="mt-2 text-sm leading-relaxed text-foreground-muted">{item.description}</p><span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-champagne-deep">Open products <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span></Link>; })}</div>
  </Container>;
}
