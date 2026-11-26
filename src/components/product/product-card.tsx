"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Scale, Star, Heart, Check, Sparkles, ExternalLink, ShoppingBag, Tag, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Product, ProductListing } from "@/types";
import { ProductService } from "@/services/product.service";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { useComparison } from "@/context/comparison-context";
import { cn } from "@/lib/utils";

function getStoreChipStyle(platform: string) {
  const p = platform.toLowerCase();
  if (p.includes("amazon")) return "bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700";
  if (p.includes("flipkart")) return "bg-blue-500/10 hover:bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700";
  if (p.includes("nykaa")) return "bg-rose-500/10 hover:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700";
  if (p.includes("myntra")) return "bg-pink-500/10 hover:bg-pink-500/20 text-pink-800 dark:text-pink-300 border-pink-300 dark:border-pink-700";
  if (p.includes("purplle")) return "bg-purple-500/10 hover:bg-purple-500/20 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700";
  if (p.includes("tira")) return "bg-stone-500/10 hover:bg-stone-500/20 text-stone-900 dark:text-stone-200 border-stone-300 dark:border-stone-700";
  return "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700";
}

export function ProductCard({
  product,
  className,
  returnTo,
  selectedStore,
}: {
  product: Product;
  className?: string;
  /** Catalog context so the detail page can return to the exact filters/page. */
  returnTo?: string;
  /** Filtered store if user selected a specific marketplace */
  selectedStore?: string;
}) {
  const { user, toggleWishlist } = useAuth();
  const { addToast } = useToast();
  const { isInComparison, addToComparison, removeFromComparison } = useComparison();
  const [showAllStores, setShowAllStores] = React.useState(false);

  const isSaved = user?.wishlistIds?.includes(product.id) || false;
  const isCompared = isInComparison(product.id);

  // Retrieve multi-retailer comparative listings (Amazon, Flipkart, Myntra, Nykaa, Brand Store, etc.)
  const allProductListings = React.useMemo(() => {
    return ProductService.getListingsForProduct(product.id).filter((l) => l.price !== null);
  }, [product.id]);

  const bestOverallListing = allProductListings.length > 0
    ? [...allProductListings].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity))[0]
    : undefined;

  const targetStoreListing = React.useMemo(() => {
    if (!selectedStore) return undefined;
    const s = selectedStore.toLowerCase();
    return allProductListings.find((l) => {
      const plat = l.platform.toLowerCase();
      if (s === "amazon") return plat.includes("amazon");
      if (s === "flipkart") return plat.includes("flipkart");
      if (s === "nykaa") return plat.includes("nykaa");
      if (s === "myntra") return plat.includes("myntra");
      if (s === "purplle") return plat.includes("purplle");
      if (s === "tira") return plat.includes("tira");
      if (s === "brand" || s === "direct") return plat.includes("direct") || plat.includes("store");
      return plat.includes(s);
    });
  }, [allProductListings, selectedStore]);

  // When a store is explicitly selected in filter, display that store's price & offer.
  // Otherwise, display the product's official website selling price and official discount.
  const activeListing = targetStoreListing;
  const price = activeListing ? activeListing.price : (product.price ?? bestOverallListing?.price ?? null);
  const originalPrice = activeListing ? activeListing.originalPrice : (product.mrp ?? bestOverallListing?.originalPrice);
  const discountPercent =
    activeListing?.discountPercent ??
    (originalPrice && price && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0);
  const savingsAmount =
    originalPrice && price && originalPrice > price ? originalPrice - price : 0;

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
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn(
        "group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-line/80 bg-background-card shadow-card transition-all duration-300 hover:border-champagne/60 hover:shadow-card-hover",
        className
      )}
    >
      {/* Top Image Box */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-background-elevated">
        <Link
          href={`/products/${product.id}${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}
          className="block h-full w-full"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative h-full w-full"
          >
            <Image
              src={product.image}
              alt={`${product.brand} ${product.name}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          </motion.div>
          {/* Subtle bottom gradient vignette for contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
        </Link>

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Wishlist Button */}
            {user && (
              <button
                onClick={handleWishlist}
                aria-label={isSaved ? "Remove from wishlist" : "Save to wishlist"}
                title={isSaved ? "Remove from wishlist" : "Save to wishlist"}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border border-white/40 bg-white/90 dark:bg-black/60 backdrop-blur-md transition-all hover:scale-110 shadow-sm",
                  isSaved
                    ? "text-rose-500 bg-rose-50 dark:bg-rose-950/60 border-rose-300"
                    : "text-foreground-muted hover:text-rose-500"
                )}
              >
                <Heart className={cn("h-4 w-4", isSaved && "fill-current")} />
              </button>
            )}

            {/* Savings Badge */}
            {discountPercent > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/95 text-white px-2.5 py-0.5 text-[0.68rem] font-bold tracking-wide backdrop-blur-xs shadow-sm">
                <Tag className="h-2.5 w-2.5" />
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Compatibility Match Pill */}
          {product.compatibilityScore ? (
            <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-sage-deep/30 bg-background-card/95 backdrop-blur-md px-2.5 py-0.5 shadow-sm">
              <Sparkles className="h-3 w-3 text-sage-deep shrink-0" />
              <span className="text-[0.7rem] font-bold text-sage-deep font-mono">
                {product.compatibilityScore}% Match
              </span>
            </div>
          ) : null}
        </div>

        {/* Category & Offer Pill (Bottom of Image) */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="text-[0.65rem] font-semibold tracking-wide text-white bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20">
            {product.category}
          </span>

          {activeListing?.offerTag && (
            <span className="text-[0.62rem] font-semibold text-emerald-200 bg-emerald-950/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-emerald-500/40 truncate max-w-[170px]">
              {activeListing.offerTag}
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col p-4 sm:p-5 space-y-3">
        {/* Brand & Star Rating Header */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground-faint truncate">
            {product.brand}
          </span>

          {/* Star Rating */}
          <div className="flex items-center gap-1 text-xs shrink-0">
            {product.rating !== null ? (
              <>
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" aria-hidden="true" />
                <span className="font-bold text-foreground text-xs">{product.rating}</span>
                <span className="text-foreground-faint text-[0.7rem]">
                  ({product.reviewCount.toLocaleString()})
                </span>
              </>
            ) : (
              <span className="text-foreground-faint text-[0.68rem] font-mono">Verified Brand</span>
            )}
          </div>
        </div>

        {/* Product Title */}
        <Link href={`/products/${product.id}`} className="block">
          <h3 className="font-display text-[0.98rem] font-bold leading-snug text-foreground group-hover:text-sage-deep transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Key Actives & Benefits Pills */}
        <div className="flex flex-wrap items-center gap-1 min-h-[30px]">
          {product.keyIngredients.slice(0, 2).map((ing) => (
            <span
              key={ing}
              className="text-[0.68rem] font-medium px-2 py-0.5 rounded-md bg-sage-tint/80 text-sage-deep border border-sage-deep/15 dark:bg-sage-deep/20"
            >
              {ing}
            </span>
          ))}
          {product.targetConcerns.slice(0, 1).map((concern) => (
            <span
              key={concern}
              className="text-[0.68rem] font-medium px-2 py-0.5 rounded-md bg-clay-tint/80 text-clay border border-clay/15 dark:bg-clay-tint/20"
            >
              {concern}
            </span>
          ))}
        </div>

        {/* Multi-Retailer Live Price Comparison Strip */}
        {allProductListings.length > 0 && (
          <div className="pt-2 border-t border-line/50 space-y-1.5">
            <div className="flex items-center justify-between text-[0.68rem] font-medium text-foreground-faint">
              <span className="flex items-center gap-1">
                <span className="font-semibold text-foreground-muted">Compare {allProductListings.length} Stores:</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowAllStores((v) => !v);
                  }}
                  className="text-sage-deep font-bold hover:underline flex items-center gap-0.5"
                >
                  {showAllStores ? (
                    <>Hide <ChevronUp className="h-3 w-3" /></>
                  ) : (
                    <>View All <ChevronDown className="h-3 w-3" /></>
                  )}
                </button>
              </span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                Best: ₹{bestOverallListing?.price} ({bestOverallListing?.platform?.replace(" Direct", "").replace(" Store", "")})
              </span>
            </div>

            {/* Expanded Multi-Store Comparison Drawer */}
            {showAllStores ? (
              <div
                onClick={(e) => e.stopPropagation()}
                className="p-2.5 rounded-xl border border-sage-deep/30 bg-background-elevated space-y-1.5 shadow-sm my-1 text-xs"
              >
                <div className="flex items-center justify-between font-semibold text-[0.7rem] pb-1 border-b border-line text-foreground-muted">
                  <span>Store &amp; Offer</span>
                  <span>Payable Price</span>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {allProductListings.map((l) => (
                    <div
                      key={l.id}
                      className={cn(
                        "flex items-center justify-between p-1.5 rounded-lg transition-colors text-[0.7rem]",
                        l.isBestPrice
                          ? "bg-emerald-500/10 text-emerald-950 dark:text-emerald-300 font-semibold border border-emerald-500/30"
                          : "hover:bg-background-card border border-transparent"
                      )}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1">
                          <span className="truncate font-semibold text-foreground">{l.platform}</span>
                          {l.isBestPrice && (
                            <span className="bg-emerald-600 text-white text-[0.55rem] font-bold px-1 rounded">
                              LOWEST
                            </span>
                          )}
                        </div>
                        {l.offerTag ? (
                          <span className="text-[0.62rem] text-emerald-700 dark:text-emerald-400 block truncate">
                            {l.offerTag}
                          </span>
                        ) : l.deliveryEstimate ? (
                          <span className="text-[0.62rem] text-foreground-faint block truncate">
                            {l.deliveryEstimate}
                          </span>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="font-mono font-bold text-foreground">₹{l.price}</span>
                        {l.productUrl && (
                          <a
                            href={l.productUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[0.65rem] font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs"
                          >
                            <span>Buy</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1">
                {allProductListings.slice(0, 4).map((l) => (
                  <a
                    key={l.id}
                    href={l.productUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    title={`Buy on ${l.platform} — ₹${l.price} (${l.offerTag || l.deliveryEstimate || "Direct Link"})`}
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[0.65rem] transition-all border font-semibold",
                      getStoreChipStyle(l.platform),
                      l.isBestPrice && "ring-1.5 ring-emerald-500/60 shadow-2xs font-bold"
                    )}
                  >
                    <span className="truncate max-w-[65px]">
                      {l.platform.replace(" Direct", "").replace(" Store", "")}
                    </span>
                    <span className="font-mono font-bold">₹{l.price}</span>
                    <ExternalLink className="h-2 w-2 opacity-60" />
                  </a>
                ))}
                {allProductListings.length > 4 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowAllStores(true);
                    }}
                    className="inline-flex items-center px-1.5 py-0.5 rounded-lg text-[0.65rem] font-semibold text-foreground-faint hover:text-foreground bg-background-elevated border border-line"
                    title="View all retailer prices and comparison"
                  >
                    +{allProductListings.length - 4} more
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Price & Action Row */}
        <div className="mt-auto pt-3 border-t border-line/70 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              {price !== null ? (
                <>
                  <span className="font-display text-lg sm:text-xl font-bold text-foreground">
                    ₹{price.toLocaleString()}
                  </span>
                  {originalPrice && originalPrice > price && (
                    <span className="text-xs text-foreground-faint line-through">
                      ₹{originalPrice.toLocaleString()}
                    </span>
                  )}
                  {savingsAmount > 0 && (
                    <span className="text-[0.68rem] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-md shadow-2xs">
                      {discountPercent}% OFF · Save ₹{savingsAmount}
                    </span>
                  )}
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

          <div className="flex items-center gap-1.5 shrink-0">
            {activeListing?.productUrl ? (
              <a
                href={activeListing.productUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                title={`Buy ${product.name} on ${activeListing.platform} — ₹${price} (${activeListing.offerTag || activeListing.deliveryEstimate || "Direct Link"})`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white px-3.5 py-2 text-xs font-bold shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>Buy Now</span>
                <ExternalLink className="h-2.5 w-2.5 opacity-80" />
              </a>
            ) : product.directBuyUrl ? (
              <a
                href={product.directBuyUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                title={`Buy ${product.name} on Official Store — ₹${product.price}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white px-3.5 py-2 text-xs font-bold shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>Buy Now</span>
                <ExternalLink className="h-2.5 w-2.5 opacity-80" />
              </a>
            ) : bestOverallListing?.productUrl ? (
              <a
                href={bestOverallListing.productUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                title={`Buy ${product.name} on ${bestOverallListing.platform} — ₹${bestOverallListing.price}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white px-3.5 py-2 text-xs font-bold shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>Buy Now</span>
                <ExternalLink className="h-2.5 w-2.5 opacity-80" />
              </a>
            ) : null}

            <button
              onClick={handleCompare}
              title={isCompared ? "Remove from comparison" : "Add to comparison"}
              className={cn(
                "flex items-center gap-1 text-xs font-semibold px-2.5 py-2 rounded-xl border transition-all",
                isCompared
                  ? "border-sage-deep bg-sage-deep text-white shadow-xs"
                  : "border-line bg-background-card hover:bg-background-elevated text-foreground-muted hover:text-foreground"
              )}
            >
              {isCompared ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Added</span>
                </>
              ) : (
                <>
                  <Scale className="h-3.5 w-3.5 text-sage-deep" />
                  <span className="hidden sm:inline">Compare</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
