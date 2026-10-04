"use client";

import * as React from "react";
import Link from "next/link";
import { IngredientService } from "@/services/ingredient.service";
import type { Ingredient, IngredientCategory } from "@/types";
import { Container } from "@/components/layout/container";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Search, FlaskConical, ArrowRight, Info, Sparkles, Droplets, ShieldCheck, Sun } from "lucide-react";

const categoryOptions = [
  { value: "", label: "All Ingredient Categories" },
  { value: "Humectant", label: "Humectant" },
  { value: "Emollient", label: "Emollient" },
  { value: "Occlusive", label: "Occlusive" },
  { value: "Antioxidant", label: "Antioxidant" },
  { value: "Exfoliant", label: "Exfoliant" },
  { value: "Skin conditioning", label: "Skin Conditioning" },
  { value: "Soothing agent", label: "Soothing Agent" },
  { value: "Surfactant", label: "Surfactant" },
  { value: "Preservative", label: "Preservative" },
  { value: "Solvent", label: "Solvent" },
  { value: "UV filter", label: "UV Filter" },
  { value: "Active ingredient", label: "Active Ingredient" },
];

const goalGuides = [
  { title: "Glow & dullness", ingredients: "Vitamin C, Niacinamide, Alpha Arbutin", query: "Vitamin C", icon: Sparkles, image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80" },
  { title: "Acne & active breakouts", ingredients: "Salicylic Acid, Niacinamide, Azelaic Acid", query: "Salicylic Acid", icon: ShieldCheck, image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=900&q=80" },
  { title: "Whiteheads & clogged pores", ingredients: "Salicylic Acid, Niacinamide, Clay", query: "Salicylic Acid", icon: ShieldCheck, image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80" },
  { title: "Blackheads & open pores", ingredients: "Salicylic Acid, Niacinamide, Retinoids", query: "Niacinamide", icon: ShieldCheck, image: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=900&q=80" },
  { title: "Dryness & barrier", ingredients: "Ceramides, Hyaluronic Acid, Glycerin", query: "Hyaluronic Acid", icon: Droplets, image: "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=900&q=80" },
  { title: "Itching & sensitivity", ingredients: "Centella, Panthenol, Ceramides", query: "Centella", icon: Droplets, image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80" },
  { title: "Uneven tone & dark spots", ingredients: "Vitamin C, Alpha Arbutin, Tranexamic Acid", query: "Alpha Arbutin", icon: Sparkles, image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=900&q=80" },
  { title: "Oiliness & shine", ingredients: "Niacinamide, Zinc PCA, Salicylic Acid", query: "Niacinamide", icon: ShieldCheck, image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=900&q=80" },
  { title: "Texture & roughness", ingredients: "Lactic Acid, Glycolic Acid, Urea", query: "Lactic Acid", icon: Sparkles, image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=900&q=80" },
  { title: "Fine lines", ingredients: "Retinoids, Peptides, Hyaluronic Acid", query: "Retinol", icon: Sparkles, image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80" },
  { title: "Tanning care", ingredients: "Vitamin C, Niacinamide, Alpha Arbutin", query: "Niacinamide", icon: Sun, image: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=900&q=80" },
  { title: "Dark circles", ingredients: "Caffeine, Vitamin C, Peptides", query: "Caffeine", icon: Droplets, image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80" },
  { title: "Sun protection", ingredients: "Broad-spectrum UV filters, antioxidants", query: "Sunscreen", icon: Sun, image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=900&q=80" },
];

export default function IngredientsPage() {
  const [ingredients, setIngredients] = React.useState<Ingredient[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("");

  React.useEffect(() => {
    IngredientService.searchIngredients(searchQuery, selectedCategory).then((res) => {
      if (res.data) setIngredients(res.data);
    });
  }, [searchQuery, selectedCategory]);

  return (
    <Container className="py-6 md:py-8 space-y-8">
      <section>
        <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-champagne-deep">Ingredient guide</p><h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Start with your skin goal.</h1><p className="mt-3 text-sm leading-relaxed text-foreground-muted">Learn which cosmetic ingredients are commonly used for a concern, then open matching catalog products to inspect their labels and listings.</p></div>
        <div className="mt-6 rounded-3xl border border-line bg-background-card p-5 shadow-subtle sm:p-7"><p className="text-xs font-bold uppercase tracking-[0.18em] text-champagne-deep">Ingredients by concern</p><h2 className="mt-2 font-display text-2xl font-bold text-foreground">Choose a concern to explore ingredients and products.</h2><p className="mt-2 text-sm text-foreground-muted">Click anywhere on a card. It opens the catalog with a related ingredient search.</p><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{goalGuides.map((guide) => { const Icon = guide.icon; return <Link key={guide.title} href={`/products?q=${encodeURIComponent(guide.query)}`} className="group relative flex min-h-64 flex-col overflow-hidden rounded-3xl border border-line bg-background-card p-5 shadow-subtle transition-all hover:-translate-y-1 hover:border-champagne/70 hover:shadow-lg"><span aria-hidden="true" className="absolute inset-0 bg-cover bg-center opacity-20 transition-opacity duration-300 group-hover:opacity-30" style={{ backgroundImage: `url(${guide.image})` }} /><span aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-background-card/90 via-background-card/85 to-background-card/95" /><span className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-champagne-tint text-champagne-deep"><Icon className="h-4 w-4" /></span><h3 className="relative mt-5 font-display text-xl font-bold text-foreground">{guide.title}</h3><p className="relative mt-3 text-sm leading-relaxed text-foreground-muted">{guide.ingredients}</p><span className="relative mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-bold text-champagne-deep">See matching products <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span></Link>; })}</div></div>
      </section>

      <div className="rounded-xl border border-line bg-background-card px-4 py-3 text-xs text-foreground-muted flex items-start gap-3 shadow-subtle"><Info className="h-4 w-4 text-sage-deep shrink-0 mt-0.5" /><p><strong className="text-foreground font-semibold">Educational cosmetic information:</strong> Ingredient guides help with product discovery, not medical diagnosis. For a skin condition, consult a dermatologist.</p></div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by ingredient name, synonym, or concern..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4 text-sage-deep" />}
          />
        </div>
        <div className="w-full sm:w-64">
          <Select
            options={categoryOptions}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3"><h2 className="font-display text-xl font-bold text-foreground">Explore individual ingredients</h2><span className="text-xs text-foreground-faint">{ingredients.length} available</span></div>

      {/* Ingredient Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ingredients.map((ing) => (
          <Link
            key={ing.id}
            href={`/ingredients/${ing.id}`}
            className="group flex flex-col justify-between rounded border border-line bg-background-card p-6 shadow-subtle transition-all duration-200 hover:border-line-strong hover:shadow-md"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-9 w-9 rounded bg-sage-tint flex items-center justify-center text-sage-deep">
                  <FlaskConical className="h-4 w-4" />
                </div>
                <Badge variant={ing.safetyRating === "Low Hazard" ? "sage" : "clay"}>
                  {ing.safetyRating}
                </Badge>
              </div>

              <div>
                <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-sage-deep transition-colors">
                  {ing.name}
                </h3>
                <span className="text-[0.7rem] font-mono text-foreground-faint block mt-0.5">
                  Category: {ing.category}
                </span>
              </div>

              <p className="text-xs font-mono text-sage-deep font-semibold">
                Typical Conc: {ing.concentration} • Comedogenic Score: {ing.comedogenicRating}/5
              </p>

              <p className="text-xs text-foreground-muted line-clamp-2 leading-relaxed">
                {ing.description || ing.function}
              </p>

              <div className="flex flex-wrap gap-1 pt-1">
                {ing.concernTags.map((tag) => (
                  <Badge key={tag} variant="default" className="text-[0.65rem] py-0 px-1.5">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mt-6 border-t border-line pt-3 flex items-center justify-between text-xs font-semibold text-sage-deep">
              <span>View Ingredient Details &amp; Products</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </Container>
  );
}
