"use client";

import * as React from "react";
import Link from "next/link";
import { ProductService, type PaginatedProductsResult } from "@/services/product.service";
import type { Product } from "@/types";
import { Container } from "@/components/layout/container";
import { ProductCard } from "@/components/product/product-card";
import { GroupedSearchInput } from "@/components/product/grouped-search-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Search,
  Sparkles,
  Tag,
  Layers,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
} from "lucide-react";

const quickPillSearches = [
  "Cleanser for oily skin",
  "Minimalist Niacinamide",
  "Matte Sunscreen SPF 50",
  "Salicylic Acid BHA",
  "Cetaphil Gentle Cleanser",
  "Hyaluronic Acid Serum",
];

const sortOptions = [
  { value: "relevance", label: "Relevance" },
  { value: "rating", label: "Highest Rated" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "best-value", label: "Best Value" },
];

export default function SearchPage() {
  const [query, setQuery] = React.useState("");
  const [activeQuery, setActiveQuery] = React.useState("");
  const [sortBy, setSortBy] = React.useState<any>("relevance");
  const [page, setPage] = React.useState(1);

  const [dataResult, setDataResult] = React.useState<PaginatedProductsResult | null>(null);
  const [relaxedInfo, setRelaxedInfo] = React.useState<{ explanation: string; products: Product[] } | null>(null);
  const [loading, setLoading] = React.useState(false);

  const executeSearch = React.useCallback(async (qString: string, pIndex: number = 1) => {
    setActiveQuery(qString);
    setLoading(true);
    setRelaxedInfo(null);

    const res = await ProductService.getProducts({
      query: qString,
      sortBy,
      page: pIndex,
      pageSize: 9,
    });

    if (res.data) {
      setDataResult(res.data);
      // If 0 matches, check for relaxed requirement options
      if (res.data.products.length === 0) {
        const { ProductSearchService } = await import("@/services/product-search.service");
        const relaxed = await ProductSearchService.searchVerifiedProducts(qString);
        if (relaxed.hasRelaxedFallbacks && relaxed.relaxedProducts && relaxed.relaxedProducts.length > 0) {
          setRelaxedInfo({
            explanation: relaxed.relaxedExplanation || "No exact match found. Showing relaxed matches:",
            products: relaxed.relaxedProducts,
          });
        }
      }
    }
    setLoading(false);
  }, [sortBy]);

  React.useEffect(() => {
    if (activeQuery) {
      executeSearch(activeQuery, page);
    }
  }, [activeQuery, page, executeSearch]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setPage(1);
    executeSearch(query.trim(), 1);
  };

  const handleSelectQuick = (qText: string) => {
    setQuery(qText);
    setPage(1);
    executeSearch(qText, 1);
  };

  const handleClearSearch = () => {
    setQuery("");
    setActiveQuery("");
    setDataResult(null);
    setPage(1);
  };

  return (
    <Container className="py-10 space-y-8 max-w-5xl">
      {/* Search Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <Badge variant="sage" className="mx-auto">
          Frontend Product Search Engine
        </Badge>
        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Search BeautyIQ Product Catalog
        </h1>
        <p className="text-sm text-foreground-muted leading-relaxed">
          Search by product name, brand, active ingredients, category, skin type, or active concerns.
        </p>
      </div>

      {/* Main Search Bar with Autocomplete Grouped Dropdown */}
      <div className="max-w-3xl mx-auto rounded border border-line bg-background-card p-4 shadow-md space-y-3">
        <form onSubmit={handleFormSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <GroupedSearchInput
              value={query}
              onChange={(val) => setQuery(val)}
              onSelectSuggestion={(selectedText) => {
                setPage(1);
                executeSearch(selectedText, 1);
              }}
            />
          </div>
          <Button
            type="submit"
            variant="accent"
            size="md"
            leftIcon={<Search className="h-4 w-4" />}
          >
            Search Catalog
          </Button>
        </form>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-line text-xs">
          <span className="text-foreground-faint font-semibold">Popular Searches:</span>
          {quickPillSearches.map((s) => (
            <button
              key={s}
              onClick={() => handleSelectQuick(s)}
              className="px-2.5 py-1 rounded-full bg-background-elevated hover:bg-sage-tint hover:text-sage-deep transition-colors text-foreground-muted"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Categorized Suggestions Overview when search hasn't been submitted */}
      {!activeQuery && (
        <div className="rounded border border-line bg-background-card p-6 space-y-4 shadow-subtle">
          <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
            <Tag className="h-4 w-4 text-sage-deep" /> Browse Search Suggestions by Topic
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="font-semibold text-foreground-faint block uppercase mb-2">Categories</span>
              <div className="space-y-1.5">
                {["Cleanser", "Serum", "Moisturizer", "Sunscreen", "Toner", "Exfoliator"].map((c) => (
                  <button
                    key={c}
                    onClick={() => handleSelectQuick(c)}
                    className="block text-foreground-muted hover:text-sage-deep transition-colors"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="font-semibold text-foreground-faint block uppercase mb-2">Brands</span>
              <div className="space-y-1.5">
                {["Minimalist", "Dot & Key", "The Derma Co", "Re'equil", "Cetaphil", "COSRX"].map((b) => (
                  <button
                    key={b}
                    onClick={() => handleSelectQuick(b)}
                    className="block text-foreground-muted hover:text-sage-deep transition-colors"
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="font-semibold text-foreground-faint block uppercase mb-2">Active Ingredients</span>
              <div className="space-y-1.5">
                {["Niacinamide", "Salicylic Acid", "Hyaluronic Acid", "Vitamin C", "Ceramides", "Retinol"].map((i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectQuick(i)}
                    className="block text-foreground-muted hover:text-sage-deep transition-colors"
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="font-semibold text-foreground-faint block uppercase mb-2">Skin Concerns</span>
              <div className="space-y-1.5">
                {["Acne", "Dullness", "Hyperpigmentation", "Visible pores", "Dehydration", "Redness"].map((cn) => (
                  <button
                    key={cn}
                    onClick={() => handleSelectQuick(cn)}
                    className="block text-foreground-muted hover:text-sage-deep transition-colors"
                  >
                    {cn}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Search Results Section */}
      {activeQuery && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded border border-line bg-background-card px-4 py-3 shadow-subtle">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground-muted">
                Search Results for &quot;<strong className="text-foreground">{activeQuery}</strong>&quot;:
              </span>
              <Badge variant="sage">{dataResult?.total || 0} Matches</Badge>
              <button
                onClick={handleClearSearch}
                className="text-xs text-foreground-faint hover:text-status-error flex items-center gap-0.5 ml-2"
              >
                <X className="h-3 w-3" /> Clear
              </button>
            </div>

            <div className="w-full sm:w-60">
              <Select
                options={sortOptions}
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          {/* Results Grid / Skeletons / Empty State */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-88 rounded border border-line bg-background-card animate-pulse" />
              ))}
            </div>
          ) : !dataResult || dataResult.products.length === 0 ? (
            <div className="space-y-6">
              <div className="rounded-lg border border-amber-300 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20 p-6 space-y-3 shadow-subtle">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-base">
                  <Sparkles className="h-5 w-5" /> No verified product currently matches all your requirements.
                </div>
                <p className="text-xs text-foreground leading-relaxed">
                  {relaxedInfo ? relaxedInfo.explanation : "We strictly avoid fabricating or hallucinating products. None of our verified catalog entries meet 100% of these search terms."}
                </p>
                <Button variant="outline" size="sm" onClick={handleClearSearch}>
                  Clear &amp; Reset Search
                </Button>
              </div>

              {relaxedInfo && relaxedInfo.products.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    Relaxed Requirement Verified Matches
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {relaxedInfo.products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {dataResult.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {dataResult && dataResult.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-line pt-6">
              <span className="text-xs text-foreground-muted font-mono">
                Page {dataResult.page} of {dataResult.totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={dataResult.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  leftIcon={<ChevronLeft className="h-4 w-4" />}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={dataResult.page >= dataResult.totalPages}
                  onClick={() => setPage((p) => Math.min(dataResult.totalPages, p + 1))}
                  rightIcon={<ChevronRight className="h-4 w-4" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Container>
  );
}
