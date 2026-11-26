"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useSkinProfile } from "@/context/skin-profile-context";
import { useComparison } from "@/context/comparison-context";
import { useToast } from "@/context/toast-context";
import { SearchHistoryService } from "@/services/search-history.service";
import { RecommendationHistoryService } from "@/services/recommendation-history.service";
import { ComparisonService } from "@/services/comparison.service";
import { RecentlyViewedService } from "@/services/recently-viewed.service";
import { AIRequirementService } from "@/services/ai-requirement.service";
import type {
  Product,
  SearchHistoryItem,
  RecommendationHistoryItem,
  ComparisonSession,
} from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  History,
  Search,
  Sparkles,
  Scale,
  Eye,
  Trash2,
  RotateCcw,
  ArrowRight,
  Clock,
  CheckCircle2,
  ExternalLink,
  Zap,
} from "lucide-react";

export default function CustomerHistoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useSkinProfile();
  const { addToComparison, clearComparison } = useComparison();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = React.useState<"search" | "recommendations" | "comparisons" | "viewed">("search");

  // History state arrays
  const [searches, setSearches] = React.useState<SearchHistoryItem[]>([]);
  const [recommendations, setRecommendations] = React.useState<RecommendationHistoryItem[]>([]);
  const [comparisons, setComparisons] = React.useState<ComparisonSession[]>([]);
  const [viewedProducts, setViewedProducts] = React.useState<{ product: Product; viewedAt: string }[]>([]);

  const loadAllHistory = React.useCallback(() => {
    if (!user) return;
    setSearches(SearchHistoryService.getSearchHistory(user.id));
    setRecommendations(RecommendationHistoryService.getRecommendationHistory(user.id));
    setComparisons(ComparisonService.getComparisonHistory(user.id));
    setViewedProducts(RecentlyViewedService.getRecentlyViewedDetails(user.id));
  }, [user]);

  React.useEffect(() => {
    loadAllHistory();
  }, [loadAllHistory]);

  // Search History actions
  const handleDeleteSearch = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    const updated = SearchHistoryService.deleteSearch(user.id, id);
    setSearches(updated);
    addToast({ type: "info", title: "Search Removed", description: "Search query removed from your history." });
  };

  const handleClearSearches = () => {
    if (!user) return;
    SearchHistoryService.clearSearchHistory(user.id);
    setSearches([]);
    addToast({ type: "info", title: "Search History Cleared", description: "All search records have been purged." });
  };

  const handleReopenSearch = (item: SearchHistoryItem) => {
    if (item.searchType === "ai-requirement" && item.extractedCriteria) {
      AIRequirementService.saveRequirementSession(item.query, item.extractedCriteria);
      router.push("/recommendations");
    } else {
      router.push(`/products?q=${encodeURIComponent(item.query)}`);
    }
  };

  // Recommendation History actions
  const handleDeleteRec = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    const updated = RecommendationHistoryService.deleteRecommendationSession(user.id, id);
    setRecommendations(updated);
    addToast({ type: "info", title: "Session Removed", description: "Recommendation session removed from history." });
  };

  const handleClearRecs = () => {
    if (!user) return;
    RecommendationHistoryService.clearRecommendationHistory(user.id);
    setRecommendations([]);
    addToast({ type: "info", title: "Recommendations Cleared", description: "All recommendation records cleared." });
  };

  const handleRecalculateRec = async (item: RecommendationHistoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    addToast({ type: "info", title: "Recalculating Match", description: "Updating scores against current products & profile..." });
    const updatedItem = await RecommendationHistoryService.recalculateRecommendationSession(user.id, item.id, profile);
    if (updatedItem) {
      loadAllHistory();
      addToast({ type: "success", title: "Recommendations Refreshed", description: "Newly calculated using active product & profile parameters." });
    }
  };

  const handleOpenRec = (item: RecommendationHistoryItem) => {
    AIRequirementService.saveRequirementSession(item.requirements.rawQuery || item.querySummary, item.requirements);
    router.push("/recommendations");
  };

  // Comparison History actions
  const handleDeleteComp = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    const updated = ComparisonService.deleteComparisonSession(id, user.id);
    setComparisons(updated);
    addToast({ type: "info", title: "Comparison Removed", description: "Comparison matrix removed from history." });
  };

  const handleClearComps = () => {
    if (!user) return;
    ComparisonService.clearComparisonHistory(user.id);
    setComparisons([]);
    addToast({ type: "info", title: "Comparisons Cleared", description: "Comparison history has been cleared." });
  };

  const handleReopenComp = (session: ComparisonSession) => {
    clearComparison();
    session.productIds.forEach((id) => addToComparison(id));
    addToast({ type: "success", title: "Restored Comparison Matrix", description: `Restored ${session.productIds.length} products.` });
    router.push("/compare");
  };

  // Recently Viewed actions
  const handleDeleteViewed = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    RecentlyViewedService.removeViewedItem(productId, user.id);
    setViewedProducts(RecentlyViewedService.getRecentlyViewedDetails(user.id));
    addToast({ type: "info", title: "Item Removed", description: "Product removed from recently viewed history." });
  };

  const handleClearViewed = () => {
    if (!user) return;
    RecentlyViewedService.clearHistory(user.id);
    setViewedProducts([]);
    addToast({ type: "info", title: "History Cleared", description: "Recently viewed history cleared." });
  };

  return (
    <div className="space-y-8 max-w-6xl pb-16">
      {/* Header */}
      <div className="border-b border-line pb-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="sage" className="flex items-center gap-1 font-semibold text-xs">
            <History className="h-3.5 w-3.5" /> Customer Activity Records
          </Badge>
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Skincare Discovery &amp; Activity History
        </h1>
        <p className="text-sm text-foreground-muted mt-1">
          Review, reopen, and manage your searches, AI recommendation sessions, comparison matrices, and recently viewed products.
        </p>
      </div>

      {/* Tabs for 4 Separate History Systems */}
      <div className="flex items-center gap-2 border-b border-line pb-3 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab("search")}
          className={`px-4 py-2 rounded-full font-semibold transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === "search"
              ? "bg-sage-deep text-white shadow-xs"
              : "bg-background-card border border-line text-foreground-muted hover:text-foreground"
          }`}
        >
          <Search className="h-3.5 w-3.5" /> Search History ({searches.length})
        </button>

        <button
          onClick={() => setActiveTab("recommendations")}
          className={`px-4 py-2 rounded-full font-semibold transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === "recommendations"
              ? "bg-sage-deep text-white shadow-xs"
              : "bg-background-card border border-line text-foreground-muted hover:text-foreground"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" /> Recommendation History ({recommendations.length})
        </button>

        <button
          onClick={() => setActiveTab("comparisons")}
          className={`px-4 py-2 rounded-full font-semibold transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === "comparisons"
              ? "bg-sage-deep text-white shadow-xs"
              : "bg-background-card border border-line text-foreground-muted hover:text-foreground"
          }`}
        >
          <Scale className="h-3.5 w-3.5" /> Comparison History ({comparisons.length})
        </button>

        <button
          onClick={() => setActiveTab("viewed")}
          className={`px-4 py-2 rounded-full font-semibold transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === "viewed"
              ? "bg-sage-deep text-white shadow-xs"
              : "bg-background-card border border-line text-foreground-muted hover:text-foreground"
          }`}
        >
          <Eye className="h-3.5 w-3.5" /> Recently Viewed ({viewedProducts.length})
        </button>
      </div>

      {/* TAB 1: SEARCH HISTORY */}
      {activeTab === "search" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground-faint">
              Saved Search Queries ({searches.length})
            </span>
            {searches.length > 0 && (
              <Button variant="ghost" size="sm" leftIcon={<Trash2 className="h-3.5 w-3.5" />} onClick={handleClearSearches}>
                Clear Search History
              </Button>
            )}
          </div>

          {searches.length === 0 ? (
            <EmptyState
              title="No Searches Yet"
              description="Start an AI skincare search or browse by product keyword to see your search history recorded here."
              icon={<Search className="h-8 w-8 text-foreground-faint" />}
              actionLabel="Browse Products"
              onAction={() => router.push("/products")}
            />
          ) : (
            <div className="space-y-3">
              {searches.map((s) => (
                <div
                  key={s.id}
                  onClick={() => handleReopenSearch(s)}
                  className="p-4 rounded-lg border border-line bg-background-card shadow-subtle hover:border-sage-deep hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-full bg-sage-tint/40 flex items-center justify-center text-sage-deep shrink-0 mt-0.5">
                      <Search className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-semibold text-foreground text-sm">&quot;{s.query}&quot;</span>
                        <Badge variant="default" className="text-[0.65rem] font-mono uppercase">
                          {s.searchType}
                        </Badge>
                      </div>

                      {s.extractedCriteria && (
                        <div className="flex flex-wrap gap-1 text-[0.68rem] text-foreground-muted">
                          {s.extractedCriteria.category && (
                            <Badge variant="sage" className="text-[0.65rem] py-0 px-1.5">
                              {s.extractedCriteria.category}
                            </Badge>
                          )}
                          {s.extractedCriteria.skinType && (
                            <Badge variant="default" className="text-[0.65rem] py-0 px-1.5">
                              {s.extractedCriteria.skinType}
                            </Badge>
                          )}
                          {s.extractedCriteria.concerns?.map((c: string) => (
                            <Badge key={c} variant="clay" className="text-[0.65rem] py-0 px-1.5">
                              {c}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <span className="text-[0.7rem] text-foreground-faint font-mono block">
                        Recorded on {s.timestamp}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button variant="outline" size="sm" className="text-xs">
                      Reopen Search <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                    <button
                      onClick={(e) => handleDeleteSearch(s.id, e)}
                      className="text-foreground-faint hover:text-status-error p-1.5 rounded transition-colors"
                      title="Delete search"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RECOMMENDATION HISTORY */}
      {activeTab === "recommendations" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground-faint">
              Past Recommendation Sessions ({recommendations.length})
            </span>
            {recommendations.length > 0 && (
              <Button variant="ghost" size="sm" leftIcon={<Trash2 className="h-3.5 w-3.5" />} onClick={handleClearRecs}>
                Clear Recommendation History
              </Button>
            )}
          </div>

          {recommendations.length === 0 ? (
            <EmptyState
              title="No Recommendation Sessions"
              description="Run the recommendation engine to generate precision matches and save sessions here."
              icon={<Sparkles className="h-8 w-8 text-foreground-faint" />}
              actionLabel="Get Recommendations"
              onAction={() => router.push("/recommendations")}
            />
          ) : (
            <div className="space-y-4">
              {recommendations.map((r) => (
                <div
                  key={r.id}
                  className="p-5 rounded-lg border border-line bg-background-card shadow-subtle space-y-4 hover:border-line-strong transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line/60 pb-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-semibold text-foreground text-base">{r.querySummary}</span>
                        {r.isRecalculated && (
                          <Badge variant="sage" className="text-[0.65rem] font-bold">
                            Recalculated
                          </Badge>
                        )}
                      </div>
                      <span className="text-[0.7rem] text-foreground-faint font-mono">
                        Generated on {r.timestamp} • {r.totalRecommendations} Products Ranked
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
                        onClick={(e) => handleRecalculateRec(r, e)}
                      >
                        Recalculate
                      </Button>
                      <Button
                        variant="accent"
                        size="sm"
                        rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                        onClick={() => handleOpenRec(r)}
                      >
                        Open Results
                      </Button>
                      <button
                        onClick={(e) => handleDeleteRec(r.id, e)}
                        className="text-foreground-faint hover:text-status-error p-1.5 rounded transition-colors"
                        title="Delete session"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Top Recommendation & Categories */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                    {r.topRecommendation && (
                      <div className="flex items-center gap-3 p-3 rounded bg-background-elevated/50 border border-line flex-1">
                        <div className="relative h-12 w-12 rounded overflow-hidden bg-background shrink-0 border border-line">
                          <Image src={r.topRecommendation.image} alt={r.topRecommendation.name} fill className="object-cover" />
                        </div>
                        <div>
                          <span className="text-[0.65rem] uppercase font-bold text-foreground-faint block">
                            Top Recommendation ({r.topRecommendation.score}% Match)
                          </span>
                          <h5 className="font-semibold text-foreground line-clamp-1">{r.topRecommendation.name}</h5>
                          <span className="font-mono font-bold text-sage-deep">₹{r.topRecommendation.price}</span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-1 md:text-right">
                      <span className="text-foreground-faint text-[0.68rem] uppercase font-bold block">
                        Included Categories:
                      </span>
                      <div className="flex flex-wrap gap-1 md:justify-end">
                        {r.categories.map((c) => (
                          <Badge key={c} variant="default" className="text-[0.65rem]">
                            {c}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: COMPARISON HISTORY */}
      {activeTab === "comparisons" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground-faint">
              Saved Comparison Matrices ({comparisons.length})
            </span>
            {comparisons.length > 0 && (
              <Button variant="ghost" size="sm" leftIcon={<Trash2 className="h-3.5 w-3.5" />} onClick={handleClearComps}>
                Clear Comparison History
              </Button>
            )}
          </div>

          {comparisons.length === 0 ? (
            <EmptyState
              title="No Comparison History"
              description="Compare 2 to 5 skincare products side-by-side to save comparison sessions here for future review."
              icon={<Scale className="h-8 w-8 text-foreground-faint" />}
              actionLabel="Go to Comparison"
              onAction={() => router.push("/compare")}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {comparisons.map((sess) => (
                <div
                  key={sess.id}
                  className="p-5 rounded-lg border border-line bg-background-card shadow-subtle space-y-4 hover:border-sage-deep transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <Badge variant="sage" className="font-mono text-[0.65rem]">
                        {sess.productIds.length} Products Matrix
                      </Badge>
                      <button
                        onClick={(e) => handleDeleteComp(sess.id, e)}
                        className="text-foreground-faint hover:text-status-error p-1 transition-colors"
                        title="Delete comparison session"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <h3 className="font-display font-semibold text-foreground text-sm line-clamp-2">
                      {sess.productNames?.join(" vs ") || sess.criteria}
                    </h3>

                    <span className="text-[0.7rem] text-foreground-faint font-mono block">
                      Created on {new Date(sess.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-line/60 flex items-center justify-between">
                    <span className="text-xs text-foreground-muted font-medium">Restores 2-5 items</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs font-semibold"
                      rightIcon={<ArrowRight className="h-3 w-3" />}
                      onClick={() => handleReopenComp(sess)}
                    >
                      Reopen Matrix
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: RECENTLY VIEWED */}
      {activeTab === "viewed" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground-faint">
              Recently Inspected Products ({viewedProducts.length})
            </span>
            {viewedProducts.length > 0 && (
              <Button variant="ghost" size="sm" leftIcon={<Trash2 className="h-3.5 w-3.5" />} onClick={handleClearViewed}>
                Clear Recently Viewed
              </Button>
            )}
          </div>

          {viewedProducts.length === 0 ? (
            <EmptyState
              title="No Recently Viewed Products"
              description="Products you open from the catalog or recommendations will appear here automatically."
              icon={<Eye className="h-8 w-8 text-foreground-faint" />}
              actionLabel="Browse Products"
              onAction={() => router.push("/products")}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {viewedProducts.map(({ product: p, viewedAt }) => (
                <div
                  key={p.id}
                  className="rounded-lg border border-line bg-background-card p-4 space-y-3 shadow-subtle hover:border-line-strong transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[0.65rem] text-foreground-faint font-mono">Viewed {viewedAt}</span>
                      <button
                        onClick={(e) => handleDeleteViewed(p.id, e)}
                        className="text-foreground-faint hover:text-status-error p-1"
                        title="Remove from history"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <Link href={`/products/${p.id}`} className="relative h-44 w-full block rounded overflow-hidden bg-background-elevated border border-line">
                      <Image src={p.image} alt={p.name} fill className="object-cover" />
                    </Link>

                    <div>
                      <span className="text-[0.68rem] uppercase font-bold text-foreground-faint block">{p.brand}</span>
                      <Link href={`/products/${p.id}`}>
                        <h4 className="font-display text-sm font-semibold text-foreground hover:text-sage-deep line-clamp-2">
                          {p.name}
                        </h4>
                      </Link>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-line/60 flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-foreground">₹{p.quantity ? 525 : 499}</span>
                    <Button variant="accent" size="sm" onClick={() => router.push(`/products/${p.id}`)}>
                      View Product
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
