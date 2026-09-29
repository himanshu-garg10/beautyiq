"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useSkinProfile } from "@/context/skin-profile-context";
import { useComparison } from "@/context/comparison-context";
import { useToast } from "@/context/toast-context";
import { RecommendationEngineService } from "@/services/recommendation-engine.service";
import { AIRequirementService } from "@/services/ai-requirement.service";
import { WishlistService } from "@/services/wishlist.service";
import { RecentlyViewedService } from "@/services/recently-viewed.service";
import { SearchHistoryService } from "@/services/search-history.service";
import { RecommendationHistoryService } from "@/services/recommendation-history.service";
import { ComparisonService } from "@/services/comparison.service";
import type {
  Product,
  ScoredProduct,
  SearchHistoryItem,
  RecommendationHistoryItem,
  ComparisonSession,
} from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ProductCard } from "@/components/product/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Sparkles,
  Search,
  Package,
  Scale,
  Heart,
  User,
  Clock,
  ArrowRight,
  ShieldCheck,
  Star,
  CheckCircle2,
  Tag,
  Eye,
  RotateCcw,
  Sliders,
  ExternalLink,
  Zap,
} from "lucide-react";

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { user, toggleWishlist } = useAuth();
  const { profile } = useSkinProfile();
  const { addToComparison, isInComparison } = useComparison();
  const { addToast } = useToast();

  const [greeting, setGreeting] = React.useState("Welcome");
  const [topRecommendations, setTopRecommendations] = React.useState<ScoredProduct[]>([]);
  const [loadingRecs, setLoadingRecs] = React.useState(true);

  // Activity tab state
  const [activeActivityTab, setActiveActivityTab] = React.useState<
    "wishlist" | "viewed" | "searches" | "recommendations" | "comparisons"
  >("wishlist");

  // Activity data
  const [wishlistProducts, setWishlistProducts] = React.useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = React.useState<{ product: Product; viewedAt: string }[]>([]);
  const [recentSearches, setRecentSearches] = React.useState<SearchHistoryItem[]>([]);
  const [recentRecs, setRecentRecs] = React.useState<RecommendationHistoryItem[]>([]);
  const [recentComparisons, setRecentComparisons] = React.useState<ComparisonSession[]>([]);

  // Time-aware greeting
  React.useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  // Calculate profile completion percentage
  const profileCompletionPercent = React.useMemo(() => {
    if (!profile) return 0;
    let points = 0;
    if (profile.skinType) points += 20;
    if (profile.concerns && profile.concerns.length > 0) points += 20;
    if (profile.goals && profile.goals.length > 0) points += 15;
    if (profile.sensitivityLevel) points += 15;
    if (profile.budget) points += 15;
    if (profile.texturePreference) points += 15;
    return Math.min(points, 100);
  }, [profile]);

  // Load recommendations using real recommendation engine
  React.useEffect(() => {
    if (!user) return;
    setLoadingRecs(true);

    const reqObj = AIRequirementService.createEmptyRequirementObject("Personalized Routine Picks");
    reqObj.skinType = profile.skinType || "Combination";
    reqObj.concerns = profile.concerns.length > 0 ? [...profile.concerns] : ["Acne", "Visible pores"];

    RecommendationEngineService.generateRecommendations({
      requirements: reqObj,
      priority: "best-match",
      userProfile: profile,
    }).then((res) => {
      if (res.data) {
        const top = [
          res.data.bestOverall,
          res.data.bestForMainConcern,
          res.data.bestBudgetOption,
        ].filter((p): p is ScoredProduct => p !== null && p !== undefined);

        setTopRecommendations(top);
      }
      setLoadingRecs(false);
    });
  }, [user, profile]);

  // Load activity data
  React.useEffect(() => {
    if (!user) return;
    const refreshData = () => {
      WishlistService.getWishlist(user.id).then((res) => {
        if (res.data) setWishlistProducts(res.data);
      });
      setRecentlyViewed(RecentlyViewedService.getRecentlyViewedDetails().slice(0, 4));
      setRecentSearches(SearchHistoryService.getSearchHistory(user.id).slice(0, 5));
      setRecentRecs(RecommendationHistoryService.getRecommendationHistory(user.id).slice(0, 4));
      setRecentComparisons(ComparisonService.getComparisonHistory(user.id).slice(0, 4));
    };

    refreshData();
    window.addEventListener("beautyiq_wishlist_update", refreshData);
    window.addEventListener("beautyiq_notification_update", refreshData);
    return () => {
      window.removeEventListener("beautyiq_wishlist_update", refreshData);
      window.removeEventListener("beautyiq_notification_update", refreshData);
    };
  }, [user, user?.wishlistIds]);

  const handleCompareProduct = (id: string, name: string) => {
    if (isInComparison(id)) {
      addToast({ type: "info", title: "Already Added", description: `${name} is in your comparison matrix.` });
      router.push("/compare");
    } else {
      const added = addToComparison(id);
      if (added) {
        router.push("/compare");
      }
    }
  };

  const quickActions = [
    {
      title: "AI Requirements",
      description: "Extract structured parameters from natural language",
      href: "/ai-search",
      icon: Sparkles,
      color: "text-sage-deep",
      badge: "Intelligent",
    },
    {
      title: "Browse Products",
      description: "Explore catalog by category, brand, and ingredient",
      href: "/products",
      icon: Package,
      color: "text-clay",
      badge: "Catalog",
    },
    {
      title: "My Recommendations",
      description: "View ranked skincare matches for your profile",
      href: "/recommendations",
      icon: Zap,
      color: "text-sage-deep",
      badge: "Personalized",
    },
    {
      title: "Compare Products",
      description: "Side-by-side matrices with normalized costs",
      href: "/compare",
      icon: Scale,
      color: "text-foreground",
      badge: "2-5 Items",
    },
    {
      title: "Saved Wishlist",
      description: "Access saved products and monitored prices",
      href: "/wishlist",
      icon: Heart,
      color: "text-rose-500",
      badge: `${wishlistProducts.length} Saved`,
    },
    {
      title: "Edit Skin Profile",
      description: "Adjust skin type, concerns, and tolerance",
      href: "/profile",
      icon: Sliders,
      color: "text-sage-deep",
      badge: `${profileCompletionPercent}% Complete`,
    },
  ];

  return (
    <div className="space-y-10 max-w-6xl pb-16">
      {/* 1. WELCOME COMMAND CENTER HEADER */}
      <div className="rounded-xl border border-line bg-gradient-to-br from-background-card via-background-card to-sage-tint/20 p-6 md:p-8 shadow-subtle relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="sage" className="flex items-center gap-1 font-semibold text-xs">
                <ShieldCheck className="h-3.5 w-3.5" /> Skincare Command Center
              </Badge>
              <span className="text-xs font-mono text-foreground-faint">
                {new Date().toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })}
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              {greeting}, {user?.name?.split(" ")[0] || "Skincare Enthusiast"}
            </h1>

            <p className="text-sm text-foreground-muted leading-relaxed">
              Your personalized skin profile is continuously shaping recommendations, ingredient safety evaluations,
              and cross-platform value calculations across BeautyIQ.
            </p>
          </div>

          {/* Profile Summary Card */}
          <div className="w-full lg:w-80 rounded-lg border border-line bg-background/90 backdrop-blur-xs p-4 shadow-xs space-y-3 shrink-0">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground-muted uppercase tracking-wider text-[0.68rem]">
                Profile Completion
              </span>
              <span className="font-mono font-bold text-sage-deep">{profileCompletionPercent}%</span>
            </div>

            <Progress value={profileCompletionPercent} variant="sage" size="sm" />

            <div className="space-y-1.5 pt-1 text-xs border-t border-line/60">
              <div className="flex items-center justify-between">
                <span className="text-foreground-faint">Skin Type:</span>
                <strong className="font-semibold text-foreground">{profile.skinType || "Not specified"}</strong>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-foreground-faint shrink-0">Main Concerns:</span>
                <div className="flex flex-wrap gap-1 justify-end">
                  {profile.concerns.length > 0 ? (
                    profile.concerns.slice(0, 2).map((c) => (
                      <span key={c} className="text-[0.65rem] px-1.5 py-0.5 rounded bg-clay/10 text-clay font-medium">
                        {c}
                      </span>
                    ))
                  ) : (
                    <span className="text-foreground-muted text-[0.7rem]">General care</span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-line/60 flex items-center justify-between">
              <Link
                href="/profile"
                className="text-xs font-semibold text-sage-deep hover:underline flex items-center gap-1"
              >
                Edit Skin Profile <ArrowRight className="h-3 w-3" />
              </Link>
              <Link href="/onboarding" className="text-[0.7rem] text-foreground-muted hover:text-foreground">
                Retake Quiz
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. QUICK ACTIONS GRID */}
      <div className="space-y-4">
        <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
          <Zap className="h-5 w-5 text-sage-deep" /> Skincare Actions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                href={action.href}
                className="group rounded-lg border border-line bg-background-card p-5 shadow-subtle hover:shadow-md hover:border-sage-deep/60 transition-all duration-200 flex flex-col justify-between relative overflow-hidden"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-lg bg-background-elevated flex items-center justify-center border border-line group-hover:bg-sage-tint/30 transition-colors">
                      <Icon className={`h-5 w-5 ${action.color}`} />
                    </div>
                    <Badge variant="default" className="text-[0.65rem] py-0 px-2 font-mono">
                      {action.badge}
                    </Badge>
                  </div>

                  <h3 className="font-display font-semibold text-foreground text-base group-hover:text-sage-deep transition-colors">
                    {action.title}
                  </h3>

                  <p className="text-xs text-foreground-muted line-clamp-2 leading-relaxed">
                    {action.description}
                  </p>
                </div>

                <div className="pt-4 mt-2 flex items-center text-xs font-semibold text-sage-deep gap-1">
                  <span>Open {action.title}</span>
                  <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 3. PERSONALIZED RECOMMENDATIONS PREVIEW */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-3">
          <div>
            <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-sage-deep" /> Personalized Recommendations for You
            </h2>
            <p className="text-xs text-foreground-muted">
              Evaluated deterministically against your {profile.skinType || "Combination"} skin profile parameters.
            </p>
          </div>

          <Link href="/recommendations">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
              View All Recommendations
            </Button>
          </Link>
        </div>

        {loadingRecs ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 rounded-lg border border-line bg-background-card animate-pulse" />
            ))}
          </div>
        ) : topRecommendations.length === 0 ? (
          <EmptyState
            title="No Active Recommendations"
            description="Run an AI requirement search or complete your skin questionnaire to unlock precision recommendations."
            actionLabel="Start AI Search"
            onAction={() => router.push("/ai-search")}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topRecommendations.map((scored) => {
              const p = scored.product;
              return (
                <div
                  key={p.id}
                  className="rounded-lg border border-line bg-background-card overflow-hidden shadow-subtle hover:border-line-strong transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3 p-4">
                    {/* Top category label & match score */}
                    <div className="flex items-center justify-between">
                      <Badge variant="sage" className="text-[0.68rem] font-bold">
                        {scored.reasons[0]?.includes("rating")
                          ? "Highest Customer Rated"
                          : scored.reasons[0]?.includes("budget") || scored.reasons[0]?.includes("price")
                          ? "Best Budget Value"
                          : "Top Overall Match"}
                      </Badge>
                      <span className="font-mono font-bold text-xs text-sage-deep">
                        {scored.scoreBreakdown.overallScore}% Match
                      </span>
                    </div>

                    {/* Image & Title */}
                    <div className="flex items-start gap-3">
                      <Link
                        href={`/products/${p.id}`}
                        className="relative h-20 w-20 rounded-md overflow-hidden bg-background-elevated border border-line shrink-0 block"
                      >
                        <Image src={p.image} alt={p.name} fill className="object-cover" />
                      </Link>
                      <div className="space-y-1">
                        <span className="text-[0.68rem] uppercase font-bold text-foreground-faint block">
                          {p.brand}
                        </span>
                        <Link href={`/products/${p.id}`}>
                          <h4 className="font-display text-xs font-semibold text-foreground hover:text-sage-deep transition-colors line-clamp-2">
                            {p.name}
                          </h4>
                        </Link>
                        <span className="font-mono text-sm font-bold text-foreground block">
                          ₹{scored.bestListing?.price || 499}
                        </span>
                      </div>
                    </div>

                    {/* Match highlights */}
                    <div className="space-y-1 text-xs border-t border-line/60 pt-2 text-foreground-muted">
                      <div className="flex items-center gap-1.5 text-[0.72rem]">
                        <CheckCircle2 className="h-3.5 w-3.5 text-sage-deep shrink-0" />
                        <span>Skin: {profile.skinType || "Normal"} ({scored.scoreBreakdown.skinTypeScore}%)</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[0.72rem]">
                        <CheckCircle2 className="h-3.5 w-3.5 text-sage-deep shrink-0" />
                        <span className="line-clamp-1">{scored.reasons[0] || "Compatible active ingredients"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card actions */}
                  <div className="p-3 border-t border-line bg-background-elevated/40 flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs flex-1"
                      onClick={() => handleCompareProduct(p.id, p.name)}
                    >
                      <Scale className="h-3 w-3 mr-1" /> Compare
                    </Button>
                    <Button
                      variant="accent"
                      size="sm"
                      className="text-xs flex-1"
                      onClick={() => router.push(`/products/${p.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. CUSTOMER ACTIVITY HUB (SEGMENTED TABS) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-3">
          <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
            <Clock className="h-5 w-5 text-sage-deep" /> Recent Customer Activity
          </h2>
          <Link href="/history" className="text-xs font-semibold text-sage-deep hover:underline">
            Manage Complete Activity History →
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs border-b border-line/60">
          <button
            onClick={() => setActiveActivityTab("wishlist")}
            className={`px-3 py-1.5 rounded-full font-semibold transition-colors flex items-center gap-1.5 shrink-0 ${
              activeActivityTab === "wishlist"
                ? "bg-sage-deep text-white"
                : "text-foreground-muted hover:bg-background-elevated hover:text-foreground"
            }`}
          >
            <Heart className="h-3.5 w-3.5" /> Wishlist ({wishlistProducts.length})
          </button>
          <button
            onClick={() => setActiveActivityTab("viewed")}
            className={`px-3 py-1.5 rounded-full font-semibold transition-colors flex items-center gap-1.5 shrink-0 ${
              activeActivityTab === "viewed"
                ? "bg-sage-deep text-white"
                : "text-foreground-muted hover:bg-background-elevated hover:text-foreground"
            }`}
          >
            <Eye className="h-3.5 w-3.5" /> Recently Viewed ({recentlyViewed.length})
          </button>
          <button
            onClick={() => setActiveActivityTab("searches")}
            className={`px-3 py-1.5 rounded-full font-semibold transition-colors flex items-center gap-1.5 shrink-0 ${
              activeActivityTab === "searches"
                ? "bg-sage-deep text-white"
                : "text-foreground-muted hover:bg-background-elevated hover:text-foreground"
            }`}
          >
            <Search className="h-3.5 w-3.5" /> Recent Searches ({recentSearches.length})
          </button>
          <button
            onClick={() => setActiveActivityTab("recommendations")}
            className={`px-3 py-1.5 rounded-full font-semibold transition-colors flex items-center gap-1.5 shrink-0 ${
              activeActivityTab === "recommendations"
                ? "bg-sage-deep text-white"
                : "text-foreground-muted hover:bg-background-elevated hover:text-foreground"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" /> Recommendations ({recentRecs.length})
          </button>
          <button
            onClick={() => setActiveActivityTab("comparisons")}
            className={`px-3 py-1.5 rounded-full font-semibold transition-colors flex items-center gap-1.5 shrink-0 ${
              activeActivityTab === "comparisons"
                ? "bg-sage-deep text-white"
                : "text-foreground-muted hover:bg-background-elevated hover:text-foreground"
            }`}
          >
            <Scale className="h-3.5 w-3.5" /> Comparisons ({recentComparisons.length})
          </button>
        </div>

        {/* Tab 1: Saved Wishlist */}
        {activeActivityTab === "wishlist" && (
          <div>
            {wishlistProducts.length === 0 ? (
              <div className="p-8 rounded-lg border border-line bg-background-card text-center text-xs space-y-2">
                <Heart className="h-8 w-8 text-foreground-faint mx-auto" />
                <strong className="block text-foreground text-sm">No Saved Products Yet</strong>
                <p className="text-foreground-muted max-w-sm mx-auto">
                  Save skincare products while browsing to keep track of prices, availability, and compare side-by-side.
                </p>
                <Link href="/products" className="inline-block pt-2">
                  <Button variant="accent" size="sm">
                    Browse Products Catalog
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {wishlistProducts.slice(0, 4).map((p) => (
                  <div key={p.id} className="relative group">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Recently Viewed */}
        {activeActivityTab === "viewed" && (
          <div>
            {recentlyViewed.length === 0 ? (
              <div className="p-8 rounded-lg border border-line bg-background-card text-center text-xs space-y-2">
                <Eye className="h-8 w-8 text-foreground-faint mx-auto" />
                <strong className="block text-foreground text-sm">No Recently Viewed Products</strong>
                <p className="text-foreground-muted">Products you inspect across the catalog will appear here automatically.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentlyViewed.map(({ product: p, viewedAt }) => (
                  <div
                    key={p.id}
                    className="rounded-lg border border-line bg-background-card p-3 space-y-2 shadow-subtle hover:border-line-strong transition-colors"
                  >
                    <Link href={`/products/${p.id}`} className="relative h-28 w-full block rounded overflow-hidden bg-background-elevated">
                      <Image src={p.image} alt={p.name} fill className="object-cover" />
                    </Link>
                    <div>
                      <span className="text-[0.65rem] uppercase font-bold text-foreground-faint block">{p.brand}</span>
                      <Link href={`/products/${p.id}`}>
                        <h4 className="font-display text-xs font-semibold text-foreground line-clamp-1 hover:text-sage-deep">
                          {p.name}
                        </h4>
                      </Link>
                      <div className="flex items-center justify-between pt-1">
                        <span className="font-mono text-xs font-bold text-foreground">₹{p.quantity ? 525 : 499}</span>
                        <span className="text-[0.65rem] text-foreground-faint font-mono">Viewed {viewedAt.split(" ")[0]}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Recent Searches */}
        {activeActivityTab === "searches" && (
          <div className="space-y-2">
            {recentSearches.length === 0 ? (
              <div className="p-8 rounded-lg border border-line bg-background-card text-center text-xs text-foreground-muted">
                No search history recorded yet.
              </div>
            ) : (
              recentSearches.map((s) => (
                <div
                  key={s.id}
                  className="p-3.5 rounded-lg border border-line bg-background-card flex items-center justify-between text-xs hover:border-line-strong transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-sage-tint/40 flex items-center justify-center text-sage-deep">
                      <Search className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-medium text-foreground block">&quot;{s.query}&quot;</span>
                      <span className="text-[0.7rem] text-foreground-faint font-mono">
                        {s.timestamp} • {s.searchType.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={s.searchType === "ai-requirement" ? "/ai-search" : `/products?q=${encodeURIComponent(s.query)}`}
                    className="text-xs font-semibold text-sage-deep hover:underline flex items-center gap-1"
                  >
                    Re-run Search <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 4: Recent Recommendations */}
        {activeActivityTab === "recommendations" && (
          <div className="space-y-2">
            {recentRecs.length === 0 ? (
              <div className="p-8 rounded-lg border border-line bg-background-card text-center text-xs text-foreground-muted">
                No past recommendation sessions found.
              </div>
            ) : (
              recentRecs.map((r) => (
                <div
                  key={r.id}
                  className="p-3.5 rounded-lg border border-line bg-background-card flex items-center justify-between text-xs hover:border-line-strong transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-sage-tint/40 flex items-center justify-center text-sage-deep">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-foreground block">{r.querySummary}</span>
                      <span className="text-[0.7rem] text-foreground-faint font-mono">
                        {r.timestamp} • {r.totalRecommendations} recommendations ranked
                      </span>
                    </div>
                  </div>

                  <Link href="/recommendations" className="text-xs font-semibold text-sage-deep hover:underline flex items-center gap-1">
                    Open Results <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 5: Recent Comparisons */}
        {activeActivityTab === "comparisons" && (
          <div className="space-y-2">
            {recentComparisons.length === 0 ? (
              <div className="p-8 rounded-lg border border-line bg-background-card text-center text-xs text-foreground-muted">
                No product comparisons saved yet. Select 2-5 products to compare them side-by-side.
              </div>
            ) : (
              recentComparisons.map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-lg border border-line bg-background-card flex items-center justify-between text-xs hover:border-line-strong transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-clay/10 flex items-center justify-center text-clay">
                      <Scale className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-foreground block">
                        {c.productNames?.join(" vs ") || `${c.productIds.length} Products Matrix`}
                      </span>
                      <span className="text-[0.7rem] text-foreground-faint font-mono">
                        {c.createdAt.split("T")[0]} • {c.productIds.length} Products Analyzed
                      </span>
                    </div>
                  </div>

                  <Link href="/compare" className="text-xs font-semibold text-sage-deep hover:underline flex items-center gap-1">
                    Reopen Comparison <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
