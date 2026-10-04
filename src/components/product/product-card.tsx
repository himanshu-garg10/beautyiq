"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Scale, Star, Heart, Check, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Product, ProductListing } from "@/types";
import { ProductService } from "@/services/product.service";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { useComparison } from "@/context/comparison-context";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const { user, toggleWishlist } = useAuth();
  const { addToast } = useToast();
  const { isInComparison, addToComparison, removeFromComparison } = useComparison();

  const isSaved = user?.wishlistIds?.includes(product.id) || false;
  const isCompared = isInComparison(product.id);

  const databasePrices = (product as Product & { prices?: ProductListing[] }).prices || [];
  const bestListing = databasePrices
    .filter((listing) => listing.price !== null)
    .sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity))[0] || ProductService.getBestListingForProduct(product.id);
  const price = bestListing?.price ?? null;
  const originalPrice = bestListing?.originalPrice;
  const discountPercent = bestListing?.discountPercent;
  const availability = bestListing?.availability || "Available";

  // Calculate Unit Cost (₹/ml or ₹/g)
  const unitPriceCalc = ProductService.getUnitPrice(product);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    addToast({
      type: isSaved ? "info" : "success",
      title: isSaved ? "Removed from Wishlist" : "Added to Wishlist",
      description: `${product.brand} ${product.name}`,
    });
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCompared) {
      removeFromComparison(product.id);
      addToast({
        type: "info",
        title: "Removed from Comparison",
        description: `${product.name}`,
      });
    } else {
      addToComparison(product.id);
      addToast({
        type: "success",
        title: "Added to Comparison Matrix",
        description: `${product.name}`,
      });
    }
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-xl border border-line bg-background-card transition-all duration-300 hover:border-line-strong hover:shadow-md h-full",
        className
      )}
    >
      {/* Top Image Box */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-background-elevated">
        <Link href={`/products/${product.id}`} className="block h-full w-full">
          <Image
            src={product.image}
            alt={`${product.brand} ${product.name}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Wishlist Button (Top Left) */}
        <button
          onClick={handleWishlist}
          aria-label={isSaved ? "Remove from wishlist" : "Save to wishlist"}
          title={isSaved ? "Remove from wishlist" : "Save to wishlist"}
          className={cn(
            "absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-line/80 bg-background-card/90 backdrop-blur-xs transition-all hover:scale-110 shadow-xs",
            isSaved
              ? "text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200"
              : "text-foreground-muted hover:text-rose-500"
          )}
        >
          <Heart className={cn("h-4 w-4", isSaved && "fill-current")} />
        </button>

        {/* Compatibility Match Pill (Top Right) */}
        {product.compatibilityScore ? (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-sage-deep/30 bg-background-card/95 backdrop-blur-xs px-2.5 py-0.5 shadow-xs">
            <Sparkles className="h-3 w-3 text-sage-deep shrink-0" />
            <span className="text-[0.7rem] font-bold text-sage-deep font-mono">
              {product.compatibilityScore}% Match
            </span>
          </div>
        ) : null}

        {/* Category Pill (Bottom Left) */}
        <div className="absolute bottom-2.5 left-3">
          <span className="text-[0.65rem] font-medium tracking-wide text-white bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-full">
            {product.category}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-4 sm:p-5 space-y-3">
        {/* Brand & Rating Bar */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[0.72rem] font-bold uppercase tracking-wider text-sage-deep truncate">
            {product.brand}
          </span>

          {/* Star Rating */}
          <div className="flex items-center gap-1 text-xs shrink-0">
            {product.rating !== null ? (
              <>
                <Star className="h-3.5 w-3.5 fill-clay text-clay" aria-hidden="true" />
                <span className="font-semibold text-foreground text-xs">{product.rating}</span>
                <span className="text-foreground-faint text-[0.7rem]">
                  ({product.reviewCount.toLocaleString()})
                </span>
              </>
            ) : (
              <span className="text-foreground-faint text-[0.68rem] font-mono">New</span>
            )}
          </div>
        </div>

        {product.productStatus === "Incomplete" && (
          <span className="w-fit rounded-full bg-champagne-tint px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wide text-champagne-deep">
            Label data · price pending
          </span>
        )}

        {/* Product Title */}
        <Link href={`/products/${product.id}`} className="block">
          <h3 className="font-display text-[0.98rem] font-bold leading-snug text-foreground group-hover:text-sage-deep transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Key Actives & Benefits Pills */}
        <div className="flex flex-wrap items-center gap-1 min-h-[32px]">
          {product.keyIngredients.slice(0, 2).map((ing) => (
            <span
              key={ing}
              className="text-[0.68rem] font-medium px-2 py-0.5 rounded bg-sage-tint/60 text-sage-deep dark:bg-sage-deep/15"
            >
              {ing}
            </span>
          ))}
          {product.targetConcerns.slice(0, 1).map((concern) => (
            <span
              key={concern}
              className="text-[0.68rem] font-medium px-2 py-0.5 rounded bg-clay-tint/70 text-clay dark:bg-clay-tint/20"
            >
              {concern}
            </span>
          ))}
        </div>

        {/* Price & Action Row */}
        <div className="mt-auto pt-3 border-t border-line/60 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-1.5">
              {price !== null ? (
                <>
                  <span className="font-display text-base sm:text-lg font-bold text-foreground">
                    ₹{price.toLocaleString()}
                  </span>
                  {originalPrice && originalPrice > price && (
                    <span className="text-xs text-foreground-faint line-through">
                      ₹{originalPrice.toLocaleString()}
                    </span>
                  )}
                  {discountPercent ? (
                    <span className="text-[0.65rem] font-bold text-status-success">
                      -{discountPercent}%
                    </span>
                  ) : null}
                </>
              ) : (
                <span className="text-xs font-semibold text-foreground-muted">Check Availability</span>
              )}
            </div>

            {/* Normalized Unit Price */}
            <span className="block text-[0.68rem] font-mono text-foreground-faint">
              {product.quantity} {product.unit} {unitPriceCalc.unitPrice !== null ? `• ${unitPriceCalc.unitLabel}` : ""}
            </span>
          </div>

          {/* Compare Button */}
          <button
            onClick={handleCompare}
            title={isCompared ? "Remove from comparison" : "Add to comparison"}
            className={cn(
              "flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all shrink-0",
              isCompared
                ? "border-sage-deep bg-sage-deep text-white shadow-xs"
                : "border-line bg-background-card hover:bg-background-elevated text-foreground-muted hover:text-foreground"
            )}
          >
            {isCompared ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <Scale className="h-3.5 w-3.5 text-sage-deep" />
                <span>Compare</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
