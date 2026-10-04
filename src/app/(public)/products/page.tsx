"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { ProductService, type PaginatedProductsResult } from "@/services/product.service";
import type { RoutineStep, SkinType, DetailedSkinConcern, AvailabilityStatus } from "@/types";
import { Container } from "@/components/layout/container";
import { ProductCard } from "@/components/product/product-card";
import { GroupedSearchInput } from "@/components/product/grouped-search-input";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Pills } from "@/components/ui/pills";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  SlidersHorizontal,
  RotateCcw,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const categoryOptions = [
  { value: "", label: "All Categories" },
  { value: "Face Wash", label: "Face Wash" },
  { value: "Cleanser", label: "Cleanser" },
  { value: "Serum", label: "Serum" },
  { value: "Moisturizer", label: "Moisturizer" },
  { value: "Sunscreen", label: "Sunscreen" },
  { value: "Toner", label: "Toner" },
  { value: "Exfoliator", label: "Exfoliator" },
  { value: "Acne Focused Products", label: "Acne Focused Products" },
  { value: "Face Masks", label: "Face Masks" },
  { value: "Lip Care", label: "Lip Care" },
  { value: "Eye Care", label: "Eye Care" },
  { value: "Treatment Products", label: "Treatment Products" },
];

const skinTypePills = [
  { id: "Oily", label: "Oily" },
  { id: "Dry", label: "Dry" },
  { id: "Combination", label: "Combination" },
  { id: "Sensitive", label: "Sensitive" },
  { id: "Normal", label: "Normal" },
];

const concernPills = [
  { id: "Acne", label: "Acne" },
  { id: "Dullness", label: "Dullness" },
  { id: "Hyperpigmentation", label: "Hyperpigmentation" },
  { id: "Dark spots", label: "Dark Spots" },
  { id: "Visible pores", label: "Pores" },
  { id: "Redness", label: "Redness" },
  { id: "Dehydration", label: "Dehydration" },
  { id: "Dryness", label: "Dryness" },
];

const ratingOptions = [
  { value: "", label: "Any Rating" },
  { value: "4.5", label: "4.5★ and above" },
  { value: "4.0", label: "4.0★ and above" },
  { value: "3.5", label: "3.5★ and above" },
];

const availabilityOptions = [
  { value: "", label: "All Availability" },
  { value: "Available", label: "In Stock Only" },
  { value: "Limited Information", label: "Limited Stock" },
];

const sortOptions = [
  { value: "relevance", label: "Relevance & Popularity" },
  { value: "rating", label: "Highest Rated" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "best-value", label: "Best Value Index" },
  { value: "compatibility", label: "Highest Compatibility" },
];

function ProductsCatalogContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams?.get("category") || "";
  const initialBrand = searchParams?.get("brand") || "";
  const initialQuery = searchParams?.get("q") || "";
  const initialSkinType = searchParams?.get("skinType") || "";
  const initialMaxPrice = searchParams?.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!, 10) : 3000;

  const [searchQuery, setSearchQuery] = React.useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = React.useState<string>(initialCategory);
  const [selectedBrand, setSelectedBrand] = React.useState<string>(initialBrand);
  const [selectedSkinTypes, setSelectedSkinTypes] = React.useState<string[]>(initialSkinType ? [initialSkinType] : []);
  const [selectedConcerns, setSelectedConcerns] = React.useState<string[]>([]);
  const [maxPrice, setMaxPrice] = React.useState<number>(initialMaxPrice);
  const [minRating, setMinRating] = React.useState<string>("");
  const [availability, setAvailability] = React.useState<string>("");
  const [crueltyFreeOnly, setCrueltyFreeOnly] = React.useState(false);
  const [veganOnly, setVeganOnly] = React.useState(false);
  const [fragranceFreeOnly, setFragranceFreeOnly] = React.useState(false);
  const [parabenFreeOnly, setParabenFreeOnly] = React.useState(false);
  const [sortBy, setSortBy] = React.useState<any>("relevance");
  const [page, setPage] = React.useState(1);

  const [showMobileFilters, setShowMobileFilters] = React.useState(false);
  const [dataResult, setDataResult] = React.useState<PaginatedProductsResult | null>(null);
  const [loading, setLoading] = React.useState(true);
  const brandOptions = React.useMemo(
    () => [
      { value: "", label: "All Brands" },
      ...(dataResult?.facets?.brands || []).map((brand) => ({ value: brand, label: brand })),
    ],
    [dataResult?.facets?.brands]
  );

  const fetchProducts = React.useCallback(() => {
    setLoading(true);
    ProductService.getProducts({
      query: searchQuery,
      category: (selectedCategory as RoutineStep) || undefined,
      brand: selectedBrand || undefined,
      skinType: selectedSkinTypes[0] as SkinType | undefined,
      skinConcern: selectedConcerns[0] as DetailedSkinConcern | undefined,
      maxPrice: maxPrice < 3000 ? maxPrice : undefined,
      minRating: minRating ? parseFloat(minRating) : undefined,
      availability: (availability as AvailabilityStatus) || undefined,
      crueltyFreeOnly,
      veganOnly,
      fragranceFreeOnly,
      parabenFreeOnly,
      sortBy,
      page,
      pageSize: 9,
    }).then((res) => {
      if (res.data) setDataResult(res.data);
      setLoading(false);
    });
  }, [
    searchQuery,
    selectedCategory,
    selectedBrand,
    selectedSkinTypes,
    selectedConcerns,
    maxPrice,
    minRating,
    availability,
    crueltyFreeOnly,
    veganOnly,
    fragranceFreeOnly,
    parabenFreeOnly,
    sortBy,
    page,
  ]);

  React.useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedBrand("");
    setSelectedSkinTypes([]);
    setSelectedConcerns([]);
    setMaxPrice(3000);
    setMinRating("");
    setAvailability("");
    setCrueltyFreeOnly(false);
    setVeganOnly(false);
    setFragranceFreeOnly(false);
    setParabenFreeOnly(false);
    setSortBy("relevance");
    setPage(1);
  };

  const hasActiveFilters =
    Boolean(searchQuery) ||
    Boolean(selectedCategory) ||
    Boolean(selectedBrand) ||
    selectedSkinTypes.length > 0 ||
    selectedConcerns.length > 0 ||
    maxPrice < 3000 ||
    Boolean(minRating) ||
    Boolean(availability) ||
    crueltyFreeOnly ||
    veganOnly ||
    fragranceFreeOnly ||
    parabenFreeOnly;

  const toggleSkinType = (type: string) => {
    setPage(1);
    setSelectedSkinTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [type]));
  };

  const toggleConcern = (concern: string) => {
    setPage(1);
    setSelectedConcerns((prev) => (prev.includes(concern) ? prev.filter((c) => c !== concern) : [concern]));
  };

  return (
    <Container className="py-3 md:py-4 space-y-5">
      <div className="flex justify-end lg:hidden">
        <Button
          variant="outline"
          leftIcon={<Filter className="h-4 w-4" />}
          onClick={() => setShowMobileFilters(true)}
        >
          Filters &amp; Refine
        </Button>
      </div>

      {/* Main Layout: Sidebar Filters + Products Catalog */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 xl:gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6 rounded-2xl border border-line bg-background-card p-5 shadow-subtle sticky top-24">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <h3 className="font-display text-base font-semibold text-foreground flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-sage-deep" /> Filters
            </h3>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-foreground-faint hover:text-sage-deep flex items-center gap-1 font-medium"
              >
                <RotateCcw className="h-3 w-3" /> Reset All
              </button>
            )}
          </div>

          {/* Grouped Autocomplete Search */}
          <GroupedSearchInput
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              setPage(1);
            }}
          />

          {/* Category Dropdown */}
          <Select
            label="Category"
            options={categoryOptions}
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
          />

          {/* Brand Dropdown */}
          <Select
            label="Brand"
            options={brandOptions}
            value={selectedBrand}
            onChange={(e) => {
              setSelectedBrand(e.target.value);
              setPage(1);
            }}
          />

          {/* Skin Type Filter Pills */}
          <div className="space-y-2">
            <span className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted">
              Skin Type
            </span>
            <Pills
              options={skinTypePills}
              selectedIds={selectedSkinTypes}
              onToggle={toggleSkinType}
              size="sm"
            />
          </div>

          {/* Target Concern Filter Pills */}
          <div className="space-y-2">
            <span className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted">
              Skin Concern
            </span>
            <Pills
              options={concernPills}
              selectedIds={selectedConcerns}
              onToggle={toggleConcern}
              size="sm"
            />
          </div>

          {/* Maximum Price Slider */}
          <Slider
            label="Max Price Cap"
            min={200}
            max={3000}
            step={50}
            value={maxPrice}
            onChange={(val) => {
              setMaxPrice(val);
              setPage(1);
            }}
            formatValue={(v) => (v >= 3000 ? "Any Price" : `₹${v}`)}
          />

          {/* Rating & Availability */}
          <div className="grid grid-cols-2 gap-2">
            <Select
              label="Rating"
              options={ratingOptions}
              value={minRating}
              onChange={(e) => {
                setMinRating(e.target.value);
                setPage(1);
              }}
            />
            <Select
              label="Stock"
              options={availabilityOptions}
              value={availability}
              onChange={(e) => {
                setAvailability(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Preference Toggles */}
          <div className="space-y-3 pt-3 border-t border-line">
            <Switch
              checked={crueltyFreeOnly}
              onChange={(val) => {
                setCrueltyFreeOnly(val);
                setPage(1);
              }}
              label="Cruelty-Free Only"
            />
            <Switch
              checked={veganOnly}
              onChange={(val) => {
                setVeganOnly(val);
                setPage(1);
              }}
              label="100% Vegan Only"
            />
            <Switch
              checked={fragranceFreeOnly}
              onChange={(val) => {
                setFragranceFreeOnly(val);
                setPage(1);
              }}
              label="Fragrance-Free Only"
            />
            <Switch
              checked={parabenFreeOnly}
              onChange={(val) => {
                setParabenFreeOnly(val);
                setPage(1);
              }}
              label="Paraben-Free Only"
            />
          </div>
        </aside>

        {/* Mobile Filter Drawer Modal */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 flex bg-background/80 backdrop-blur-xs lg:hidden">
            <div className="relative ml-auto w-full max-w-xs bg-background-card p-6 shadow-2xl overflow-y-auto space-y-6">
              <div className="flex items-center justify-between border-b border-line pb-4">
                <h3 className="font-display text-lg font-bold text-foreground">Filter Catalog</h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-1 text-foreground-muted hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <GroupedSearchInput
                value={searchQuery}
                onChange={(val) => setSearchQuery(val)}
              />
              <Select
                label="Category"
                options={categoryOptions}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              />
              <Select
                label="Brand"
                options={brandOptions}
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
              />
              <Pills
                options={skinTypePills}
                selectedIds={selectedSkinTypes}
                onToggle={toggleSkinType}
                size="sm"
              />
              <Pills
                options={concernPills}
                selectedIds={selectedConcerns}
                onToggle={toggleConcern}
                size="sm"
              />
              <Slider
                label="Max Price"
                min={200}
                max={3000}
                step={50}
                value={maxPrice}
                onChange={setMaxPrice}
                formatValue={(v) => (v >= 3000 ? "Any Price" : `₹${v}`)}
              />

              <div className="flex gap-3 pt-4 border-t border-line">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleResetFilters}
                >
                  Reset
                </Button>
                <Button
                  variant="accent"
                  className="w-full"
                  onClick={() => setShowMobileFilters(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Products Results Area */}
        <div className="space-y-6">
          {/* Active Filters Bar */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 rounded border border-line bg-background-elevated/40 px-4 py-2.5 text-xs">
              <span className="font-semibold text-foreground-faint">Active Filters:</span>
              {selectedCategory && (
                <Badge variant="sage" className="gap-1">
                  Category: {selectedCategory}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory("")} />
                </Badge>
              )}
              {selectedBrand && (
                <Badge variant="sage" className="gap-1">
                  Brand: {selectedBrand}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedBrand("")} />
                </Badge>
              )}
              {selectedSkinTypes.map((st) => (
                <Badge key={st} variant="clay" className="gap-1">
                  Skin: {st}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => toggleSkinType(st)} />
                </Badge>
              ))}
              {selectedConcerns.map((sc) => (
                <Badge key={sc} variant="clay" className="gap-1">
                  Concern: {sc}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => toggleConcern(sc)} />
                </Badge>
              ))}
              {maxPrice < 3000 && (
                <Badge variant="default" className="gap-1">
                  Max: ₹{maxPrice}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setMaxPrice(3000)} />
                </Badge>
              )}

              <button
                onClick={handleResetFilters}
                className="ml-auto text-xs font-semibold text-sage-deep hover:underline"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Top Bar: Result Count & Sorting */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-line bg-background-card px-5 py-3.5 shadow-subtle">
            <span className="text-sm font-medium text-foreground-muted">
              Showing{" "}
              <strong className="text-foreground">
                {dataResult?.products.length ?? 0}
              </strong>{" "}
              of <strong className="text-foreground">{dataResult?.total ?? 0}</strong> products
            </span>

            <div className="w-full sm:w-64">
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

          {/* Grid Content / Loading Skeletons / Empty State */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 xl:gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-88 rounded border border-line bg-background-card animate-pulse p-4 space-y-4">
                  <div className="h-44 bg-background-elevated rounded" />
                  <div className="h-4 w-3/4 bg-background-elevated rounded" />
                  <div className="h-3 w-1/2 bg-background-elevated rounded" />
                </div>
              ))}
            </div>
          ) : !dataResult || dataResult.products.length === 0 ? (
            <EmptyState
              title="No Products Found"
              description="We couldn't find any products matching your specific filters or search keywords."
              actionLabel="Reset All Filters"
              onAction={handleResetFilters}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {dataResult.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
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

                {Array.from({ length: dataResult.totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={`h-8 w-8 rounded text-xs font-semibold transition-colors ${
                      pg === dataResult.page
                        ? "bg-sage-deep text-white"
                        : "border border-line bg-background-card text-foreground-muted hover:border-line-strong"
                    }`}
                  >
                    {pg}
                  </button>
                ))}

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
      </div>
    </Container>
  );
}

export default function ProductsCatalogPage() {
  return (
    <React.Suspense
      fallback={
        <Container className="py-16 text-center">
          <div className="h-96 w-full rounded border border-line bg-background-card animate-pulse" />
        </Container>
      }
    >
      <ProductsCatalogContent />
    </React.Suspense>
  );
}
