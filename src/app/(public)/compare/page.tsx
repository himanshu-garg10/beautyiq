"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { ComparisonService } from "@/services/comparison.service";
import { ProductService } from "@/services/product.service";
import type { Product, ProductComparisonItem, ComparisonSession, ProductListing } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Scale,
  X,
  Star,
  Plus,
  Trash2,
  ExternalLink,
  Clock,
  ArrowRight,
  Heart,
} from "lucide-react";
import { useComparison } from "@/context/comparison-context";
import { useSkinProfile } from "@/context/skin-profile-context";
import { useToast } from "@/context/toast-context";
import { useAuth } from "@/context/auth-context";

function RetailerPriceLinks({ listings }: { listings: ProductListing[] }) {
  const visibleListings = [...listings]
    .filter((listing) => listing.price !== null)
    .sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));

  if (!visibleListings.length) {
    return <span className="text-xs text-foreground-faint">No verified seller price yet</span>;
  }

  const lowestPrice = visibleListings[0]?.price;

  return (
    <div className="flex flex-wrap gap-1.5">
      {visibleListings.map((listing) => {
        const isLowest = listing.price === lowestPrice;
        const content = (
          <>
            <span className="font-semibold">{listing.platform}</span>
            <span className="rounded bg-background-card/80 px-1.5 py-0.5 font-mono font-bold">
              ₹{listing.price?.toLocaleString("en-IN")}
            </span>
            {isLowest && (
              <span className="rounded bg-emerald-500 text-white text-[0.6rem] px-1 py-0.2 font-bold uppercase">
                Lowest
              </span>
            )}
            <ExternalLink className="h-3 w-3 opacity-70" />
          </>
        );

        return listing.productUrl ? (
          <a
            key={listing.id}
            href={listing.productUrl}
            target="_blank"
            rel="noreferrer"
            title={`Open ${listing.platform} offer (${listing.deliveryEstimate || "Direct Link"})`}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors ${
              isLowest
                ? "border-sage-deep bg-sage-tint/60 text-sage-deep font-semibold shadow-xs hover:bg-sage-tint"
                : "border-line bg-background-elevated/70 text-foreground-muted hover:text-foreground hover:border-line-strong"
            }`}
          >
            {content}
          </a>
        ) : (
          <span
            key={listing.id}
            className="inline-flex items-center gap-1 rounded-lg border border-line bg-background-elevated px-2 py-1 text-xs text-foreground-muted"
          >
            {content}
          </span>
        );
      })}
    </div>
  );
}

export default function CompareMatrixPage() {
  const { user, toggleWishlist } = useAuth();
  const userId = user?.id || "guest";
  const { selectedIds, removeFromComparison, addToComparison } = useComparison();
  const { profile } = useSkinProfile();
  const { showToast } = useToast();

  const [items, setItems] = React.useState<ProductComparisonItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [history, setHistory] = React.useState<ComparisonSession[]>([]);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [allProducts, setAllProducts] = React.useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");

  const hasCompletedProfile = profile.isOnboardingComplete && profile.skinType;

  // Load products for comparison
  const loadComparison = React.useCallback(
    async (idsToCompare: string[]) => {
      setLoading(true);
      const res = await ComparisonService.compareProducts(idsToCompare, hasCompletedProfile ? profile : null, userId);
      if (res.data) {
        setItems(res.data);
      }
      setLoading(false);
    },
    [hasCompletedProfile, profile, userId]
  );

  React.useEffect(() => {
    // A comparison starts empty. Only products deliberately added by the visitor appear here.
    if (selectedIds.length === 0) {
      setItems([]);
      setLoading(false);
    } else {
      loadComparison(selectedIds);
    }
    setHistory(ComparisonService.getComparisonHistory(userId));
  }, [selectedIds, loadComparison, userId]);

  // Load catalog for quick add modal
  React.useEffect(() => {
    ProductService.getProducts({ pageSize: 30 }).then((res) => {
      if (res.data) setAllProducts(res.data.products);
    });
  }, []);

  const handleRemove = (id: string) => {
    removeFromComparison(id);
    setItems((prev) => prev.filter((item) => item.product.id !== id));
  };

  const handleAddProduct = (id: string) => {
    if (selectedIds.includes(id)) {
      showToast("This product is already in your comparison matrix.", "info");
      return;
    }
    const success = addToComparison(id);
    if (success) {
      setShowAddModal(false);
    }
  };

  const handleReopenSession = (session: ComparisonSession) => {
    session.productIds.forEach((id) => addToComparison(id));
    loadComparison(session.productIds);
    showToast(`Reopened ${session.criteria || "comparison session"}`, "success");
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = ComparisonService.deleteComparisonSession(sessionId, userId);
    setHistory(updated);
    showToast("Comparison history session deleted", "info");
  };

  const handleClearHistory = () => {
    ComparisonService.clearComparisonHistory(userId);
    setHistory([]);
    showToast("Cleared comparison history", "info");
  };

  const filteredCatalog = allProducts.filter(
    (p) =>
      !items.some((item) => item.product.id === p.id) &&
      (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Container className="py-6 md:py-8 space-y-6 max-w-7xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-mono text-foreground-faint">{items.length} / 5 selected</span>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setShowAddModal(true)}
            disabled={items.length >= 5}
          >
            Add Product ({items.length}/5)
          </Button>

        </div>
      </div>

      {/* Main Comparison Matrix Display */}
      {loading ? (
        <div className="h-96 rounded border border-line bg-background-card animate-pulse" />
      ) : items.length === 0 ? (
        <EmptyState
          title="No Products Selected for Comparison"
          description="Add a product to view its details, then add more products whenever you want to compare them side-by-side."
          actionLabel="Browse Products Catalog"
          onAction={() => (window.location.href = "/products")}
        />
      ) : (
        <div className="space-y-8">
          {/* DESKTOP COMPARISON TABLE (>= 768px) */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-line bg-background-card shadow-subtle">
            <Table>
              <TableHeader>
                <TableRow className="bg-background-elevated/50">
                  <TableHead className="w-52 font-bold text-foreground">Feature / Metric</TableHead>
                  {items.map((item) => (
                    <TableHead key={item.product.id} className="min-w-[240px] max-w-[280px]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-foreground truncate">{item.product.brand}</span>
                        <button
                          onClick={() => handleRemove(item.product.id)}
                          className="text-foreground-faint hover:text-status-error transition-colors p-1"
                          title="Remove from matrix"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {/* Product Header Row */}
                <TableRow>
                  <TableCell className="font-semibold text-foreground-muted">Product</TableCell>
                  {items.map((item) => (
                    <TableCell key={item.product.id}>
                      <div className="space-y-2">
                        <Link href={`/products/${item.product.id}`} className="block relative h-36 w-full rounded overflow-hidden bg-background-elevated border border-line group">
                          <Image src={item.product.image} alt={item.product.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                        </Link>
                        <Link href={`/products/${item.product.id}`} className="font-display font-semibold text-foreground text-sm line-clamp-2 hover:text-sage-deep transition-colors">
                          {item.product.name}
                        </Link>
                        <div className="flex items-center justify-between gap-1 pt-1">
                          <Badge variant="default" className="text-[0.65rem]">{item.product.category}</Badge>
                          <button
                            onClick={() => {
                              toggleWishlist(item.product.id);
                              const isSaved = user?.wishlistIds?.includes(item.product.id);
                              showToast(
                                isSaved ? `Removed ${item.product.name} from wishlist` : `Saved ${item.product.name} to wishlist`,
                                isSaved ? "info" : "success"
                              );
                            }}
                            className={`flex items-center gap-1 text-[0.68rem] px-2 py-0.5 rounded border transition-colors ${
                              user?.wishlistIds?.includes(item.product.id)
                                ? "bg-rose-50 dark:bg-rose-950/30 text-rose-500 border-rose-200"
                                : "text-foreground-muted hover:text-rose-500 border-line bg-background"
                            }`}
                            title="Save to Wishlist"
                          >
                            <Heart className={`h-3 w-3 ${user?.wishlistIds?.includes(item.product.id) ? "fill-current" : ""}`} />
                            <span>{user?.wishlistIds?.includes(item.product.id) ? "Saved" : "Save"}</span>
                          </button>
                        </div>
                      </div>
                    </TableCell>
                  ))}
                </TableRow>

                {/* Overall Compatibility Row */}
                <TableRow className="bg-sage-tint/20">
                  <TableCell className="font-semibold text-sage-deep">
                    Skin Compatibility
                  </TableCell>
                  {items.map((item) => (
                    <TableCell key={item.product.id}>
                      {item.suitabilityMatch !== null ? (
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-mono font-bold">
                            <span className="text-sage-deep">{item.suitabilityMatch}% Match</span>
                            {item.isBestCompatibilityOverall && (
                              <Badge variant="sage" className="text-[0.6rem] py-0">Top Match</Badge>
                            )}
                          </div>
                          <Progress value={item.suitabilityMatch} variant="sage" size="md" />
                        </div>
                      ) : (
                        <span className="text-xs text-foreground-faint font-mono">Profile Required</span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Customer Rating Row */}
                <TableRow>
                  <TableCell className="font-semibold text-foreground-muted">Rating &amp; Reviews</TableCell>
                  {items.map((item) => (
                    <TableCell key={item.product.id}>
                      <div className="flex items-center gap-1.5 text-xs">
                        {item.product.rating !== null ? (
                          <>
                            <Star className="h-4 w-4 fill-clay text-clay" />
                            <span className="font-bold text-foreground font-mono">{item.product.rating}</span>
                            <span className="text-foreground-faint">({item.product.reviewCount})</span>
                            {item.isBestRatedOverall && (
                              <Badge variant="clay" className="text-[0.6rem] ml-1">Highest Rated</Badge>
                            )}
                          </>
                        ) : (
                          <span className="text-foreground-faint font-mono">Rating: N/A</span>
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>

                {/* Key Active Ingredients */}
                <TableRow>
                  <TableCell className="font-semibold text-foreground-muted">Key Actives</TableCell>
                  {items.map((item) => (
                    <TableCell key={item.product.id}>
                      <div className="flex flex-wrap gap-1">
                        {item.product.keyIngredients.map((ing) => (
                          <Badge key={ing} variant="default" className="text-[0.68rem]">
                            {ing}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>

                {/* Target Concerns */}
                <TableRow>
                  <TableCell className="font-semibold text-foreground-muted">Target Concerns</TableCell>
                  {items.map((item) => (
                    <TableCell key={item.product.id}>
                      <div className="flex flex-wrap gap-1">
                        {item.product.targetConcerns.map((concern) => (
                          <Badge key={concern} variant="clay" className="text-[0.68rem]">
                            {concern}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>

                {/* Safety & Ethics Profile */}
                <TableRow>
                  <TableCell className="font-semibold text-foreground-muted">Formulation Safety</TableCell>
                  {items.map((item) => (
                    <TableCell key={item.product.id} className="text-xs space-y-1 font-mono">
                      <div>Cruelty-Free: <strong>{item.product.crueltyFree ? "Yes" : "No"}</strong></div>
                      <div>Vegan: <strong>{item.product.vegan ? "Yes" : "No"}</strong></div>
                      <div>Fragrance-Free: <strong>{item.product.fragranceFree ? "Yes" : "No"}</strong></div>
                    </TableCell>
                  ))}
                </TableRow>

                <TableRow>
                  <TableCell className="font-semibold text-foreground-muted">Size &amp; Routine</TableCell>
                  {items.map((item) => <TableCell key={item.product.id} className="text-xs"><p className="font-semibold text-foreground">{item.product.quantity} {item.product.unit}</p><p className="mt-1 text-foreground-muted">Use: {item.product.usageTime}</p><p className="mt-1 text-foreground-faint">{item.product.pHLevel ? `pH ${item.product.pHLevel}` : "pH not listed"}</p></TableCell>)}
                </TableRow>

                <TableRow>
                  <TableCell className="font-semibold text-foreground-muted">Formula Preferences</TableCell>
                  {items.map((item) => <TableCell key={item.product.id} className="text-xs leading-6 text-foreground-muted"><span className={item.product.parabenFree ? "text-sage-deep" : undefined}>Paraben-free: {item.product.parabenFree ? "Yes" : "No"}</span><br />Silicone-free: {item.product.siliconeFree ? "Yes" : "No"}</TableCell>)}
                </TableRow>

                {/* Grounded Comparison Highlights */}
                <TableRow className="bg-background-elevated/40">
                  <TableCell className="font-semibold text-foreground-muted">Key Highlights</TableCell>
                  {items.map((item) => (
                    <TableCell key={item.product.id}>
                      <ul className="space-y-1 text-xs text-foreground-muted">
                        {item.reasons && item.reasons.length > 0 ? (
                          item.reasons.map((r, idx) => (
                            <li key={idx} className="flex items-start gap-1 font-medium text-foreground">
                              <span>{r}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-foreground-faint">Standard formulation</li>
                        )}
                      </ul>
                    </TableCell>
                  ))}
                </TableRow>

                {/* Prices deliberately appear last: each verified retailer chip opens its source listing. */}
                <TableRow>
                  <TableCell className="font-semibold text-foreground-muted">Retailer Prices</TableCell>
                  {items.map((item) => <TableCell key={item.product.id} className="space-y-2"><div className="flex items-center gap-2 text-xs"><span className="font-mono font-bold text-foreground">{item.unitPriceLabel}</span>{item.isBestPriceOverall ? <Badge variant="sage" className="text-[0.6rem]">Best unit price</Badge> : null}{item.isBestValueOverall ? <Badge variant="clay" className="text-[0.6rem]">Best value</Badge> : null}</div><RetailerPriceLinks listings={item.listings} /></TableCell>)}
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* MOBILE RESPONSIVE COMPARISON (< 768px) */}
          <div className="block md:hidden space-y-6">
            {items.map((item) => (
              <div key={item.product.id} className="rounded-2xl border border-line bg-background-card p-5 space-y-4 shadow-subtle relative">
                <button
                  onClick={() => handleRemove(item.product.id)}
                  className="absolute top-4 right-4 text-foreground-faint hover:text-status-error p-1"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="flex items-start gap-4 pr-7">
                  <div className="relative h-20 w-20 rounded overflow-hidden bg-background-elevated flex-shrink-0 border border-line">
                    <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs uppercase font-bold text-foreground-faint block">{item.product.brand}</span>
                    <h3 className="font-display font-semibold text-foreground text-sm line-clamp-2">{item.product.name}</h3>
                    <span className="font-mono font-bold text-sage-deep text-base block mt-1">
                      {item.bestPriceListing?.price ? `₹${item.bestPriceListing.price}` : "Unavailable"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs border-t border-line pt-3">
                  <div>
                    <span className="text-foreground-faint block">Unit Cost</span>
                    <strong className="font-mono text-foreground">{item.unitPriceLabel}</strong>
                  </div>
                  <div>
                    <span className="text-foreground-faint block">Rating</span>
                    <strong className="font-mono text-foreground">{item.product.rating ? `${item.product.rating}★` : "N/A"}</strong>
                  </div>
                  <div>
                    <span className="text-foreground-faint block">Skin Match</span>
                    <strong className="font-mono text-sage-deep">{item.suitabilityMatch ? `${item.suitabilityMatch}%` : "N/A"}</strong>
                  </div>
                  <div>
                    <span className="text-foreground-faint block">VFM Score</span>
                    <strong className="font-mono text-clay">{item.vfmIndex}/100</strong>
                  </div>
                </div>

                <div className="border-t border-line pt-3 text-xs space-y-1">
                  <span className="font-semibold text-foreground block">Key Actives:</span>
                  <div className="flex flex-wrap gap-1">
                    {item.product.keyIngredients.map((i) => (
                      <Badge key={i} variant="default" className="text-[0.65rem]">{i}</Badge>
                    ))}
                  </div>
                </div>

                <div className="border-t border-line pt-3 text-xs space-y-2">
                  <div className="flex items-center justify-between"><span className="font-semibold text-foreground">Retailer prices</span><span className="font-mono text-foreground-faint">{item.unitPriceLabel}</span></div>
                  <RetailerPriceLinks listings={item.listings} />
                </div>
              </div>
            ))}
          </div>

          {/* COMPARISON HISTORY SECTION */}
          {history.length > 0 && (
            <div className="rounded-lg border border-line bg-background-card p-6 space-y-4 shadow-subtle">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                  <Clock className="h-5 w-5 text-sage-deep" /> Comparison History
                </h3>
                <Button variant="ghost" size="sm" onClick={handleClearHistory}>
                  Clear History
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {history.map((sess) => (
                  <div
                    key={sess.id}
                    onClick={() => handleReopenSession(sess)}
                    className="p-4 rounded border border-line bg-background-elevated/50 hover:border-sage-deep cursor-pointer transition-all space-y-2 relative group"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-foreground-faint">
                        {new Date(sess.createdAt).toLocaleDateString("en-IN")}
                      </span>
                      <button
                        onClick={(e) => handleDeleteSession(sess.id, e)}
                        className="text-foreground-faint hover:text-status-error opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <p className="font-display font-semibold text-foreground text-sm line-clamp-1">
                      {sess.productNames?.join(" vs ") || sess.criteria}
                    </p>

                    <span className="text-xs font-semibold text-sage-deep flex items-center gap-1">
                      Reopen Matrix <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* QUICK ADD PRODUCT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-lg border border-line bg-background-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="font-display text-lg font-bold text-foreground">
                Add Product to Comparison Matrix
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-foreground-faint hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <input
              type="text"
              placeholder="Search product name, brand, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded border border-line bg-background-elevated px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-sage-deep"
            />

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {filteredCatalog.length === 0 ? (
                <p className="text-xs text-foreground-faint py-4 text-center">No available products match your search query.</p>
              ) : (
                filteredCatalog.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleAddProduct(p.id)}
                    className="flex items-center justify-between p-2.5 rounded border border-line hover:border-sage-deep hover:bg-sage-tint/20 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 rounded overflow-hidden bg-background-elevated flex-shrink-0">
                        <Image src={p.image} alt={p.name} fill className="object-cover" />
                      </div>
                      <div>
                        <span className="text-[0.65rem] uppercase font-bold text-foreground-faint block">{p.brand}</span>
                        <h4 className="font-display text-xs font-semibold text-foreground line-clamp-1">{p.name}</h4>
                      </div>
                    </div>
                    <Button variant="accent" size="sm">
                      Add
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
