"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ProductService, type PaginatedProductsResult } from "@/services/product.service";
import type { Brand, Product } from "@/types";
import { Container } from "@/components/layout/container";
import { ProductCard } from "@/components/product/product-card";
import { GroupedSearchInput } from "@/components/product/grouped-search-input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ArrowLeft, ChevronLeft, ChevronRight, Globe, Sparkles } from "lucide-react";

const sortOptions = [
  { value: "relevance", label: "Relevance" },
  { value: "rating", label: "Highest Rated" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "best-value", label: "Best Value" },
];

export default function BrandDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [brand, setBrand] = React.useState<Brand | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortBy, setSortBy] = React.useState<any>("relevance");
  const [page, setPage] = React.useState(1);

  const [dataResult, setDataResult] = React.useState<PaginatedProductsResult | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (id) {
      ProductService.getBrandById(id).then((res) => {
        if (res.data) setBrand(res.data);
      });
    }
  }, [id]);

  React.useEffect(() => {
    if (brand) {
      setLoading(true);
      ProductService.getProducts({
        brand: brand.name,
        query: searchQuery,
        sortBy,
        page,
        pageSize: 9,
      }).then((res) => {
        if (res.data) setDataResult(res.data);
        setLoading(false);
      });
    }
  }, [brand, searchQuery, sortBy, page]);

  if (!brand && !loading) {
    return (
      <Container className="py-16">
        <EmptyState
          title="Brand Not Found"
          description="The requested brand is not currently indexed in BeautyIQ."
          actionLabel="View All Brands"
          onAction={() => (window.location.href = "/brands")}
        />
      </Container>
    );
  }

  return (
    <Container className="py-10 space-y-8">
      {/* Navigation */}
      <Link
        href="/brands"
        className="inline-flex items-center gap-2 text-xs font-semibold text-foreground-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> All Brands Directory
      </Link>

      {/* Brand Header */}
      <div className="rounded border border-line bg-background-card p-6 shadow-subtle space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="sage">Verified Skincare Brand</Badge>
          {brand?.country && (
            <Badge variant="outline" className="gap-1 font-mono text-xs">
              <Globe className="h-3 w-3 text-sage-deep" /> Origin: {brand.country}
            </Badge>
          )}
        </div>

        <h1 className="font-display text-3xl font-bold text-foreground">
          {brand?.name || "Brand Catalog"}
        </h1>
        <p className="text-sm text-foreground-muted max-w-2xl leading-relaxed">
          {brand?.philosophy}
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
            placeholder={`Search within ${brand?.name || "brand"} catalog...`}
          />
        </div>

        <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
          <span className="text-xs text-foreground-muted font-medium">
            Showing <strong className="text-foreground">{dataResult?.products.length || 0}</strong> of{" "}
            <strong className="text-foreground">{dataResult?.total || 0}</strong> products
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
          title={`No Products Found for ${brand?.name}`}
          description="Try clearing active search terms or searching for a different product line."
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
