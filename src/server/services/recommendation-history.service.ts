import type {
  RecommendationHistoryItem,
  StructuredSkincareRequirement,
  RecommendationResultSet,
  SkinProfile,
} from "@/types";
import { mockRecommendationHistory } from "@/lib/mock-data";
import { RecommendationEngineService } from "./recommendation-engine.service";

const REC_HISTORY_KEY = "beautyiq_recommendation_history";

export class RecommendationHistoryService {
  /**
   * Get recommendation history sessions for a customer
   */
  static getRecommendationHistory(userId: string = "u1"): RecommendationHistoryItem[] {
    const userDefaults = mockRecommendationHistory.filter((r) => r.userId === userId);
    if (typeof window === "undefined") {
      return userDefaults;
    }
    try {
      const stored = localStorage.getItem(`${REC_HISTORY_KEY}_${userId}`);
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(`${REC_HISTORY_KEY}_${userId}`, JSON.stringify(userDefaults));
      return userDefaults;
    } catch {
      return userDefaults;
    }
  }

  /**
   * Save a newly calculated recommendation session into history
   */
  static saveRecommendationSession(
    userId: string = "u1",
    req: StructuredSkincareRequirement,
    results: RecommendationResultSet,
    profile?: SkinProfile | null
  ): RecommendationHistoryItem {
    const current = this.getRecommendationHistory(userId);

    const categories: string[] = [];
    if (results.bestOverall) categories.push("Best Overall Match");
    if (results.bestForMainConcern) categories.push("Best for Main Concern");
    if (results.bestIngredientMatch) categories.push("Best Ingredient Match");
    if (results.bestBudgetOption) categories.push("Best Budget Option");

    const topProduct = results.bestOverall || results.bestForMainConcern || results.bestBudgetOption;

    const newSession: RecommendationHistoryItem = {
      id: `rh-${Date.now()}`,
      userId,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      querySummary: req.rawQuery || `Target: ${req.skinType || "Skin"} & ${req.category || "Skincare"}`,
      requirements: req,
      totalRecommendations: results.totalCandidatesCount || 3,
      topRecommendation: topProduct
        ? {
            id: topProduct.product.id,
            name: topProduct.product.name,
            brand: topProduct.product.brand,
            score: topProduct.scoreBreakdown.overallScore,
            image: topProduct.product.image,
            category: topProduct.product.category,
            price: topProduct.bestListing?.price || 499,
          }
        : undefined,
      categories: categories.length > 0 ? categories : ["Best Overall Match"],
      profileContextUsed: profile
        ? {
            skinType: profile.skinType,
            concerns: profile.concerns,
          }
        : undefined,
      isRecalculated: false,
    };

    const updated = [newSession, ...current].slice(0, 15); // Keep up to 15 sessions

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`${REC_HISTORY_KEY}_${userId}`, JSON.stringify(updated));
      } catch (e) {
        console.warn("Failed to persist recommendation history:", e);
      }
    }

    return newSession;
  }

  /**
   * Recalculate recommendation history session using latest products & profile data
   */
  static async recalculateRecommendationSession(
    userId: string = "u1",
    sessionId: string,
    profile?: SkinProfile | null
  ): Promise<RecommendationHistoryItem | null> {
    const history = this.getRecommendationHistory(userId);
    const item = history.find((h) => h.id === sessionId);
    if (!item) return null;

    // Recalculate using real recommendation engine
    const res = await RecommendationEngineService.generateRecommendations({
      requirements: item.requirements,
      priority: "best-match",
      userProfile: profile,
    });

    if (res.data) {
      const results = res.data;
      const topProduct = results.bestOverall || results.bestForMainConcern || results.bestBudgetOption;

      item.isRecalculated = true;
      item.timestamp = new Date().toISOString().replace("T", " ").substring(0, 16);
      item.totalRecommendations = results.totalCandidatesCount;
      if (topProduct) {
        item.topRecommendation = {
          id: topProduct.product.id,
          name: topProduct.product.name,
          brand: topProduct.product.brand,
          score: topProduct.scoreBreakdown.overallScore,
          image: topProduct.product.image,
          category: topProduct.product.category,
          price: topProduct.bestListing?.price || 499,
        };
      }

      const updated = history.map((h) => (h.id === sessionId ? item : h));
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(`${REC_HISTORY_KEY}_${userId}`, JSON.stringify(updated));
        } catch (e) {
          console.warn("Failed to update recalculated history:", e);
        }
      }
    }

    return item;
  }

  /**
   * Delete an individual recommendation history session
   */
  static deleteRecommendationSession(userId: string = "u1", id: string): RecommendationHistoryItem[] {
    const current = this.getRecommendationHistory(userId);
    const updated = current.filter((s) => s.id !== id);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`${REC_HISTORY_KEY}_${userId}`, JSON.stringify(updated));
      } catch (e) {
        console.warn("Failed to delete recommendation history session:", e);
      }
    }

    return updated;
  }

  /**
   * Clear all recommendation history
   */
  static clearRecommendationHistory(userId: string = "u1"): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(`${REC_HISTORY_KEY}_${userId}`);
      } catch (e) {
        console.warn("Failed to clear recommendation history:", e);
      }
    }
  }
}
