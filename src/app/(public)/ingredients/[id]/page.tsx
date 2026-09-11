"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { IngredientService } from "@/services/ingredient.service";
import type { Ingredient, Product } from "@/types";
import { Container } from "@/components/layout/container";
import { ProductCard } from "@/components/product/product-card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ArrowLeft, FlaskConical, AlertTriangle, Info, CheckCircle2, ShieldAlert } from "lucide-react";

export default function IngredientDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [ingredient, setIngredient] = React.useState<Ingredient | null>(null);
  const [matchingProducts, setMatchingProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (id) {
      setLoading(true);
      IngredientService.getIngredientById(id).then((res) => {
        if (res.data) {
          setIngredient(res.data);
          IngredientService.getProductsForIngredient(res.data.name).then((prodRes) => {
            if (prodRes.data) setMatchingProducts(prodRes.data);
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      });
    }
  }, [id]);

  if (loading) {
    return (
      <Container className="py-16 text-center">
        <div className="h-96 w-full rounded border border-line bg-background-card animate-pulse" />
      </Container>
    );
  }

  if (!ingredient) {
    return (
      <Container className="py-16">
        <EmptyState
          title="Ingredient Not Found"
          description="The requested active ingredient profile does not exist in the BeautyIQ database."
          actionLabel="Back to Ingredients Glossary"
          onAction={() => (window.location.href = "/ingredients")}
        />
      </Container>
    );
  }

  return (
    <Container className="py-10 space-y-10 max-w-5xl">
      {/* Navigation */}
      <Link
        href="/ingredients"
        className="inline-flex items-center gap-2 text-xs font-semibold text-foreground-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Ingredients Glossary
      </Link>

      {/* Ingredient Hero */}
      <div className="rounded border border-line bg-background-card p-6 md:p-8 space-y-4 shadow-subtle">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded bg-sage-tint flex items-center justify-center text-sage-deep shrink-0">
              <FlaskConical className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="sage">{ingredient.category}</Badge>
                <Badge variant={ingredient.safetyRating === "Low Hazard" ? "sage" : "clay"}>
                  {ingredient.safetyRating}
                </Badge>
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-1">
                {ingredient.name}
              </h1>
            </div>
          </div>

          <div className="text-right font-mono text-xs text-foreground-faint space-y-0.5">
            <div>Typical Conc: <strong className="text-sage-deep font-semibold">{ingredient.concentration}</strong></div>
            <div>Comedogenic Score: <strong className="text-foreground font-semibold">{ingredient.comedogenicRating}/5</strong></div>
          </div>
        </div>

        {/* Common Names & Synonyms */}
        {(ingredient.commonNames?.length || ingredient.synonyms?.length) ? (
          <div className="flex flex-wrap items-center gap-2 text-xs text-foreground-muted border-t border-b border-line py-3">
            <span className="font-semibold text-foreground-faint">Common Names &amp; Synonyms:</span>
            {[...(ingredient.commonNames || []), ...(ingredient.synonyms || [])].map((alias) => (
              <Badge key={alias} variant="default" className="text-[0.7rem]">
                {alias}
              </Badge>
            ))}
          </div>
        ) : null}

        <p className="text-sm text-foreground-muted leading-relaxed">
          {ingredient.description}
        </p>

        <div className="rounded bg-background-elevated p-4 text-xs space-y-1">
          <span className="font-semibold text-foreground-faint uppercase tracking-wider block">Primary Biological Function</span>
          <p className="text-foreground font-medium">{ingredient.function}</p>
        </div>
      </div>

      {/* Suitable Skin Types & Concerns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded border border-line bg-background-card p-6 space-y-3 shadow-subtle">
          <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-sage-deep" /> Suitable Skin Types
          </h3>
          <div className="flex flex-wrap gap-2">
            {ingredient.suitableSkinTypes.map((type) => (
              <Badge key={type} variant="sage" className="px-3 py-1">
                {type}
              </Badge>
            ))}
          </div>
        </div>

        <div className="rounded border border-line bg-background-card p-6 space-y-3 shadow-subtle">
          <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-clay" /> Target Skin Concerns
          </h3>
          <div className="flex flex-wrap gap-2">
            {ingredient.concernTags.map((tag) => (
              <Badge key={tag} variant="clay" className="px-3 py-1">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Contraindications Warning */}
      {ingredient.contraindications && ingredient.contraindications.length > 0 && (
        <div className="rounded border border-status-warning/30 bg-status-warning-bg/40 p-5 space-y-2">
          <h4 className="font-semibold text-status-warning flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4" /> Sensitivity &amp; Routine Contraindications
          </h4>
          <p className="text-xs text-foreground-muted leading-relaxed">
            Do not combine simultaneously in the exact same application step with:{" "}
            <strong className="text-foreground font-semibold">
              {ingredient.contraindications.join(", ")}
            </strong>. Space out across AM/PM routines or alternate days to prevent skin barrier distress.
          </p>
        </div>
      )}

      {/* Non-Medical Disclaimer */}
      <div className="rounded border border-line bg-background-card p-4 text-xs text-foreground-faint flex items-start gap-2.5">
        <Info className="h-4 w-4 text-sage-deep shrink-0 mt-0.5" />
        <div>
          <strong>Disclaimer:</strong> Cosmetic ingredient information provided above is for educational evaluation and research purposes only. No medical therapeutic claims are made or implied.
        </div>
      </div>

      {/* Products Containing This Ingredient */}
      <div className="space-y-4 pt-4 border-t border-line">
        <h2 className="font-display text-2xl font-bold text-foreground">
          Products Containing {ingredient.name} ({matchingProducts.length})
        </h2>

        {matchingProducts.length === 0 ? (
          <p className="text-sm text-foreground-muted">No indexed products currently list {ingredient.name} in their primary key active ingredient list.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchingProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
