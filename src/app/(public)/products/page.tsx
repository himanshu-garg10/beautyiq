"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { ProductService, type PaginatedProductsResult } from "@/services/product.service";
import type { AvailabilityStatus } from "@/types";
import { Container } from "@/components/layout/container";
import { ProductCard } from "@/components/product/product-card";
import { GroupedSearchInput } from "@/components/product/grouped-search-input";
import { Select } from "@/components/ui/select";
import { RangeSlider } from "@/components/ui/range-slider";
import { Switch } from "@/components/ui/switch";
import { MultiSelect } from "@/components/ui/multi-select";
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

const concernOptions = [
  { value: "Dullness", label: "Glow & dullness" },
  { value: "Acne", label: "Acne & active breakouts" },
  { value: "Whiteheads", label: "Whiteheads & clogged pores" },
  { value: "Blackheads", label: "Blackheads & open pores" },
  { value: "Dryness", label: "Dryness & barrier" },
  { value: "Itching", label: "Itching & sensitivity" },
  { value: "Hyperpigmentation", label: "Uneven tone & dark spots" },
  { value: "Oiliness", label: "Oiliness & shine" },
  { value: "Texture", label: "Texture & roughness" },
  { value: "Fine lines", label: "Fine lines" },
  { value: "Tanning", label: "Tanning care" },
  { value: "Dark circles", label: "Dark circles" },
  { value: "Sun protection", label: "Sun protection" },
  { value: "Pigmentation", label: "Pigmentation" },
  { value: "Redness", label: "Redness & irritation" },
  { value: "Dehydration", label: "Dehydration" },
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
  const initialConcern = searchParams?.get("concern") || "";
  const initialMinPrice = searchParams?.get("minPrice") ? parseInt(searchParams.get("minPrice")!, 10) : 0;
  const initialMaxPrice = searchParams?.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!, 10) : 3000;
  const initialPage = searchParams?.get("page") ? Math.max(1, parseInt(searchParams.get("page")!, 10) || 1) : 1;

  const [searchQuery, setSearchQuery] = React.useState(initialQuery);
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>(initialCategory ? initialCategory.split(",").filter(Boolean) : []);
  const [selectedBrands, setSelectedBrands] = React.useState<string[]>(initialBrand ? initialBrand.split(",").filter(Boolean) : []);
  const [selectedSkinTypes, setSelectedSkinTypes] = React.useState<string[]>(initialSkinType ? initialSkinType.split(",").filter(Boolean) : []);
  const [selectedConcerns, setSelectedConcerns] = React.useState<string[]>(initialConcern ? initialConcern.split(",").filter(Boolean) : []);
  const [minPrice, setMinPrice] = React.useState<number>(initialMinPrice);
  const [maxPrice, setMaxPrice] = React.useState<number>(initialMaxPrice);
  const [minRating, setMinRating] = React.useState<string>("");
  const [availability, setAvailability] = React.useState<string>("");
  const [crueltyFreeOnly, setCrueltyFreeOnly] = React.useState(false);
  const [veganOnly, setVeganOnly] = React.useState(false);
  const [fragranceFreeOnly, setFragranceFreeOnly] = React.useState(false);
  const [parabenFreeOnly, setParabenFreeOnly] = React.useState(false);
  const [sortBy, setSortBy] = React.useState<any>("relevance");
  const [page, setPage] = React.useState(initialPage);

  const [showMobileFilters, setShowMobileFilters] = React.useState(false);
  const [dataResult, setDataResult] = React.useState<PaginatedProductsResult | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [knownBrands, setKnownBrands] = React.useState<string[]>([]);
  const brandOptions = React.useMemo(
    () => Array.from(new Set([...knownBrands, ...selectedBrands])).sort((a, b) => a.localeCompare(b)).map((brand) => ({ value: brand, label: brand })),
    [knownBrands, selectedBrands]
  );

  const fetchProducts = React.useCallback(() => {
    setLoading(true);
    ProductService.getProducts({
      query: searchQuery,
      categories: selectedCategories,
      brands: selectedBrands,
      skinTypes: selectedSkinTypes,
      skinConcerns: selectedConcerns,
      minPrice: minPrice > 0 ? minPrice : undefined,
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
      if (res.data) {
        setDataResult(res.data);
        setKnownBrands((current) => Array.from(new Set([...current, ...(res.data?.facets?.brands || [])])).sort((a, b) => a.localeCompare(b)));
      }
      setLoading(false);
    });
  }, [
    searchQuery,
    selectedCategories,
    selectedBrands,
    selectedSkinTypes,
    selectedConcerns,
    minPrice,
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
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedSkinTypes([]);
    setSelectedConcerns([]);
    setMinPrice(0);
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
    selectedCategories.length > 0 ||
    selectedBrands.length > 0 ||
    selectedSkinTypes.length > 0 ||
    selectedConcerns.length > 0 ||
    minPrice > 0 ||
    maxPrice < 3000 ||
    Boolean(minRating) ||
    Boolean(availability) ||
    crueltyFreeOnly ||
    veganOnly ||
    fragranceFreeOnly ||
    parabenFreeOnly;

  const toggleSkinType = (type: string) => {
    setPage(1);
    setSelectedSkinTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  };

  const toggleConcern = (concern: string) => {
    setPage(1);
    setSelectedConcerns((prev) => (prev.includes(concern) ? prev.filter((c) => c !== concern) : [...prev, concern]));
  };

  // Keep the catalog state in the URL: browser Back from a product returns to the same page and filters.
  const catalogReturnTo = React.useMemo(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (selectedCategories.length) params.set("category", selectedCategories.join(","));
    if (selectedBrands.length) params.set("brand", selectedBrands.join(","));
    if (selectedSkinTypes.length) params.set("skinType", selectedSkinTypes.join(","));
    if (selectedConcerns.length) params.set("concern", selectedConcerns.join(","));
    if (minPrice) params.set("minPrice", String(minPrice));
    if (maxPrice < 3000) params.set("maxPrice", String(maxPrice));
    if (minRating) params.set("minRating", minRating);
    if (availability) params.set("availability", availability);
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    return query ? `/products?${query}` : "/products";
  }, [availability, maxPrice, minPrice, minRating, page, searchQuery, selectedBrands, selectedCategories, selectedConcerns, selectedSkinTypes]);

  React.useEffect(() => {
    window.history.replaceState(null, "", catalogReturnTo);
  }, [catalogReturnTo]);

  return (
    <Container className="max-w-[1500px] px-3 sm:px-5 lg:px-6 py-3 md:py-4 space-y-5">
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
      <div className="grid grid-cols-1 lg:grid-cols-[330px_minmax(0,1fr)] gap-8 xl:gap-10 items-start">
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

          {/* Skin type intentionally comes first: users can choose more than one. */}
          <MultiSelect
            label="Skin Type"
            options={skinTypePills.map(({ id, label }) => ({ value: id, label }))}
            value={selectedSkinTypes}
            onChange={(value) => {
              setSelectedSkinTypes(value);
              setPage(1);
            }}
          />

          <MultiSelect
            label="Category"
            options={categoryOptions.filter((option) => option.value)}
            value={selectedCategories}
            onChange={(value) => {
              setSelectedCategories(value);
              setPage(1);
            }}
          />

          <MultiSelect label="Brands" options={brandOptions} value={selectedBrands} onChange={(value) => { setSelectedBrands(value); setPage(1); }} placeholder="Select brands" />

          <MultiSelect
            label="Skin Concerns"
            options={concernOptions}
            value={selectedConcerns}
            onChange={(value) => { setSelectedConcerns(value); setPage(1); }}
            placeholder="Select concerns"
          />

          <RangeSlider label="Price range" min={0} max={3000} step={50} value={[minPrice, maxPrice]} onChange={([minimum, maximum]) => { setMinPrice(minimum); setMaxPrice(maximum); setPage(1); }} formatValue={(value) => value >= 3000 ? "Any price" : `₹${value}`} />

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
              <MultiSelect label="Skin Type" options={skinTypePills.map(({ id, label }) => ({ value: id, label }))} value={selectedSkinTypes} onChange={setSelectedSkinTypes} />
              <MultiSelect label="Category" options={categoryOptions.filter((option) => option.value)} value={selectedCategories} onChange={setSelectedCategories} />
              <MultiSelect label="Brands" options={brandOptions} value={selectedBrands} onChange={setSelectedBrands} />
              <MultiSelect label="Skin Concerns" options={concernOptions} value={selectedConcerns} onChange={setSelectedConcerns} />
              <RangeSlider label="Price range" min={0} max={3000} step={50} value={[minPrice, maxPrice]} onChange={([minimum, maximum]) => { setMinPrice(minimum); setMaxPrice(maximum); }} formatValue={(value) => value >= 3000 ? "Any" : `₹${value}`} />

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
              {selectedCategories.map((category) => <Badge key={category} variant="sage" className="gap-1">Category: {category}<X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategories((current) => current.filter((item) => item !== category))} /></Badge>)}
              {selectedBrands.map((brand) => <Badge key={brand} variant="sage" className="gap-1">Brand: {brand}<X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedBrands((current) => current.filter((item) => item !== brand))} /></Badge>)}
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
              {minPrice > 0 && <Badge variant="default" className="gap-1">Min: ₹{minPrice}<X className="h-3 w-3 cursor-pointer" onClick={() => setMinPrice(0)} /></Badge>}
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
                <ProductCard key={product.id} product={product} returnTo={catalogReturnTo} />
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
