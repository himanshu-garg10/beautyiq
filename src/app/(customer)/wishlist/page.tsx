"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useComparison } from "@/context/comparison-context";
import { useToast } from "@/context/toast-context";
import { WishlistService } from "@/services/wishlist.service";
import type { Product } from "@/types";
import { ProductCard } from "@/components/product/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Scale, Trash2, ArrowLeft, Plus } from "lucide-react";

export default function CustomerWishlistPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addToComparison, selectedIds } = useComparison();
  const { addToast } = useToast();

  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeCategory, setActiveCategory] = React.useState<string>("All");

  const loadWishlist = React.useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const res = await WishlistService.getWishlist(user.id);
    if (res.data) {
      setProducts(res.data);
    }
    setLoading(false);
  }, [user]);

  React.useEffect(() => {
    loadWishlist();
  }, [loadWishlist, user?.wishlistIds]);

  const handleClearWishlist = async () => {
    if (!user) return;
    await WishlistService.clearWishlist(user.id);
    setProducts([]);
    addToast({
      type: "info",
      title: "Wishlist Cleared",
      description: "All products have been removed from your saved list.",
    });
  };

  const handleCompareAll = () => {
    if (products.length < 2) {
      addToast({
        type: "warning",
        title: "Comparison Requires 2+ Products",
        description: "Save at least 2 products in your wishlist to compare them.",
      });
      return;
    }

    const toCompare = products.slice(0, 5);
    toCompare.forEach((p) => addToComparison(p.id));
    addToast({
      type: "success",
      title: "Added to Comparison Matrix",
      description: `Comparing ${toCompare.length} products from your wishlist.`,
    });
    router.push("/compare");
  };

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = activeCategory === "All"
    ? products
    : products.filter((p) => p.category === activeCategory);

  return (
    <div className="space-y-8 max-w-6xl pb-16">
      {/* Header with Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="clay" className="flex items-center gap-1 font-semibold text-xs">
              <Heart className="h-3.5 w-3.5 fill-current" /> Personal Collection
            </Badge>
            <Badge variant="default" className="font-mono text-xs">
              {products.length} {products.length === 1 ? "Product" : "Products"} Saved
            </Badge>
          </div>

          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            My Saved Wishlist
          </h1>
          <p className="text-sm text-foreground-muted mt-1">
            Track live prices, review ingredient safety, and compare your saved skincare products side-by-side.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {products.length >= 2 && (
            <Button
              variant="accent"
              size="sm"
              leftIcon={<Scale className="h-4 w-4" />}
              onClick={handleCompareAll}
            >
              Compare Wishlist ({Math.min(products.length, 5)})
            </Button>
          )}

          {products.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Trash2 className="h-4 w-4" />}
              onClick={handleClearWishlist}
            >
              Clear Wishlist
            </Button>
          )}

          <Link href="/products">
            <Button variant="outline" size="sm" leftIcon={<Plus className="h-4 w-4" />}>
              Add More Products
            </Button>
          </Link>
        </div>
      </div>

      {/* Category filter pills */}
      {categories.length > 2 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full font-semibold transition-colors shrink-0 ${
                activeCategory === cat
                  ? "bg-sage-deep text-white"
                  : "bg-background-card border border-line text-foreground-muted hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Product Grid / Empty State */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-96 rounded-lg border border-line bg-background-card animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          title="Your Wishlist is Empty"
          description="Click the bookmark heart icon on any product card while browsing to save products, monitor price changes, and run side-by-side comparisons."
          icon={<Heart className="h-8 w-8 text-rose-500 fill-rose-500/20" />}
          actionLabel="Browse Products Catalog"
          onAction={() => router.push("/products")}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((p) => (
            <div key={p.id} className="relative group">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
