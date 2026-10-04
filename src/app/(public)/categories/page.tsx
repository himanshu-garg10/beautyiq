import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Droplets, Sparkles, Sun, Waves, ShieldCheck } from "lucide-react";
import { Container } from "@/components/layout/container";

export const metadata: Metadata = {
  title: "Discover Beauty Categories — BeautyIQ",
  description: "Browse the BeautyIQ catalog by skincare category.",
};

const categories = [
  { name: "Face Wash", category: "Face Wash", icon: Waves, description: "Daily cleansing for sweat, oil and impurities.", image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80" },
  { name: "Cleanser", category: "Cleanser", icon: Waves, description: "Gentle cleansing, makeup removal and barrier care.", image: "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=900&q=80" },
  { name: "Serum", category: "Serum", icon: Sparkles, description: "Targeted formulas for glow, spots, acne and texture.", image: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=900&q=80" },
  { name: "Moisturizer", category: "Moisturizer", icon: Droplets, description: "Creams, gels and lotions for hydration and barrier support.", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80" },
  { name: "Sunscreen", category: "Sunscreen", icon: Sun, description: "Daily UV-protection products for your routine.", image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=900&q=80" },
  { name: "Toner", category: "Toner", icon: Droplets, description: "Lightweight hydration and prep after cleansing.", image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=900&q=80" },
  { name: "Exfoliator", category: "Exfoliator", icon: Sparkles, description: "Leave-on and wash-off exfoliation products.", image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=900&q=80" },
  { name: "Acne Focused Products", category: "Acne Focused Products", icon: ShieldCheck, description: "Products indexed for acne, pimples and pore concerns.", image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=900&q=80" },
  { name: "Face Masks", category: "Face Masks", icon: Waves, description: "Occasional masks for hydration, cleansing and comfort.", image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80" },
  { name: "Lip Care", category: "Lip Care", icon: Droplets, description: "Lip balms, treatments and care products.", image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=80" },
  { name: "Eye Care", category: "Eye Care", icon: Sparkles, description: "Eye-area products for hydration and appearance concerns.", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80" },
  { name: "Treatment Products", category: "Treatment Products", icon: Sparkles, description: "Focused products for specific skincare routine needs.", image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=900&q=80" },
  { name: "All available products", category: "", icon: Sparkles, description: "Everything currently imported or source-linked in BeautyIQ.", image: "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=900&q=80" },
];

export default function CategoriesPage() {
  return <Container className="py-8 md:py-10">
    <div className="mb-8 max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-champagne-deep">Discover</p><h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Choose a skincare category.</h1><p className="mt-3 text-sm leading-relaxed text-foreground-muted">These links open the BeautyIQ catalog already filtered by routine step. New source-linked and imported products appear here as the catalog grows.</p></div>
    <div className="rounded-3xl border border-line bg-background-card p-5 shadow-subtle sm:p-7"><p className="text-xs font-bold uppercase tracking-[0.18em] text-champagne-deep">Product categories</p><h2 className="mt-2 font-display text-2xl font-bold text-foreground">Open any category to see matching products.</h2><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{categories.map((item) => { const Icon = item.icon; const href = item.category ? `/products?category=${encodeURIComponent(item.category)}` : "/products"; return <Link key={item.name} href={href} className="group relative flex min-h-64 flex-col overflow-hidden rounded-3xl border border-line bg-background-card p-5 shadow-subtle transition-all duration-300 hover:-translate-y-1 hover:border-champagne/70 hover:shadow-lg"><span aria-hidden="true" className="absolute inset-0 bg-cover bg-center opacity-20 transition-opacity duration-300 group-hover:opacity-30" style={{ backgroundImage: `url(${item.image})` }} /><span aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-background-card/90 via-background-card/85 to-background-card/95" /><span className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-champagne-tint text-champagne-deep"><Icon className="h-4 w-4" /></span><h3 className="relative mt-5 font-display text-xl font-bold text-foreground">{item.name}</h3><p className="relative mt-3 text-sm leading-relaxed text-foreground-muted">{item.description}</p><span className="relative mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-bold text-champagne-deep">Open products <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span></Link>; })}</div></div>
  </Container>;
}
