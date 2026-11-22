"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  ExternalLink,
  Scale,
  Check,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  Table as TableIcon,
  ShieldCheck,
  TrendingDown,
} from "lucide-react";
import type { Product, ProductListing } from "@/types";
import {
  SimilarProductsService,
  type SearchComparisonResult,
  type SimilarProductMatch,
} from "@/services/similar-products.service";
import { ValueEngineService } from "@/services/value-engine.service";
import { useComparison } from "@/context/comparison-context";
import { useToast } from "@/context/toast-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchComparisonWidgetProps {
  searchQuery: string;
  allProducts: Product[];
  className?: string;
}

export function SearchComparisonWidget({
  searchQuery,
  allProducts,
  className,
}: SearchComparisonWidgetProps) {
  const [comparison, setComparison] = React.useState<SearchComparisonResult | null>(null);
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [viewMode, setViewMode] = React.useState<"cards" | "table">("cards");
  const [selectedListingModal, setSelectedListingModal] = React.useState<string | null>(null);

  const { isInComparison, addToComparison, removeFromComparison } = useComparison();
  const { addToast } = useToast();

  React.useEffect(() => {
    if (!searchQuery || !searchQuery.trim()) {
      setComparison(null);
      return;
    }
    const result = SimilarProductsService.getComparisonForSearch(searchQuery, allProducts, 3);
    setComparison(result);
  }, [searchQuery, allProducts]);

  if (!comparison || comparison.similarProducts.length === 0) {
    return null;
  }

  const { targetProduct, targetListings, targetBestListing, similarProducts } = comparison;

  const targetUnitCost = ValueEngineService.calculateNormalizedUnitCost(
    targetBestListing?.price ?? null,
    targetProduct.quantity,
    targetProduct.unit
  );

  const handleToggleCompare = (productId: string, productName: string) => {
    if (isInComparison(productId)) {
      removeFromComparison(productId);
      addToast({
        type: "info",
        title: "Removed from Comparison Matrix",
        description: productName,
      });
    } else {
      addToComparison(productId);
      addToast({
        type: "success",
        title: "Added to Comparison Matrix",
        description: productName,
      });
    }
  };

  const allComparedItems = [
    {
      product: targetProduct,
      isTarget: true,
      similarityScore: 100,
      similarityReasons: ["Exact / Primary Search Match"],
      listings: targetListings,
      bestListing: targetBestListing,
      unitCostLabel: targetUnitCost.unitLabel,
    },
    ...similarProducts.map((s) => ({
      product: s.product,
      isTarget: false,
      similarityScore: s.similarityScore,
      similarityReasons: s.similarityReasons,
      listings: s.listings,
      bestListing: s.bestListing,
      unitCostLabel: s.unitCostLabel,
    })),
  ];

  return (
    <div
      className={cn(
        "rounded-2xl border border-sage-deep/30 bg-background-card overflow-hidden shadow-sm transition-all space-y-0",
        className
      )}
    >
      {/* Header Bar */}
      <div className="bg-sage-tint/40 dark:bg-sage-deep/15 border-b border-sage-deep/20 px-4 py-3 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sage-deep text-white shadow-xs font-bold text-sm">
            <Scale className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display text-sm sm:text-base font-bold text-foreground">
                Compare Searched Product &amp; Similar Alternatives
              </h3>
              <span className="text-[0.65rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sage-deep text-white">
                Live Store Rates
              </span>
            </div>
            <p className="text-[0.72rem] text-foreground-muted">
              Side-by-side comparison for &quot;<strong className="text-foreground">{searchQuery}</strong>&quot; across Amazon, Flipkart, Nykaa, Myntra, Purplle, Tira &amp; Direct Stores.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {/* View Mode Toggle */}
          <div className="hidden md:flex items-center rounded-lg border border-line bg-background-elevated p-0.5 text-xs">
            <button
              onClick={() => setViewMode("cards")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-colors",
                viewMode === "cards"
                  ? "bg-background-card text-foreground shadow-xs"
                  : "text-foreground-muted hover:text-foreground"
              )}
            >
              <LayoutGrid className="h-3 w-3" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-colors",
                viewMode === "table"
                  ? "bg-background-card text-foreground shadow-xs"
                  : "text-foreground-muted hover:text-foreground"
              )}
            >
              <TableIcon className="h-3 w-3" />
              <span>Table</span>
            </button>
          </div>

          <Link href="/compare">
            <Button size="sm" variant="outline" className="text-xs h-7 gap-1 text-sage-deep border-sage-deep/40 hover:bg-sage-tint/40">
              <Scale className="h-3 w-3" />
              <span>Full Matrix</span>
            </Button>
          </Link>

          <button
            onClick={() => setIsExpanded((v) => !v)}
            className="p-1.5 text-foreground-muted hover:text-foreground rounded-lg border border-line hover:bg-background-elevated transition-colors"
            title={isExpanded ? "Collapse comparison" : "Expand comparison"}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Body */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-4">
          {viewMode === "cards" ? (
            /* Cards View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
              {allComparedItems.map((item, idx) => {
                const isCompared = isInComparison(item.product.id);
                const bestListing = item.bestListing;

                return (
                  <div
                    key={item.product.id}
                    className={cn(
                      "flex flex-col justify-between rounded-xl border p-3.5 sm:p-4 space-y-3 transition-all relative bg-background-card",
                      item.isTarget
                        ? "border-sage-deep/80 ring-2 ring-sage-deep/20 shadow-md bg-sage-tint/10"
                        : "border-line hover:border-line-strong hover:shadow-xs"
                    )}
                  >
                    {/* Badge Pill */}
                    <div className="flex items-center justify-between gap-1">
                      {item.isTarget ? (
                        <span className="text-[0.62rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sage-deep text-white flex items-center gap-1 shadow-2xs">
                          <span>🎯 Searched Match</span>
                        </span>
                      ) : (
                        <span className="text-[0.62rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-clay-tint text-clay border border-clay/30 flex items-center gap-1">
                          <Sparkles className="h-2.5 w-2.5" />
                          <span>{item.similarityScore}% Similar</span>
                        </span>
                      )}
                      <span className="text-[0.65rem] font-mono text-foreground-faint truncate">
                        {item.product.quantity} {item.product.unit}
                      </span>
                    </div>

                    {/* Product Basic Info */}
                    <div className="flex items-start gap-3">
                      <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-background-elevated shrink-0 border border-line">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[0.68rem] font-bold uppercase tracking-wider text-sage-deep truncate block">
                          {item.product.brand}
                        </span>
                        <Link
                          href={`/products/${item.product.id}`}
                          className="font-display font-semibold text-xs sm:text-[0.82rem] text-foreground hover:text-sage-deep line-clamp-2 leading-snug"
                        >
                          {item.product.name}
                        </Link>
                        {item.product.rating && (
                          <span className="text-[0.68rem] text-foreground-muted flex items-center gap-1 mt-0.5">
                            <span className="text-amber-500 font-bold">★ {item.product.rating}</span>
                            <span className="text-foreground-faint">({item.product.reviewCount})</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Key Formulation Actives */}
                    <div className="space-y-1">
                      <span className="text-[0.65rem] font-semibold text-foreground-faint uppercase tracking-wider block">
                        Actives &amp; Formula:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {item.product.keyIngredients.slice(0, 2).map((ing) => (
                          <span
                            key={ing}
                            className="text-[0.62rem] font-medium px-1.5 py-0.5 rounded bg-sage-tint/80 text-sage-deep border border-sage-deep/20"
                          >
                            {ing}
                          </span>
                        ))}
                        {item.product.fragranceFree && (
                          <span className="text-[0.62rem] font-medium px-1.5 py-0.5 rounded bg-background-elevated text-foreground-muted border border-line">
                            Fragrance-Free
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Similarity Reasoning */}
                    {!item.isTarget && item.similarityReasons.length > 0 && (
                      <div className="rounded-lg bg-background-elevated/70 p-2 text-[0.65rem] space-y-0.5 border border-line/60">
                        <span className="font-semibold text-foreground-muted block">Why this alternative:</span>
                        <ul className="list-disc list-inside text-foreground-faint space-y-0.5 leading-tight">
                          {item.similarityReasons.map((r, i) => (
                            <li key={i} className="truncate">{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Store Price Matrix Preview */}
                    <div className="space-y-1.5 border-t border-line/60 pt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-foreground-faint text-[0.68rem]">Cheapest Store:</span>
                        <span className="font-bold text-sage-deep font-mono">
                          ₹{bestListing?.price} ({bestListing?.platform?.replace(" Direct", "").replace(" Store", "")})
                        </span>
                      </div>

                      {/* Store Price Chips */}
                      <div className="flex flex-wrap gap-1">
                        {item.listings.slice(0, 3).map((l) => (
                          <a
                            key={l.id}
                            href={l.productUrl}
                            target="_blank"
                            rel="noreferrer"
                            title={`Buy on ${l.platform} for ₹${l.price}`}
                            className={cn(
                              "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[0.62rem] border transition-colors",
                              l.isBestPrice
                                ? "bg-sage-tint text-sage-deep border-sage-deep/40 font-bold"
                                : "bg-background-elevated text-foreground-muted hover:text-foreground border-line"
                            )}
                          >
                            <span className="truncate max-w-[55px]">{l.platform.replace(" Direct", "").replace(" Store", "")}</span>
                            <span className="font-mono">₹{l.price}</span>
                          </a>
                        ))}
                        {item.listings.length > 3 && (
                          <span className="text-[0.62rem] text-foreground-faint px-1 py-0.5 font-mono">
                            +{item.listings.length - 3} stores
                          </span>
                        )}
                      </div>

                      <div className="text-[0.65rem] font-mono text-foreground-faint flex items-center justify-between pt-0.5">
                        <span>Unit Value:</span>
                        <strong className="text-foreground">{item.unitCostLabel}</strong>
                      </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="pt-2 border-t border-line/60 flex items-center gap-1.5 mt-auto">
                      {bestListing?.productUrl && (
                        <a
                          href={bestListing.productUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-sage-deep hover:bg-sage-deep/90 text-white text-xs font-semibold py-1.5 px-2 transition-colors shadow-2xs"
                        >
                          <span>Buy on {bestListing.platform.replace(" Direct", "").replace(" Store", "")}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      <button
                        onClick={() => handleToggleCompare(item.product.id, item.product.name)}
                        title={isCompared ? "Remove from comparison" : "Add to comparison"}
                        className={cn(
                          "px-2 py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center transition-colors shrink-0",
                          isCompared
                            ? "border-sage-deep bg-sage-tint text-sage-deep"
                            : "border-line bg-background-elevated hover:bg-background-card text-foreground-muted hover:text-foreground"
                        )}
                      >
                        {isCompared ? <Check className="h-3.5 w-3.5" /> : <Scale className="h-3.5 w-3.5 text-sage-deep" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Side-by-Side Comparison Matrix Table View */
            <div className="overflow-x-auto border border-line rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-background-elevated border-b border-line text-foreground-muted font-semibold">
                  <tr>
                    <th className="p-3 w-36">Criteria</th>
                    {allComparedItems.map((item) => (
                      <th
                        key={item.product.id}
                        className={cn(
                          "p-3 min-w-[200px] border-l border-line",
                          item.isTarget && "bg-sage-tint/20 font-bold"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className="truncate">{item.product.brand}</span>
                          {item.isTarget ? (
                            <span className="text-[0.6rem] bg-sage-deep text-white px-1.5 py-0.2 rounded font-bold">
                              SEARCHED
                            </span>
                          ) : (
                            <span className="text-[0.6rem] bg-clay-tint text-clay px-1.5 py-0.2 rounded font-bold">
                              {item.similarityScore}% MATCH
                            </span>
                          )}
                        </div>
                        <p className="font-display text-xs text-foreground font-semibold line-clamp-1 mt-0.5">
                          {item.product.name}
                        </p>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {/* Lowest Verified Price */}
                  <tr>
                    <td className="p-3 font-semibold text-foreground-muted bg-background-elevated/40">
                      Best Price
                    </td>
                    {allComparedItems.map((item) => (
                      <td key={item.product.id} className="p-3 border-l border-line">
                        <span className="font-mono text-sm font-bold text-foreground">
                          ₹{item.bestListing?.price}
                        </span>
                        <span className="text-[0.68rem] text-sage-deep font-semibold block">
                          on {item.bestListing?.platform}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Prices Across All Stores */}
                  <tr>
                    <td className="p-3 font-semibold text-foreground-muted bg-background-elevated/40">
                      Store Offers
                    </td>
                    {allComparedItems.map((item) => (
                      <td key={item.product.id} className="p-3 border-l border-line space-y-1">
                        <div className="flex flex-wrap gap-1">
                          {item.listings.slice(0, 4).map((l) => (
                            <a
                              key={l.id}
                              href={l.productUrl}
                              target="_blank"
                              rel="noreferrer"
                              className={cn(
                                "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[0.62rem] border",
                                l.isBestPrice
                                  ? "bg-sage-tint text-sage-deep border-sage-deep/40 font-bold"
                                  : "border-line bg-background-elevated text-foreground-muted"
                              )}
                            >
                              <span>{l.platform.replace(" Direct", "").replace(" Store", "")}</span>
                              <span className="font-mono font-semibold">₹{l.price}</span>
                            </a>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Normalized Unit Value */}
                  <tr>
                    <td className="p-3 font-semibold text-foreground-muted bg-background-elevated/40">
                      Unit Cost Value
                    </td>
                    {allComparedItems.map((item) => (
                      <td key={item.product.id} className="p-3 border-l border-line font-mono font-medium">
                        {item.unitCostLabel}
                      </td>
                    ))}
                  </tr>

                  {/* Active Ingredients */}
                  <tr>
                    <td className="p-3 font-semibold text-foreground-muted bg-background-elevated/40">
                      Key Actives
                    </td>
                    {allComparedItems.map((item) => (
                      <td key={item.product.id} className="p-3 border-l border-line">
                        <div className="flex flex-wrap gap-1">
                          {item.product.keyIngredients.map((i) => (
                            <span
                              key={i}
                              className="text-[0.62rem] px-1.5 py-0.5 rounded bg-sage-tint/60 text-sage-deep"
                            >
                              {i}
                            </span>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Skin Type & Routine Step */}
                  <tr>
                    <td className="p-3 font-semibold text-foreground-muted bg-background-elevated/40">
                      Skin &amp; Step
                    </td>
                    {allComparedItems.map((item) => (
                      <td key={item.product.id} className="p-3 border-l border-line text-foreground-muted">
                        <div>Step: <strong className="text-foreground">{item.product.category}</strong></div>
                        <div className="text-[0.68rem] text-foreground-faint">
                          {item.product.skinTypes.join(", ")}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Clean Ethics & Preferences */}
                  <tr>
                    <td className="p-3 font-semibold text-foreground-muted bg-background-elevated/40">
                      Safety Profile
                    </td>
                    {allComparedItems.map((item) => (
                      <td key={item.product.id} className="p-3 border-l border-line text-[0.68rem] space-y-0.5">
                        <div className={item.product.fragranceFree ? "text-sage-deep font-semibold" : "text-foreground-faint"}>
                          Fragrance-free: {item.product.fragranceFree ? "Yes" : "No"}
                        </div>
                        <div className={item.product.crueltyFree ? "text-sage-deep" : "text-foreground-faint"}>
                          Cruelty-free: {item.product.crueltyFree ? "Yes" : "No"}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Direct Buy CTA */}
                  <tr>
                    <td className="p-3 font-semibold text-foreground-muted bg-background-elevated/40">
                      Purchase Link
                    </td>
                    {allComparedItems.map((item) => (
                      <td key={item.product.id} className="p-3 border-l border-line">
                        {item.bestListing?.productUrl && (
                          <a
                            href={item.bestListing.productUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded bg-sage-deep hover:bg-sage-deep/90 text-white text-xs font-semibold py-1 px-2.5 transition-colors"
                          >
                            <span>Buy on {item.bestListing.platform.replace(" Direct", "").replace(" Store", "")} ↗</span>
                          </a>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
