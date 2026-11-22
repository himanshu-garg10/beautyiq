"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, X, Sparkles, Tag, Layers, Bookmark, CheckCircle, History, Scale } from "lucide-react";
import { ProductService, type GroupedSearchSuggestions } from "@/services/product.service";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const RECENT_SEARCHES_KEY = "beautyiq_recent_searches";

interface GroupedSearchInputProps {
  value: string;
  onChange: (val: string) => void;
  onSelectSuggestion?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function GroupedSearchInput({
  value,
  onChange,
  onSelectSuggestion,
  placeholder = "Search by product, brand, active ingredient, skin concern...",
  className = "",
}: GroupedSearchInputProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<GroupedSearchSuggestions>({
    products: [],
    brands: [],
    ingredients: [],
    categories: [],
    concerns: [],
  });
  const [recentSearches, setRecentSearches] = React.useState<string[]>([]);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  // Fetch suggestions on debounced search input
  React.useEffect(() => {
    if (!value.trim()) {
      setSuggestions({ products: [], brands: [], ingredients: [], categories: [], concerns: [] });
      return;
    }

    const timer = setTimeout(() => {
      ProductService.getGroupedSearchSuggestions(value).then((res) => {
        if (res.data) setSuggestions(res.data);
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [value]);

  // Click outside listener to close suggestions modal
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const saveRecentSearch = (queryStr: string) => {
    if (!queryStr.trim()) return;
    try {
      const updated = [queryStr, ...recentSearches.filter((s) => s !== queryStr)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleSelect = (text: string, path?: string) => {
    saveRecentSearch(text);
    onChange(text);
    setIsOpen(false);
    if (onSelectSuggestion) {
      onSelectSuggestion(text);
    }
    if (path) {
      router.push(path);
    }
  };

  const clearRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // ignore
    }
  };

  const hasSuggestions =
    suggestions.products.length > 0 ||
    suggestions.brands.length > 0 ||
    suggestions.ingredients.length > 0 ||
    suggestions.categories.length > 0 ||
    suggestions.concerns.length > 0;

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      <Input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        leftIcon={<Search className="h-4 w-4 text-sage-deep" />}
        rightIcon={
          value ? (
            <button
              onClick={() => {
                onChange("");
                setIsOpen(false);
              }}
              className="text-foreground-faint hover:text-foreground p-1"
            >
              <X className="h-4 w-4" />
            </button>
          ) : undefined
        }
      />

      {/* Autocomplete Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded border border-line bg-background-card p-4 shadow-xl space-y-4 max-h-[420px] overflow-y-auto">
          {/* Recent Searches (when query is empty) */}
          {!value.trim() && recentSearches.length > 0 && (
            <div className="space-y-2 border-b border-line pb-3">
              <div className="flex items-center justify-between text-xs font-semibold text-foreground-faint">
                <span className="flex items-center gap-1">
                  <History className="h-3.5 w-3.5 text-sage-deep" /> Recent Searches
                </span>
                <button
                  onClick={clearRecentSearches}
                  className="text-foreground-faint hover:text-status-error text-[0.7rem]"
                >
                  Clear History
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recentSearches.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSelect(s)}
                    className="px-2.5 py-1 rounded bg-background-elevated hover:bg-sage-tint hover:text-sage-deep text-xs text-foreground-muted transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Grouped Suggestions */}
          {value.trim() && !hasSuggestions && (
            <div className="py-4 text-center text-xs text-foreground-muted">
              No matching suggestions for &quot;<strong>{value}</strong>&quot;. Press enter to search catalog.
            </div>
          )}

          {value.trim() && hasSuggestions && (
            <div className="space-y-3 divide-y divide-line text-xs">
              {/* Products Group */}
              {suggestions.products.length > 0 && (
                <div className="pt-2 first:pt-0">
                  <span className="font-semibold text-foreground-faint block uppercase tracking-wider mb-1.5 text-[0.65rem]">
                    Products
                  </span>
                  <div className="space-y-1">
                    {suggestions.products.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleSelect(p.name, `/products/${p.id}`)}
                        className="w-full text-left px-2 py-1.5 rounded hover:bg-background-elevated flex items-center justify-between gap-2 group transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="font-medium text-foreground group-hover:text-sage-deep block truncate">
                            {p.name}
                          </span>
                          <span className="text-[0.68rem] text-foreground-faint">{p.brand} • {p.category}</span>
                        </div>
                        <div className="shrink-0 text-right">
                          {p.bestPrice ? (
                            <span className="inline-flex items-center gap-1 font-mono text-[0.72rem] font-bold text-sage-deep bg-sage-tint px-2 py-0.5 rounded-full">
                              ₹{p.bestPrice}
                              {p.bestStore && <span className="font-sans font-normal opacity-75">({p.bestStore})</span>}
                            </span>
                          ) : (
                            <span className="text-[0.7rem] text-foreground-faint">{p.brand}</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Brands Group */}
              {suggestions.brands.length > 0 && (
                <div className="pt-2">
                  <span className="font-semibold text-foreground-faint block uppercase tracking-wider mb-1.5 text-[0.65rem]">
                    Brands
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestions.brands.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => handleSelect(b.name, `/brands/${b.id}`)}
                        className="px-2.5 py-1 rounded bg-background-elevated hover:bg-sage-tint hover:text-sage-deep font-semibold text-foreground-muted transition-colors"
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Ingredients Group */}
              {suggestions.ingredients.length > 0 && (
                <div className="pt-2">
                  <span className="font-semibold text-foreground-faint block uppercase tracking-wider mb-1.5 text-[0.65rem]">
                    Active Ingredients
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestions.ingredients.map((ing) => (
                      <button
                        key={ing.id}
                        onClick={() => handleSelect(ing.name, `/ingredients/${ing.id}`)}
                        className="px-2.5 py-1 rounded bg-background-elevated hover:bg-sage-tint hover:text-sage-deep text-foreground-muted transition-colors"
                      >
                        {ing.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories Group */}
              {suggestions.categories.length > 0 && (
                <div className="pt-2">
                  <span className="font-semibold text-foreground-faint block uppercase tracking-wider mb-1.5 text-[0.65rem]">
                    Categories
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestions.categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => handleSelect(c.name, `/categories/${c.id}`)}
                        className="px-2.5 py-1 rounded bg-background-elevated hover:bg-sage-tint hover:text-sage-deep text-foreground-muted transition-colors"
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Skin Concerns Group */}
              {suggestions.concerns.length > 0 && (
                <div className="pt-2">
                  <span className="font-semibold text-foreground-faint block uppercase tracking-wider mb-1.5 text-[0.65rem]">
                    Skin Concerns
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestions.concerns.map((cn) => (
                      <button
                        key={cn}
                        onClick={() => handleSelect(cn)}
                        className="px-2.5 py-1 rounded bg-background-elevated hover:bg-clay-tint hover:text-clay text-foreground-muted transition-colors"
                      >
                        {cn}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Cross-Website Compare Indicator */}
              <div className="pt-2.5 mt-1 border-t border-line/70 flex items-center justify-between text-[0.68rem] text-foreground-faint">
                <span className="flex items-center gap-1.5 font-medium">
                  <Scale className="h-3 w-3 text-sage-deep" />
                  <span>Auto-compares prices across Amazon, Flipkart, Nykaa &amp; Brand Stores</span>
                </span>
                <span className="text-sage-deep font-semibold">Press Enter to Compare</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
