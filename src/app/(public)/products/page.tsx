"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { cn } from "@/lib/utils";
import { SearchComparisonWidget } from "@/components/search/search-comparison-widget";
import { products as allCatalogProducts } from "@/data/products";
import {
  SlidersHorizontal,
  RotateCcw,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Search,
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
  { value: "Visible pores", label: "Visible pores" },
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

const storeOptions = [
  { value: "", label: "All Stores & Marketplaces" },
  { value: "amazon", label: "Amazon India" },
  { value: "flipkart", label: "Flipkart" },
  { value: "nykaa", label: "Nykaa" },
  { value: "myntra", label: "Myntra" },
  { value: "purplle", label: "Purplle" },
  { value: "tira", label: "Tira Beauty" },
  { value: "minimalist", label: "BeMinimalist Direct" },
  { value: "dot-and-key", label: "Dot & Key Direct" },
  { value: "brand", label: "Brand Official Stores" },
];

const MARKETPLACE_PILLS = [
  { id: "", label: "All Stores", icon: "✨" },
  { id: "amazon", label: "Amazon India", icon: "📦" },
  { id: "flipkart", label: "Flipkart", icon: "⚡" },
  { id: "nykaa", label: "Nykaa", icon: "💄" },
  { id: "myntra", label: "Myntra", icon: "👗" },
  { id: "purplle", label: "Purplle", icon: "💜" },
  { id: "tira", label: "Tira Beauty", icon: "💎" },
  { id: "minimalist", label: "Minimalist Direct", icon: "🌿" },
  { id: "dot-and-key", label: "Dot & Key Direct", icon: "🌸" },
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
  const router = useRouter();
  const initialCategory = searchParams?.get("category") || "";
  const initialBrand = searchParams?.get("brand") || "";
  const initialStore = searchParams?.get("store") || "";
  const initialQuery = searchParams?.get("q") || "";
  const initialSkinType = searchParams?.get("skinType") || "";
  const initialConcern = searchParams?.get("concern") || "";
  const initialMinPrice = searchParams?.get("minPrice") ? parseInt(searchParams.get("minPrice")!, 10) : 0;
  const initialMaxPrice = searchParams?.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!, 10) : 3000;
  const initialPage = searchParams?.get("page") ? Math.max(1, parseInt(searchParams.get("page")!, 10) || 1) : 1;

  const [searchQuery, setSearchQuery] = React.useState(initialQuery);
  const [searchInputText, setSearchInputText] = React.useState(initialQuery);

  React.useEffect(() => {
    setSearchInputText(searchQuery);
  }, [searchQuery]);

  const handleTopSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchQuery(searchInputText.trim());
    setPage(1);
  };
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>(initialCategory ? initialCategory.split(",").filter(Boolean) : []);
  const [selectedBrands, setSelectedBrands] = React.useState<string[]>(initialBrand ? initialBrand.split(",").filter(Boolean) : []);
  const [selectedStore, setSelectedStore] = React.useState(initialStore);
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
  const [catalogError, setCatalogError] = React.useState<string | null>(null);
  const [knownBrands, setKnownBrands] = React.useState<string[]>([]);
  const brandOptions = React.useMemo(
    () => Array.from(new Set([...knownBrands, ...selectedBrands])).sort((a, b) => a.localeCompare(b)).map((brand) => ({ value: brand, label: brand })),
    [knownBrands, selectedBrands]
  );

  const fetchProducts = React.useCallback(() => {
    setLoading(true);
    setCatalogError(null);
    ProductService.getProducts({
      query: searchQuery,
      categories: selectedCategories,
      brands: selectedBrands,
      store: selectedStore || undefined,
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
      } else {
        setCatalogError("The catalog could not be loaded right now. Please retry in a moment.");
      }
    }).catch(() => {
      setCatalogError("The catalog could not be loaded right now. Please retry in a moment.");
    }).finally(() => setLoading(false));
  }, [
    searchQuery,
    selectedCategories,
    selectedBrands,
    selectedStore,
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
    setSearchInputText("");
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedStore("");
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
    Boolean(selectedStore) ||
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
    if (selectedStore) params.set("store", selectedStore);
    if (selectedSkinTypes.length) params.set("skinType", selectedSkinTypes.join(","));
    if (selectedConcerns.length) params.set("concern", selectedConcerns.join(","));
    if (minPrice) params.set("minPrice", String(minPrice));
    if (maxPrice < 3000) params.set("maxPrice", String(maxPrice));
    if (minRating) params.set("minRating", minRating);
    if (availability) params.set("availability", availability);
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    return query ? `/products?${query}` : "/products";
  }, [availability, maxPrice, minPrice, minRating, page, searchQuery, selectedBrands, selectedCategories, selectedConcerns, selectedSkinTypes, selectedStore]);

  React.useEffect(() => {
    // Do not call window.history.replaceState directly: Next stores its router tree there.
    // router.replace preserves that tree, so browser navigation remains stable after filtering.
    router.replace(catalogReturnTo, { scroll: false });
  }, [catalogReturnTo, router]);

  return (
    <Container className="max-w-[1500px] px-3 sm:px-5 lg:px-6 py-3 md:py-4 space-y-5">
      {/* Multi-Store Comparison Ticker / Banner */}
      <div className="rounded-xl border border-line bg-background-elevated/40 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sage-tint text-sage-deep font-bold text-xs">
            ⚡
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">
              Multi-Retailer Price Comparison Active
            </p>
            <p className="text-[0.7rem] text-foreground-muted truncate">
              Comparing offers live across Amazon, Flipkart, Myntra, Nykaa, Purplle, Tira, &amp; Brand Direct Stores (Minimalist, Dot &amp; Key).
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap shrink-0">
          <span className="text-[0.65rem] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/20">
            Amazon
          </span>
          <span className="text-[0.65rem] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold border border-blue-500/20">
            Flipkart
          </span>
          <span className="text-[0.65rem] px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 font-semibold border border-pink-500/20">
            Myntra
          </span>
          <span className="text-[0.65rem] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold border border-rose-500/20">
            Nykaa
          </span>
          <span className="text-[0.65rem] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold border border-purple-500/20">
            Purplle
          </span>
          <span className="text-[0.65rem] px-2 py-0.5 rounded-full bg-stone-500/10 text-stone-700 dark:text-stone-300 font-semibold border border-stone-500/20">
            Tira
          </span>
          <span className="text-[0.65rem] px-2 py-0.5 rounded-full bg-sage-tint text-sage-deep font-semibold border border-sage-deep/30">
            Brand Stores
          </span>
        </div>
      </div>

      {/* Prominent Multi-Store Search & Compare Bar with Search Button */}
      <div className="rounded-2xl border border-sage-deep/30 bg-background-card p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <Search className="h-4 w-4 text-sage-deep" />
              <span>Search Products &amp; Compare Live Store Prices</span>
            </h2>
            <p className="text-xs text-foreground-muted">
              Enter any product, brand, or active ingredient. We fetch real-time offers across Amazon, Flipkart, Nykaa, Myntra, Purplle, Tira &amp; Direct Stores with direct buying links.
            </p>
          </div>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchInputText("");
                setSearchQuery("");
                setPage(1);
              }}
              className="text-xs text-sage-deep font-semibold hover:underline flex items-center gap-1 self-start sm:self-auto shrink-0"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Clear Search</span>
            </button>
          )}
        </div>

        <form onSubmit={handleTopSearchSubmit} className="flex flex-col sm:flex-row items-stretch gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchInputText}
              onChange={(e) => setSearchInputText(e.target.value)}
              placeholder="Search product, brand, or active (e.g. Minimalist Salicylic Acid, Dot & Key, CeraVe, Vitamin C)..."
              className="w-full rounded-xl border border-line bg-background-elevated/70 px-4 py-2.5 pl-10 text-sm text-foreground placeholder:text-foreground-faint focus:border-sage-deep focus:bg-background focus:outline-none focus:ring-2 focus:ring-sage-deep/20 transition-all font-medium"
            />
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-foreground-faint" />
            {searchInputText && (
              <button
                type="button"
                onClick={() => {
                  setSearchInputText("");
                  setSearchQuery("");
                  setPage(1);
                }}
                className="absolute right-3.5 top-3 text-foreground-faint hover:text-foreground p-0.5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Button
            type="submit"
            variant="accent"
            className="rounded-xl px-5 font-bold shadow-xs flex items-center justify-center gap-2 shrink-0 bg-sage-deep text-white hover:bg-sage-deep/90 h-[42px]"
          >
            <Search className="h-4 w-4" />
            <span>Search &amp; Compare</span>
          </Button>
        </form>

        {/* Quick Search Tag Suggestions */}
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5 text-xs text-foreground-muted">
          <span className="text-[0.68rem] font-semibold uppercase tracking-wider text-foreground-faint">
            Popular:
          </span>
          {[
            "Minimalist 10% Niacinamide",
            "Salicylic Acid Face Wash",
            "Dot & Key Watermelon",
            "CeraVe Cleanser",
            "The Ordinary Niacinamide",
            "SPF 50 Sunscreen",
            "Vitamin C Serum",
            "Neutrogena Hydro Boost",
          ].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                setSearchInputText(tag);
                setSearchQuery(tag);
                setPage(1);
              }}
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-[0.7rem] font-medium transition-all",
                searchQuery.toLowerCase() === tag.toLowerCase()
                  ? "bg-sage-deep text-white border-sage-deep font-semibold"
                  : "bg-background-elevated hover:bg-sage-tint hover:text-sage-deep text-foreground-muted border-line"
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

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

          {/* Store / Marketplace Filter */}
          <Select
            label="Marketplace / Store"
            options={storeOptions}
            value={selectedStore}
            onChange={(e) => {
              setSelectedStore(e.target.value);
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
              <Select
                label="Marketplace / Store"
                options={storeOptions}
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
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
          {catalogError ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-status-error/30 bg-status-error-bg/20 px-4 py-3 text-sm text-status-error">
              <span>{catalogError}</span>
              <Button size="sm" variant="outline" onClick={fetchProducts}>Try again</Button>
            </div>
          ) : null}
          {/* Active Filters Bar */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 rounded border border-line bg-background-elevated/40 px-4 py-2.5 text-xs">
              <span className="font-semibold text-foreground-faint">Active Filters:</span>
              {selectedStore && (
                <Badge variant="sage" className="gap-1 font-semibold">
                  Store: {storeOptions.find((s) => s.value === selectedStore)?.label || selectedStore}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedStore("")} />
                </Badge>
              )}
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

          {/* Quick Marketplace / Multi-Store Filter Strip */}
          <div className="rounded-xl border border-line bg-background-card p-3 sm:p-4 space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span className="flex items-center gap-1.5">
                <span>🛒 Filter or Compare by Marketplace:</span>
                {selectedStore ? (
                  <span className="text-[0.72rem] text-sage-deep font-bold">
                    Showing offers on {storeOptions.find((s) => s.value === selectedStore)?.label}
                  </span>
                ) : (
                  <span className="text-[0.72rem] text-foreground-faint font-normal">
                    (Showing lowest price across all verified stores)
                  </span>
                )}
              </span>
              {selectedStore ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStore("");
                    setPage(1);
                  }}
                  className="text-[0.72rem] text-sage-deep font-semibold hover:underline"
                >
                  Reset to All Stores
                </button>
              ) : null}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {MARKETPLACE_PILLS.map((p) => {
                const isSelected = selectedStore === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedStore(p.id);
                      setPage(1);
                    }}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border shrink-0",
                      isSelected
                        ? "bg-sage-deep text-white border-sage-deep shadow-xs ring-2 ring-sage-deep/20"
                        : "bg-background-elevated hover:bg-background-card text-foreground-muted hover:text-foreground border-line"
                    )}
                  >
                    <span>{p.icon}</span>
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Search & Similar Products Cross-Website Comparison Matrix */}
          {searchQuery.trim().length > 0 && (
            <SearchComparisonWidget
              searchQuery={searchQuery}
              allProducts={allCatalogProducts}
            />
          )}

          {/* Direct Live Retailer Search Panel */}
          {searchQuery.trim().length > 0 && (
            <div className="rounded-xl border border-sage-deep/30 bg-sage-tint/25 p-4 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5 text-sage-deep" />
                  Search &quot;{searchQuery}&quot; Live on Top Retailers:
                </span>
                <span className="text-[0.68rem] text-foreground-faint">
                  Opens live search results directly on merchant stores
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href={`https://www.amazon.in/s?k=${encodeURIComponent(searchQuery)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
                >
                  Amazon India ↗
                </a>
                <a
                  href={`https://www.flipkart.com/search?q=${encodeURIComponent(searchQuery)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-blue-300 dark:border-blue-700 bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-400 hover:bg-blue-500/20 transition-colors"
                >
                  Flipkart ↗
                </a>
                <a
                  href={`https://www.myntra.com/${encodeURIComponent(searchQuery.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-pink-300 dark:border-pink-700 bg-pink-500/10 px-2.5 py-1 text-xs font-semibold text-pink-700 dark:text-pink-400 hover:bg-pink-500/20 transition-colors"
                >
                  Myntra ↗
                </a>
                <a
                  href={`https://www.nykaa.com/search/result/?q=${encodeURIComponent(searchQuery)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-rose-300 dark:border-rose-700 bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-500/20 transition-colors"
                >
                  Nykaa ↗
                </a>
                <a
                  href={`https://www.purplle.com/search?q=${encodeURIComponent(searchQuery)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-purple-300 dark:border-purple-700 bg-purple-500/10 px-2.5 py-1 text-xs font-semibold text-purple-700 dark:text-purple-400 hover:bg-purple-500/20 transition-colors"
                >
                  Purplle ↗
                </a>
                <a
                  href={`https://www.tirabeauty.com/search?q=${encodeURIComponent(searchQuery)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-500/10 px-2.5 py-1 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-500/20 transition-colors"
                >
                  Tira Beauty ↗
                </a>
                <a
                  href={`https://beminimalist.co/search?q=${encodeURIComponent(searchQuery)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-line bg-background-card px-2.5 py-1 text-xs font-semibold text-foreground-muted hover:text-foreground transition-colors"
                >
                  Minimalist Store ↗
                </a>
                <a
                  href={`https://www.dotandkey.com/search?q=${encodeURIComponent(searchQuery)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-line bg-background-card px-2.5 py-1 text-xs font-semibold text-foreground-muted hover:text-foreground transition-colors"
                >
                  Dot &amp; Key Store ↗
                </a>
              </div>
            </div>
          )}

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
                <ProductCard
                  key={product.id}
                  product={product}
                  returnTo={catalogReturnTo}
                  selectedStore={selectedStore}
                />
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
