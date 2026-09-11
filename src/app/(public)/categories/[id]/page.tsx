"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ProductService, type PaginatedProductsResult } from "@/services/product.service";
import { categories } from "@/lib/mock-data";
import type { Category, Product, SkinType, DetailedSkinConcern } from "@/types";
import { Container } from "@/components/layout/container";
import { ProductCard } from "@/components/product/product-card";
import { GroupedSearchInput } from "@/components/product/grouped-search-input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ArrowLeft, ChevronLeft, ChevronRight, SlidersHorizontal, RotateCcw } from "lucide-react";

const sortOptions = [
  { value: "relevance", label: "Relevance" },
  { value: "rating", label: "Highest Rated" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "best-value", label: "Best Value" },
];

export default function CategoryDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [category, setCategory] = React.useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortBy, setSortBy] = React.useState<any>("relevance");
  const [page, setPage] = React.useState(1);

  const [dataResult, setDataResult] = React.useState<PaginatedProductsResult | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (id) {
      // Find category by ID or slug match
      const catLower = id.toLowerCase().replace(/-/g, " ");
      const foundCat = categories.find(
        (c) => c.id.toLowerCase() === id.toLowerCase() || c.name.toLowerCase() === catLower
      );

      if (foundCat) {
        setCategory(foundCat);
      }
    }
  }, [id]);

  React.useEffect(() => {
    if (category) {
      setLoading(true);
      ProductService.getProducts({
        category: category.name,
        query: searchQuery,
        sortBy,
        page,
        pageSize: 9,
      }).then((res) => {
        if (res.data) setDataResult(res.data);
        setLoading(false);
      });
    }
  }, [category, searchQuery, sortBy, page]);

  if (!category && !loading) {
    return (
      <Container className="py-16">
        <EmptyState
          title="Category Not Found"
          description="The requested skincare category does not exist in our catalog."
          actionLabel="Browse All Categories"
          onAction={() => (window.location.href = "/categories")}
        />
      </Container>
    );
  }

  return (
    <Container className="py-10 space-y-8">
      {/* Navigation */}
      <Link
        href="/categories"
        className="inline-flex items-center gap-2 text-xs font-semibold text-foreground-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> All Categories
      </Link>

      {/* Category Header */}
      <div className="rounded border border-line bg-background-card p-6 shadow-subtle space-y-3">
        <Badge variant="sage">Routine Step Category</Badge>
        <h1 className="font-display text-3xl font-bold text-foreground">
          {category?.name || "Skincare Category"}
        </h1>
        <p className="text-sm text-foreground-muted max-w-2xl">
          Discover dermatologically verified {category?.name.toLowerCase()} formulations tailored for various skin types and concerns.
        </p>
      </div>

      {/* Controls Bar: Search, Sorting & Count */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded border border-line bg-background-card p-4 shadow-subtle">
        <div className="w-full md:w-80">
          <GroupedSearchInput
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              setPage(1);
            }}
            placeholder={`Search within ${category?.name || "category"}...`}
          />
        </div>

        <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
          <span className="text-xs text-foreground-muted font-medium">
            Showing <strong className="text-foreground">{dataResult?.products.length || 0}</strong> of{" "}
            <strong className="text-foreground">{dataResult?.total || 0}</strong> items
          </span>

          <div className="w-48">
            <Select
              options={sortOptions}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-88 rounded border border-line bg-background-card animate-pulse" />
          ))}
        </div>
      ) : !dataResult || dataResult.products.length === 0 ? (
        <EmptyState
          title={`No ${category?.name} Products Found`}
          description="Try broadening your search query or removing active search terms."
          actionLabel="Clear Search"
          onAction={() => setSearchQuery("")}
        />
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
    </Container>
  );
}
