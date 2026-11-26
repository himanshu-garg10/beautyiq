"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { RecommendationEngineService } from "@/services/recommendation-engine.service";
import { AIRequirementService } from "@/services/ai-requirement.service";
import { RecommendationHistoryService } from "@/services/recommendation-history.service";
import { NotificationService } from "@/services/notification.service";
import { useSkinProfile } from "@/context/skin-profile-context";
import { useAuth } from "@/context/auth-context";
import type {
  StructuredSkincareRequirement,
  RecommendationPriority,
  RecommendationResultSet,
  ScoredProduct,
  RoutineStep,
  SkinType,
} from "@/types";
import { Container } from "@/components/layout/container";
import { ProductCard } from "@/components/product/product-card";
import { ScoreBreakdownModal } from "@/components/recommendations/score-breakdown-modal";
import { RecommendationFeedbackWidget } from "@/components/recommendations/recommendation-feedback-widget";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Sparkles,
  Award,
  Target,
  FlaskConical,
  DollarSign,
  Star,
  Zap,
  SlidersHorizontal,
  Edit3,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Info,
  TestTube,
  BarChart2,
} from "lucide-react";

const priorityOptions = [
  { value: "best-match", label: "Best Overall Match" },
  { value: "lowest-price", label: "Lowest Price First" },
  { value: "best-rated", label: "Highest Customer Rated" },
  { value: "preferred-brand", label: "Preferred Brand First" },
  { value: "minimal-ingredients", label: "Minimal Ingredients Formulation" },
];

const loadingSteps = [
  "Checking your requirements & hard constraints...",
  "Filtering candidate skincare products...",
  "Matching active ingredients & formula properties...",
  "Calculating deterministic compatibility scores...",
  "Ranking products into recommendation categories...",
];

function RecommendationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile } = useSkinProfile();
  const { user } = useAuth();

  const [priority, setPriority] = React.useState<RecommendationPriority>("best-match");
  const [requirement, setRequirement] = React.useState<StructuredSkincareRequirement | null>(null);
  const [result, setResult] = React.useState<RecommendationResultSet | null>(null);
  const [activeTab, setActiveTab] = React.useState<"all" | "categories">("all");
  const [selectedProductForBreakdown, setSelectedProductForBreakdown] = React.useState<ScoredProduct | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [loadingStepIndex, setLoadingStepIndex] = React.useState(0);

  // Initialize requirements from session history, URL params, or active profile
  React.useEffect(() => {
    // Check confirmed AI requirement history first
    const history = AIRequirementService.getRequirementHistory();
    if (history.length > 0 && history[0].confirmedRequirements) {
      setRequirement(history[0].confirmedRequirements);
      return;
    }

    // Otherwise build requirement from URL query params
    const categoryParam = searchParams?.get("category") as RoutineStep | null;
    const skinTypeParam = searchParams?.get("skinType") as SkinType | null;
    const maxPriceParam = searchParams?.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!, 10) : null;
    const qParam = searchParams?.get("q") || "";

    const reqObj = AIRequirementService.createEmptyRequirementObject(qParam || "Custom Search Request");
    reqObj.category = categoryParam || "Serum";
    reqObj.skinType = skinTypeParam || profile.skinType || "Oily";
    reqObj.maxPrice = maxPriceParam || 1200;
    if (profile.concerns.length > 0) reqObj.concerns = [...profile.concerns];

    setRequirement(reqObj);
  }, [searchParams, profile]);

  // Execute deterministic recommendation engine whenever requirement or priority changes
  const runRecommendationEngine = React.useCallback(async () => {
    if (!requirement) return;

    setLoading(true);
    for (let i = 0; i < loadingSteps.length; i++) {
      setLoadingStepIndex(i);
      await new Promise((resolve) => setTimeout(resolve, 80));
    }

    RecommendationEngineService.generateRecommendations({
      requirements: requirement,
      priority,
      userProfile: profile,
    }).then((res) => {
      if (res.data) {
        setResult(res.data);
        const uid = user?.id || "u1";
        RecommendationHistoryService.saveRecommendationSession(uid, requirement, res.data, profile);
        NotificationService.createNotification(uid, {
          type: "RECOMMENDATION_GENERATED",
          title: "New Recommendations Generated",
          message: `Precision recommendations ranked for ${requirement.category || "your skincare needs"}.`,
          link: "/recommendations",
        });
      }
      setLoading(false);
    });
  }, [requirement, priority, profile, user]);

  React.useEffect(() => {
    if (requirement) {
      runRecommendationEngine();
    }
  }, [requirement, runRecommendationEngine]);

  const currentSessionId = `rec_${Date.now()}`;

  return (
    <Container className="py-6 md:py-8 space-y-6 max-w-6xl">
      <div className="flex justify-end border-b border-line pb-4">
          <Link href="/">
            <Button variant="accent" size="sm" leftIcon={<Edit3 className="h-4 w-4" />}>
              Edit Requirements
            </Button>
          </Link>
      </div>

      {/* Requirement Summary Header Bar (Requirement #40) */}
      {requirement && (
        <div className="rounded-2xl border border-line bg-background-card p-5 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 text-xs">
            <span className="font-semibold text-foreground-faint uppercase tracking-wider block">
              Active Structured Requirements:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {requirement.skinType && <Badge variant="sage">Skin: {requirement.skinType}</Badge>}
              {requirement.category && <Badge variant="default">Category: {requirement.category}</Badge>}
              {requirement.maxPrice && <Badge variant="default">Max Price: ₹{requirement.maxPrice}</Badge>}
              {requirement.concerns.map((c) => (
                <Badge key={c} variant="clay">Concern: {c}</Badge>
              ))}
              {requirement.preferredIngredients.map((ing) => (
                <Badge key={ing} variant="sage">Active: {ing}</Badge>
              ))}
              {requirement.avoidIngredients.map((ing) => (
                <Badge key={ing} variant="warning">Avoid: {ing}</Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="w-48">
              <Select
                options={priorityOptions}
                value={priority}
                onChange={(e) => setPriority(e.target.value as RecommendationPriority)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Multi-Stage Loading Experience (Requirement #41) */}
      {loading && (
        <div className="rounded-lg border border-line bg-background-card p-12 text-center space-y-6 shadow-md">
          <div className="relative h-16 w-16 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-sage-tint border-t-sage-deep animate-spin" />
            <Sparkles className="h-6 w-6 text-sage-deep" />
          </div>

          <div className="space-y-2">
            <h3 className="font-display text-xl font-bold text-foreground">
              {loadingSteps[loadingStepIndex]}
            </h3>
            <p className="text-xs text-foreground-muted font-mono">
              Running BeautyIQ Hard Constraints &amp; Score Calculation...
            </p>
          </div>

          <div className="max-w-md mx-auto h-2 bg-background-elevated rounded-full overflow-hidden">
            <div
              className="h-full bg-sage-deep transition-all duration-300"
              style={{ width: `${((loadingStepIndex + 1) / loadingSteps.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* NO EXACT MATCH View with Requirement Relaxation (Requirement #30 & #31) */}
      {!loading && result && result.status === "NO_EXACT_MATCH" && (
        <div className="space-y-8">
          <div className="rounded-lg border border-amber-300 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-6 space-y-4 shadow-subtle">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-lg">
              <AlertTriangle className="h-5 w-5" /> No Exact Match Found for All Hard Constraints
            </div>
            <p className="text-xs text-foreground leading-relaxed">
              No products in our current database satisfy 100% of your explicit hard constraints (Category: <strong>{requirement?.category}</strong>, Max Budget: <strong>₹{requirement?.maxPrice}</strong>, Excluded Ingredients: <strong>{requirement?.avoidIngredients.join(", ") || "None"}</strong>).
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link href="/">
                <Button variant="accent" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />}>
                  Adjust &amp; Relax Requirements
                </Button>
              </Link>
            </div>
          </div>

          {/* Relaxed Requirement Alternatives */}
          {result.relaxedAlternatives.map((relaxed, idx) => (
            <div key={idx} className="space-y-4 border-t border-line pt-6">
              <div className="rounded bg-background-elevated p-4 space-y-1">
                <span className="font-semibold text-xs text-sage-deep uppercase tracking-wider block">
                  Relaxed Requirement Alternative #{idx + 1}: {relaxed.requirementField}
                </span>
                <p className="text-xs text-foreground-muted">
                  {relaxed.reason}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relaxed.relaxedProducts.map((sp) => (
                  <div key={sp.product.id} className="space-y-3">
                    <ProductCard product={sp.product} />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      leftIcon={<BarChart2 className="h-3.5 w-3.5 text-sage-deep" />}
                      onClick={() => setSelectedProductForBreakdown(sp)}
                    >
                      View Score Breakdown ({sp.scoreBreakdown.overallScore}%)
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EXACT MATCH FOUND View — Recommendation Categories (Requirement #22 - #29) */}
      {!loading && result && result.status === "EXACT_MATCH_FOUND" && (
        <div className="space-y-10">
          {/* Featured Top Recommendations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-6">
            {/* 1. Best Overall Category */}
            {result.bestOverall && (
              <div className="rounded-2xl border-2 border-sage-deep bg-background-card p-5 space-y-4 shadow-lg relative flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="sage" className="gap-1 font-bold">
                      <Award className="h-3.5 w-3.5" /> Best Overall Match
                    </Badge>
                    <span className="font-mono text-xs font-bold text-sage-deep">
                      {result.bestOverall.scoreBreakdown.overallScore}% Compatibility
                    </span>
                  </div>

                  <ProductCard product={result.bestOverall.product} className="h-auto" />

                  {/* Explainable Reasons */}
                  <div className="space-y-1 text-xs pt-2 border-t border-line">
                    <span className="font-semibold text-foreground-faint block uppercase text-[0.65rem]">
                      Why BeautyIQ Selected This:
                    </span>
                    {result.bestOverall.reasons.map((r, i) => (
                      <div key={i} className="flex items-start gap-1 text-foreground-muted">
                        <CheckCircle2 className="h-3.5 w-3.5 text-sage-deep shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>

                  {/* Potential Considerations */}
                  {result.bestOverall.considerations.length > 0 && (
                    <div className="space-y-1 text-xs pt-1">
                      {result.bestOverall.considerations.map((c, i) => (
                        <div key={i} className="text-amber-700 dark:text-amber-400 font-mono text-[0.7rem]">
                          ⚠ {c}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-line space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    leftIcon={<BarChart2 className="h-3.5 w-3.5 text-sage-deep" />}
                    onClick={() => setSelectedProductForBreakdown(result.bestOverall!)}
                  >
                    View Score Breakdown
                  </Button>
                  <RecommendationFeedbackWidget
                    sessionId={currentSessionId}
                    productId={result.bestOverall.product.id}
                  />
                </div>
              </div>
            )}

            {/* 2. Best for Main Concern Category */}
            {result.bestForMainConcern && (
              <div className="rounded-lg border border-line bg-background-card p-5 space-y-4 shadow-subtle flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="clay" className="gap-1 font-bold">
                      <Target className="h-3.5 w-3.5" /> Best for Main Concern
                    </Badge>
                    <span className="font-mono text-xs font-bold text-clay">
                      {result.bestForMainConcern.scoreBreakdown.concernScore}% Concern Score
                    </span>
                  </div>

                  <ProductCard product={result.bestForMainConcern.product} className="h-auto" />

                  <div className="space-y-1 text-xs pt-2 border-t border-line">
                    {result.bestForMainConcern.reasons.map((r, i) => (
                      <div key={i} className="flex items-start gap-1 text-foreground-muted">
                        <CheckCircle2 className="h-3.5 w-3.5 text-sage-deep shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-line space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    leftIcon={<BarChart2 className="h-3.5 w-3.5 text-sage-deep" />}
                    onClick={() => setSelectedProductForBreakdown(result.bestForMainConcern!)}
                  >
                    View Score Breakdown
                  </Button>
                  <RecommendationFeedbackWidget
                    sessionId={currentSessionId}
                    productId={result.bestForMainConcern.product.id}
                  />
                </div>
              </div>
            )}

            {/* 3. Best Ingredient Match Category */}
            {result.bestIngredientMatch && (
              <div className="rounded-lg border border-line bg-background-card p-5 space-y-4 shadow-subtle flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="sage" className="gap-1 font-bold">
                      <FlaskConical className="h-3.5 w-3.5" /> Best Ingredient Match
                    </Badge>
                    <span className="font-mono text-xs font-bold text-sage-deep">
                      {result.bestIngredientMatch.scoreBreakdown.ingredientScore}% Ingredient Score
                    </span>
                  </div>

                  <ProductCard product={result.bestIngredientMatch.product} className="h-auto" />

                  <div className="space-y-1 text-xs pt-2 border-t border-line">
                    {result.bestIngredientMatch.reasons.map((r, i) => (
                      <div key={i} className="flex items-start gap-1 text-foreground-muted">
                        <CheckCircle2 className="h-3.5 w-3.5 text-sage-deep shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-line space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    leftIcon={<BarChart2 className="h-3.5 w-3.5 text-sage-deep" />}
                    onClick={() => setSelectedProductForBreakdown(result.bestIngredientMatch!)}
                  >
                    View Score Breakdown
                  </Button>
                  <RecommendationFeedbackWidget
                    sessionId={currentSessionId}
                    productId={result.bestIngredientMatch.product.id}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Secondary Categories: Budget, Rated & Value */}
          <div className="space-y-4 pt-6 border-t border-line">
            <h3 className="font-display text-xl font-bold text-foreground">
              More Specialized Recommendation Choices
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Best Budget Option */}
              {result.bestBudgetOption && (
                <div className="rounded border border-line bg-background-card p-4 space-y-3">
                  <Badge variant="default" className="gap-1 text-xs">
                    <DollarSign className="h-3 w-3" /> Best Budget Option
                  </Badge>
                  <ProductCard product={result.bestBudgetOption.product} />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    leftIcon={<BarChart2 className="h-3.5 w-3.5 text-sage-deep" />}
                    onClick={() => setSelectedProductForBreakdown(result.bestBudgetOption!)}
                  >
                    Score Breakdown ({result.bestBudgetOption.scoreBreakdown.overallScore}%)
                  </Button>
                </div>
              )}

              {/* Best Rated Option */}
              {result.bestRated && (
                <div className="rounded border border-line bg-background-card p-4 space-y-3">
                  <Badge variant="clay" className="gap-1 text-xs">
                    <Star className="h-3 w-3" /> Highest Community Rated
                  </Badge>
                  <ProductCard product={result.bestRated.product} />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    leftIcon={<BarChart2 className="h-3.5 w-3.5 text-sage-deep" />}
                    onClick={() => setSelectedProductForBreakdown(result.bestRated!)}
                  >
                    Score Breakdown ({result.bestRated.scoreBreakdown.overallScore}%)
                  </Button>
                </div>
              )}

              {/* Best Value Option */}
              {result.bestValue && (
                <div className="rounded border border-line bg-background-card p-4 space-y-3">
                  <Badge variant="sage" className="gap-1 text-xs">
                    <Zap className="h-3 w-3" /> Best Value Index
                  </Badge>
                  <ProductCard product={result.bestValue.product} />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    leftIcon={<BarChart2 className="h-3.5 w-3.5 text-sage-deep" />}
                    onClick={() => setSelectedProductForBreakdown(result.bestValue!)}
                  >
                    Score Breakdown ({result.bestValue.scoreBreakdown.overallScore}%)
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Alternative Candidates */}
          {result.alternatives.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-line">
              <h3 className="font-display text-xl font-bold text-foreground">
                Alternative Compatible Candidates ({result.alternatives.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {result.alternatives.map((sp) => (
                  <div key={sp.product.id} className="space-y-2">
                    <ProductCard product={sp.product} />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      leftIcon={<BarChart2 className="h-3.5 w-3.5 text-sage-deep" />}
                      onClick={() => setSelectedProductForBreakdown(sp)}
                    >
                      Score Breakdown ({sp.scoreBreakdown.overallScore}%)
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Score Breakdown Interactive Modal (Requirement #34) */}
      {selectedProductForBreakdown && (
        <ScoreBreakdownModal
          scoredProduct={selectedProductForBreakdown}
          onClose={() => setSelectedProductForBreakdown(null)}
        />
      )}
    </Container>
  );
}

export default function RecommendationsPage() {
  return (
    <React.Suspense
      fallback={
        <Container className="py-16 text-center">
          <div className="h-96 w-full rounded border border-line bg-background-card animate-pulse" />
        </Container>
      }
    >
      <RecommendationsContent />
    </React.Suspense>
  );
}
