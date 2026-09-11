"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Bookmark, Scale, Star, Heart, CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Product, ProductListing } from "@/types";
import { ProductService } from "@/services/product.service";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { useComparison } from "@/context/comparison-context";

export function ProductCard({ product }: { product: Product }) {
  const { user, toggleWishlist } = useAuth();
  const { addToast } = useToast();
  const { isInComparison, addToComparison, removeFromComparison } = useComparison();

  const isSaved = user?.wishlistIds.includes(product.id) || false;
  const isCompared = isInComparison(product.id);

  const bestListing = ProductService.getBestListingForProduct(product.id);
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
      title: isSaved ? "Product removed from saved items" : "Product saved",
      description: `${product.brand} ${product.name}`,
    });
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCompared) {
      removeFromComparison(product.id);
    } else {
      addToComparison(product.id);
    }
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded border border-line bg-background-card transition-all duration-300 hover:shadow-lg hover:border-line-strong relative">
      {/* Primary Image Container */}
      <Link href={`/products/${product.id}`} className="relative h-56 w-full overflow-hidden bg-background-elevated block">
        <Image
          src={product.image}
          alt={`${product.brand} ${product.name}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Compatibility Score Placeholder (Requirement #6: Clearly marked as demo/placeholder) */}
        <div
          className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-sage-deep/30 bg-background-card/95 backdrop-blur-xs px-2.5 py-1 shadow-subtle"
          title="Placeholder metric until AI Recommendation engine is enabled"
        >
          <span className="h-2 w-2 rounded-full bg-sage-deep animate-pulse" aria-hidden="true" />
          <span className="text-[0.7rem] font-bold font-mono text-sage-deep">
            {product.compatibilityScore ? `${product.compatibilityScore}% Demo Match` : "Match Preview"}
          </span>
        </div>

        {/* Save/Wishlist Button */}
        <button
          onClick={handleWishlist}
          aria-label={isSaved ? "Remove from saved wishlist" : "Save product"}
          title={isSaved ? "Remove from wishlist" : "Save product"}
          className={`absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-line bg-background-card/90 backdrop-blur-xs transition-colors hover:border-sage-deep ${
            isSaved ? "text-status-error bg-rose-50 dark:bg-rose-950/40 border-rose-200" : "text-foreground-muted hover:text-sage-deep"
          }`}
        >
          <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
        </button>

        {/* Availability Badge */}
        <div className="absolute left-3 bottom-3 flex items-center gap-1.5">
          {availability === "Available" ? (
            <Badge variant="sage" className="text-[0.65rem] py-0.5 px-2 uppercase font-semibold">
              Available
            </Badge>
          ) : (
            <Badge variant="warning" className="text-[0.65rem] py-0.5 px-2 uppercase font-semibold">
              {availability}
            </Badge>
          )}

          {/* Data Confidence Indicator (Requirement #10) */}
          <span
            className="text-[0.65rem] font-mono font-medium px-2 py-0.5 rounded bg-background-card/90 text-foreground-muted border border-line"
            title={`Data Confidence: ${product.dataConfidence}% completeness/reliability`}
          >
            Conf: {product.dataConfidence}%
          </span>
        </div>
      </Link>

      {/* Card Content Body */}
      <div className="flex flex-1 flex-col p-5 space-y-3">
        {/* Brand, Category & Rating */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-foreground-faint">
              {product.brand}
            </span>
            <span className="text-foreground-faint">•</span>
            <span className="text-xs text-foreground-muted font-medium">{product.category}</span>
          </div>

          {/* Rating Display (Requirement #9: Null rating displayed as Not Available, not fake 0) */}
          <div className="flex items-center gap-1 text-xs text-foreground-muted">
            {product.rating !== null ? (
              <>
                <Star className="h-3.5 w-3.5 fill-clay text-clay" aria-hidden="true" />
                <span className="font-semibold text-foreground">{product.rating}</span>
                <span className="text-foreground-faint">({product.reviewCount.toLocaleString("en-IN")})</span>
              </>
            ) : (
              <span className="text-foreground-faint font-mono text-[0.7rem]">Rating: N/A</span>
            )}
          </div>
        </div>

        {/* Product Title */}
        <Link href={`/products/${product.id}`} className="block">
          <h3 className="font-display text-base font-semibold leading-snug text-foreground hover:text-sage-deep transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Key Ingredients & Concerns */}
        <div className="flex flex-wrap gap-1 min-h-[44px]">
          {product.keyIngredients.slice(0, 2).map((ing) => (
            <Badge key={ing} variant="default" className="text-[0.7rem] py-0 px-2">
              {ing}
            </Badge>
          ))}
          {product.targetConcerns.slice(0, 1).map((concern) => (
            <Badge key={concern} variant="clay" className="text-[0.7rem] py-0 px-2">
              {concern}
            </Badge>
          ))}
        </div>

        {/* Price, Unit Price & Comparison Action */}
        <div className="mt-auto border-t border-line pt-3.5 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              {price !== null ? (
                <>
                  <span className="font-display text-lg font-bold text-foreground">
                    ₹{price.toLocaleString("en-IN")}
                  </span>
                  {originalPrice && originalPrice > price && (
                    <span className="text-xs text-foreground-faint line-through">
                      ₹{originalPrice.toLocaleString("en-IN")}
                    </span>
                  )}
                  {discountPercent ? (
                    <span className="text-[0.65rem] font-bold text-status-success">
                      -{discountPercent}%
                    </span>
                  ) : null}
                </>
              ) : (
                <span className="text-sm font-semibold text-foreground-muted">Price: Unavailable</span>
              )}
            </div>

            {/* Quantity & Unit Cost (Requirement #19: Price per unit) */}
            <span className="text-[0.7rem] font-mono text-foreground-faint">
              {product.quantity} {product.unit} {unitPriceCalc.unitPrice !== null ? `(${unitPriceCalc.unitLabel})` : ""}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCompare}
              title={isCompared ? "Remove from comparison" : "Add to comparison"}
              className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded border transition-colors ${
                isCompared
                  ? "border-sage-deep bg-sage-tint text-sage-deep font-semibold"
                  : "border-line text-foreground-muted hover:border-line-strong hover:text-foreground"
              }`}
            >
              <Scale className="h-3.5 w-3.5" />
              {isCompared ? "Added" : "Compare"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
