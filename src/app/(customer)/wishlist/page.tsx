"use client";

import * as React from "react";
import { useAuth } from "@/context/auth-context";
import { ProductService } from "@/services/product.service";
import type { Product } from "@/types";
import { ProductCard } from "@/components/product/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function WishlistPage() {
  const { user } = useAuth();
  const [wishlistProducts, setWishlistProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (user?.wishlistIds) {
      setLoading(true);
      ProductService.getProducts().then((res) => {
        if (res.data) {
          const saved = res.data.products.filter((p) => user.wishlistIds.includes(p.id));
          setWishlistProducts(saved);
        }
        setLoading(false);
      });
    }
  }, [user?.wishlistIds]);

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="border-b border-line pb-6">
        <Badge variant="sage" className="mb-2">
          Saved Products
        </Badge>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          My Saved Wishlist ({wishlistProducts.length})
        </h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2].map((n) => (
            <div key={n} className="h-80 rounded border border-line bg-background-card animate-pulse" />
          ))}
        </div>
      ) : wishlistProducts.length === 0 ? (
        <EmptyState
          title="Your Wishlist is Empty"
          description="Click the bookmark heart icon on any product card to save items to your personal wishlist."
          icon={<Heart className="h-8 w-8 text-status-error" />}
          actionLabel="Browse Products Catalog"
          onAction={() => (window.location.href = "/products")}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
