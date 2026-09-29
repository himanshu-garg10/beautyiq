"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ProductService } from "@/services/product.service";
import { RecentlyViewedService } from "@/services/recently-viewed.service";
import type { Product, ProductListing } from "@/types";
import { Container } from "@/components/layout/container";
import { ProductCard } from "@/components/product/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Star,
  Heart,
  Scale,
  CheckCircle2,
  AlertTriangle,
  Shield,
  ExternalLink,
  ArrowLeft,
  Clock,
  Database,
  HelpCircle,
  Eye,
  Info,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { useComparison } from "@/context/comparison-context";
import { ValueEngineService } from "@/services/value-engine.service";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [product, setProduct] = React.useState<Product | null>(null);
  const [listings, setListings] = React.useState<ProductListing[]>([]);
  const [similarProducts, setSimilarProducts] = React.useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = React.useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = React.useState<string>("");
  const [activeTab, setActiveTab] = React.useState<"overview" | "ingredients" | "sellers" | "compatibility">("overview");
  const [loading, setLoading] = React.useState(true);

  const { user, toggleWishlist } = useAuth();
  const { addToast } = useToast();
  const { isInComparison, addToComparison, removeFromComparison } = useComparison();

  React.useEffect(() => {
    if (id) {
      setLoading(true);
      // Track recently viewed history
      RecentlyViewedService.trackView(id);

      Promise.all([
        ProductService.getProductById(id),
        ProductService.getProductPriceListings(id),
        ProductService.getProducts({ pageSize: 4 }),
      ]).then(([prodRes, priceRes, catalogRes]) => {
        if (prodRes.data) {
          setProduct(prodRes.data);
          setSelectedImage(prodRes.data.images[0] || prodRes.data.image);
        }
        if (priceRes.data) setListings(priceRes.data);
        if (catalogRes.data) {
          setSimilarProducts(catalogRes.data.products.filter((p) => p.id !== id).slice(0, 3));
        }

        // Fetch recently viewed items from localStorage
        const recent = RecentlyViewedService.getRecentlyViewedProducts().filter((p) => p.id !== id);
        setRecentlyViewed(recent.slice(0, 3));

        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return (
      <Container className="py-16 text-center">
        <div className="h-96 w-full rounded border border-line bg-background-card animate-pulse" />
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="py-16">
        <EmptyState
          title="Product Information Unavailable"
          description="The requested skincare product entity could not be found or has been deprecated."
          actionLabel="Return to Catalog"
          onAction={() => (window.location.href = "/products")}
        />
      </Container>
    );
  }

  const isSaved = user?.wishlistIds.includes(product.id) || false;
  const bestListing = ProductService.getBestListingForProduct(product.id);
  const bestPrice = bestListing?.price ?? null;
  const originalPrice = bestListing?.originalPrice;
  const discountPercent = bestListing?.discountPercent;
  const unitPriceCalc = ProductService.getUnitPrice(product);

  const handleWishlist = () => {
    toggleWishlist(product.id);
    addToast({
      type: isSaved ? "info" : "success",
      title: isSaved ? "Product removed from saved items" : "Product saved",
      description: `${product.brand} ${product.name}`,
    });
  };

  const isCompared = product ? isInComparison(product.id) : false;

  const handleCompare = () => {
    if (!product) return;
    if (isCompared) {
      removeFromComparison(product.id);
    } else {
      addToComparison(product.id);
    }
  };

  return (
    <Container className="py-10 space-y-12">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-xs font-semibold text-foreground-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Products Catalog
        </Link>
        <span className="text-xs font-mono text-foreground-faint">ID: {product.id}</span>
      </div>

      {/* Main Product Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left Column: Image Gallery */}
        <div className="space-y-4">
          <div className="relative h-96 sm:h-[450px] w-full overflow-hidden rounded border border-line bg-background-card shadow-subtle">
            <Image
              src={selectedImage || product.image}
              alt={product.name}
              fill
              priority
              className="object-cover"
            />
            {/* Compatibility Score Placeholder */}
            <div
              className="absolute top-4 right-4 bg-background-card/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-sage-deep/30 shadow-md"
              title="Demo compatibility score preview until recommendation engine is active"
            >
              <span className="font-mono text-xs font-bold text-sage-deep">
                {product.compatibilityScore ? `${product.compatibilityScore}% Demo Compatibility` : "Score Preview"}
              </span>
            </div>

            {/* Data Confidence Badge (Requirement #10) */}
            <div className="absolute left-4 top-4 bg-background-card/95 backdrop-blur-md px-3 py-1 rounded border border-line flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5 text-sage-deep" />
              <span className="text-[0.7rem] font-mono font-semibold text-foreground">
                Data Reliability: {product.dataConfidence}%
              </span>
            </div>
          </div>

          {/* Gallery Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {product.images.map((imgUrl, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded border transition-all ${
                    selectedImage === imgUrl ? "border-sage-deep ring-2 ring-sage-deep/30" : "border-line opacity-75 hover:opacity-100"
                  }`}
                >
                  <Image src={imgUrl} alt={`Thumbnail ${index + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Key Details & Actions */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href={`/brands/${product.brand.toLowerCase()}`} className="text-xs uppercase font-bold tracking-wider text-sage-deep hover:underline">
                {product.brand}
              </Link>
              <span className="text-foreground-faint">•</span>
              <Link href={`/categories/${product.category.toLowerCase().replace(/ /g, "-")}`} className="text-xs text-foreground-muted hover:underline font-medium">
                {product.category}
              </Link>
            </div>

            <h1 className="font-display text-3xl font-bold text-foreground">
              {product.name}
            </h1>

            {/* Rating & Status Bar */}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                {product.rating !== null ? (
                  <>
                    <Star className="h-4 w-4 fill-clay text-clay" />
                    <span>{product.rating}</span>
                    <span className="text-xs font-normal text-foreground-faint">
                      ({product.reviewCount.toLocaleString("en-IN")} reviews)
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-foreground-faint font-mono">Rating: Not Available</span>
                )}
              </div>
              <span className="text-line-strong">|</span>
              <Badge variant="sage">{product.usageTime} Routine</Badge>
              <Badge variant="default" className="font-mono text-[0.7rem]">
                Status: {product.productStatus}
              </Badge>
            </div>
          </div>

          {/* Pricing Box (Requirement #1, #2, #19) */}
          <div className="rounded border border-line bg-background-elevated/40 p-5 space-y-2">
            <div className="flex items-baseline gap-3">
              {bestPrice !== null ? (
                <>
                  <span className="font-display text-3xl font-bold text-foreground">
                    ₹{bestPrice.toLocaleString("en-IN")}
                  </span>
                  {originalPrice && originalPrice > bestPrice && (
                    <span className="text-sm text-foreground-faint line-through">
                      ₹{originalPrice.toLocaleString("en-IN")}
                    </span>
                  )}
                  {discountPercent ? (
                    <span className="text-xs font-bold text-status-success">
                      Save {discountPercent}%
                    </span>
                  ) : null}
                </>
              ) : (
                <span className="font-display text-2xl font-bold text-foreground-muted">
                  Price: Temporarily Unavailable
                </span>
              )}
            </div>

            {/* Quantity & Normalized Unit Price */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-foreground-muted pt-1 border-t border-line/60">
              <span>
                Net Quantity: <strong>{product.quantity} {product.unit}</strong>
              </span>
              <span>•</span>
              <span>
                Unit Cost: <strong>{unitPriceCalc.unitLabel}</strong>
              </span>
              {product.pHLevel && (
                <>
                  <span>•</span>
                  <span>
                    pH Level: <strong>{product.pHLevel}</strong>
                  </span>
                </>
              )}
            </div>
          </div>

          <p className="text-sm text-foreground-muted leading-relaxed">
            {product.description || product.summary}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 pt-2 border-t border-line">
            <Button
              variant={isSaved ? "outline" : "accent"}
              size="lg"
              className={isSaved ? "border-rose-300 text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100/50" : ""}
              leftIcon={<Heart className={`h-4 w-4 ${isSaved ? "fill-rose-500 text-rose-500" : ""}`} />}
              onClick={handleWishlist}
            >
              {isSaved ? "Saved to Wishlist" : "Save to Wishlist"}
            </Button>

            <Button
              variant={isCompared ? "clay" : "outline"}
              size="lg"
              leftIcon={<Scale className="h-4 w-4" />}
              onClick={handleCompare}
            >
              {isCompared ? "In Comparison Matrix" : "Compare Product"}
            </Button>

            {isCompared && (
              <Link href="/compare">
                <Button variant="ghost" size="lg" className="text-sage-deep font-semibold hover:bg-sage-tint/30">
                  Open Matrix →
                </Button>
              </Link>
            )}
          </div>

          {/* Metadata & Source Info (Requirement #21, #22) */}
          <div className="rounded border border-line bg-background-card p-3 text-xs space-y-1.5 text-foreground-faint font-mono">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Database className="h-3.5 w-3.5 text-sage-deep" /> Data Source:
              </span>
              <strong className="text-foreground">{product.source}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-sage-deep" /> Last Spec Audit:
              </span>
              <span>{product.lastUpdated}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section: Overview / INCI Ingredients / Seller Listings / Compatibility Preview */}
      <div className="space-y-6">
        <div className="flex border-b border-line gap-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 transition-colors relative ${
              activeTab === "overview" ? "text-sage-deep border-b-2 border-sage-deep" : "text-foreground-muted hover:text-foreground"
            }`}
          >
            Product Overview
          </button>
          <button
            onClick={() => setActiveTab("ingredients")}
            className={`pb-3 transition-colors relative ${
              activeTab === "ingredients" ? "text-sage-deep border-b-2 border-sage-deep" : "text-foreground-muted hover:text-foreground"
            }`}
          >
            Ingredients & INCI ({product.allIngredients.length})
          </button>
          <button
            onClick={() => setActiveTab("sellers")}
            className={`pb-3 transition-colors relative ${
              activeTab === "sellers" ? "text-sage-deep border-b-2 border-sage-deep" : "text-foreground-muted hover:text-foreground"
            }`}
          >
            Sellers & Platform Listings ({listings.length})
          </button>
          <button
            onClick={() => setActiveTab("compatibility")}
            className={`pb-3 transition-colors relative ${
              activeTab === "compatibility" ? "text-sage-deep border-b-2 border-sage-deep" : "text-foreground-muted hover:text-foreground"
            }`}
          >
            Compatibility Preview (Placeholder)
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Skin Suitability */}
            <div className="rounded border border-line bg-background-card p-6 space-y-4 shadow-subtle">
              <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                <Shield className="h-5 w-5 text-sage-deep" /> Suitable Skin Types & Concerns
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-semibold text-foreground-faint block uppercase mb-1.5">Target Skin Types</span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.skinTypes.map((st) => (
                      <Badge key={st} variant="sage">{st}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-foreground-faint block uppercase mb-1.5">Target Skin Concerns</span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.targetConcerns.map((sc) => (
                      <Badge key={sc} variant="clay">{sc}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Safety Badges */}
            <div className="rounded border border-line bg-background-card p-6 space-y-4 shadow-subtle">
              <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-status-success" /> Formulation Safety Profile
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded bg-background-elevated">
                  <span className="text-foreground-faint block">Cruelty-Free</span>
                  <strong className="text-foreground font-mono">{product.crueltyFree ? "Verified Yes" : "No"}</strong>
                </div>
                <div className="p-3 rounded bg-background-elevated">
                  <span className="text-foreground-faint block">Vegan Formula</span>
                  <strong className="text-foreground font-mono">{product.vegan ? "Verified Yes" : "No"}</strong>
                </div>
                <div className="p-3 rounded bg-background-elevated">
                  <span className="text-foreground-faint block">Fragrance-Free</span>
                  <strong className="text-foreground font-mono">{product.fragranceFree ? "Yes" : "Contains Fragrance"}</strong>
                </div>
                <div className="p-3 rounded bg-background-elevated">
                  <span className="text-foreground-faint block">Paraben-Free</span>
                  <strong className="text-foreground font-mono">{product.parabenFree ? "Yes" : "No"}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Ingredients & INCI */}
        {activeTab === "ingredients" && (
          <div className="rounded border border-line bg-background-card p-6 space-y-6 shadow-subtle">
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                Key Active Ingredients
              </h3>
              {product.keyIngredients.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {product.keyIngredients.map((ing) => (
                    <Link key={ing} href={`/ingredients/${ing.toLowerCase().replace(/ /g, "-")}`}>
                      <Badge variant="sage" className="px-3 py-1 text-xs hover:underline cursor-pointer">
                        {ing}
                      </Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-foreground-muted italic">
                  Key active ingredient breakdown is not verified for this record.
                </p>
              )}
            </div>

            <div className="border-t border-line pt-4 space-y-3">
              <h3 className="font-display text-lg font-semibold text-foreground">
                Full INCI Composition List
              </h3>
              {product.allIngredients && product.allIngredients.length > 0 ? (
                <p className="text-xs text-foreground-muted leading-relaxed font-mono bg-background-elevated p-4 rounded border border-line">
                  {product.allIngredients.join(", ")}
                </p>
              ) : (
                <div className="p-4 rounded border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 text-xs text-amber-800 dark:text-amber-300">
                  Full INCI ingredient list is unavailable for this catalog entry. Ingredient compatibility could not be fully evaluated.
                </div>
              )}

              {product.uncertainIngredients && product.uncertainIngredients.length > 0 && (
                <div className="p-3 rounded bg-background-elevated border border-line text-xs text-foreground-muted space-y-1">
                  <span className="font-semibold text-foreground-faint uppercase text-[0.65rem] block">
                    Unverified Ingredients ({product.uncertainIngredients.length})
                  </span>
                  <p className="font-mono text-[0.75rem]">
                    {product.uncertainIngredients.join(", ")}
                  </p>
                  <p className="text-[0.7rem] text-foreground-faint">
                    These items could not be unambiguously mapped to the canonical INCI dictionary.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Seller Listings (Requirement #2, #24, #28) */}
        {activeTab === "sellers" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-xl font-bold text-foreground">
                  Platform &amp; Seller Listings
                </h3>
                <p className="text-xs text-foreground-muted">
                  Live pricing, availability status, and direct retailer links. BeautyIQ does not process checkout or payments.
                </p>
              </div>
            </div>

            {listings.length === 0 ? (
              <p className="text-sm text-foreground-muted">No external platform listings currently available for this product entity.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Platform</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Unit Cost</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listings.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-semibold text-foreground">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>{l.platform}</span>
                          {l.isBestPrice && <Badge variant="sage" className="text-[0.65rem] px-1.5 py-0">Best Price</Badge>}
                          {l.isBestValue && <Badge variant="clay" className="text-[0.65rem] px-1.5 py-0">Best Value</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-foreground-muted">{l.seller}</TableCell>
                      <TableCell className="font-mono text-base font-bold text-foreground">
                        {l.price !== null ? (
                          <div className="flex items-baseline gap-1">
                            <span>₹{l.price.toLocaleString("en-IN")}</span>
                            {l.originalPrice && l.originalPrice > l.price && (
                              <span className="text-xs text-foreground-faint line-through font-normal">
                                ₹{l.originalPrice}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm font-normal text-foreground-muted">Unavailable</span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-foreground-faint">
                        {l.unitPricePerMl ? `₹${l.unitPricePerMl}/${l.unit}` : l.unitPricePerGram ? `₹${l.unitPricePerGram}/${l.unit}` : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={l.availability === "Available" ? "sage" : "warning"}>
                          {l.availability}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-foreground-faint">
                        {l.priceLastUpdated ? l.priceLastUpdated.split(" ")[0] : l.lastUpdated.split(" ")[0]}
                      </TableCell>
                      <TableCell>
                        {l.productUrl ? (
                          <a
                            href={l.productUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-sage-deep hover:underline"
                            title="Open external merchant product page in new tab"
                          >
                            View at source <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-foreground-faint">N/A</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        )}

        {/* Tab 4: Compatibility & Intelligence Profile */}
        {activeTab === "compatibility" && (
          <div className="rounded border border-sage-deep/30 bg-sage-tint/20 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sage-deep font-semibold text-sm">
                <Info className="h-4 w-4" /> Personalized Intelligence &amp; Suitability
              </div>
              <span className="font-mono text-xs font-bold text-sage-deep">
                Compatibility: {product.compatibilityScore || 85}%
              </span>
            </div>
            <p className="text-xs text-foreground-muted leading-relaxed">
              Compatibility evaluates formulation fit against your skin type, primary concerns, and sensitivity tolerances. Data confidence reflects catalog record completeness and verified source integrity.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded bg-background-card border border-line text-xs space-y-1">
                <span className="text-foreground-faint block">Compatibility Score</span>
                <strong className="font-mono text-lg font-bold text-sage-deep">
                  {product.compatibilityScore || 85}% Match
                </strong>
              </div>
              <div className="p-4 rounded bg-background-card border border-line text-xs space-y-1">
                <span className="text-foreground-faint block">Catalog Data Confidence</span>
                <strong className="font-mono text-lg font-bold text-foreground">
                  {product.dataConfidence}% Verified
                </strong>
              </div>
              <div className="p-4 rounded bg-background-card border border-line text-xs space-y-1">
                <span className="text-foreground-faint block">Source Verification</span>
                <strong className="font-mono text-lg font-bold text-status-success">
                  {product.isVerified ? "Approved Feed" : "Catalog Index"}
                </strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Similar Products Section */}
      {similarProducts.length > 0 && (
        <div className="space-y-4 pt-8 border-t border-line">
          <h2 className="font-display text-2xl font-bold text-foreground">
            Similar Skincare Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Recently Viewed Products Section (Requirement #24) */}
      {recentlyViewed.length > 0 && (
        <div className="space-y-4 pt-8 border-t border-line">
          <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <Eye className="h-5 w-5 text-sage-deep" /> Recently Viewed Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentlyViewed.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </Container>
  );
}
