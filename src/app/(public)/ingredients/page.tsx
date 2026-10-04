"use client";

import * as React from "react";
import Link from "next/link";
import { IngredientService } from "@/services/ingredient.service";
import type { Ingredient, IngredientCategory } from "@/types";
import { Container } from "@/components/layout/container";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Search, FlaskConical, ShieldAlert, ArrowRight, Info } from "lucide-react";

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
    <Container className="py-6 md:py-8 space-y-6">
      {/* Non-Medical Disclaimer Alert (Requirement #17) */}
      <div className="rounded border border-line bg-background-card p-4 text-xs text-foreground-muted flex items-start gap-3 shadow-subtle">
        <Info className="h-5 w-5 text-sage-deep shrink-0 mt-0.5" />
        <div>
          <strong className="text-foreground font-semibold">Educational &amp; Cosmetic Reference:</strong> BeautyIQ ingredient profiles are compiled from dermatological literature for informational purposes. They do not constitute medical advice or diagnosis.
        </div>
      </div>

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
