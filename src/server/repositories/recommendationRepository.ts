import type { RecommendationHistoryItem } from "@/types";
import { db } from "../database/connection";

export class RecommendationRepository {
  static getRecommendationHistory(userId: string): RecommendationHistoryItem[] {
    const rows = db
      .prepare("SELECT * FROM recommendation_history WHERE user_id = ? ORDER BY timestamp DESC LIMIT 30")
      .all(userId) as {
      id: string;
      user_id: string;
      timestamp: string;
      query_summary: string;
      requirements_json: string;
      total_recommendations: number;
      top_product_json: string | null;
      categories_json: string | null;
      profile_context_json: string | null;
      is_recalculated: number;
    }[];

    return rows.map((r) => {
      let requirements: any = {};
      let topRecommendation: any = undefined;
      let categories: string[] = [];
      let profileContextUsed: any = undefined;

      try {
        requirements = JSON.parse(r.requirements_json);
      } catch {}
      if (r.top_product_json) {
        try {
          topRecommendation = JSON.parse(r.top_product_json);
        } catch {}
      }
      if (r.categories_json) {
        try {
          categories = JSON.parse(r.categories_json);
        } catch {}
      }
      if (r.profile_context_json) {
        try {
          profileContextUsed = JSON.parse(r.profile_context_json);
        } catch {}
      }

      return {
        id: r.id,
        userId: r.user_id,
        timestamp: r.timestamp,
        querySummary: r.query_summary,
        requirements,
        totalRecommendations: r.total_recommendations,
        topRecommendation,
        categories,
        profileContextUsed,
        isRecalculated: Boolean(r.is_recalculated),
      };
    });
  }

  static saveRecommendationSession(item: RecommendationHistoryItem): RecommendationHistoryItem {
    db.prepare(`
      INSERT OR REPLACE INTO recommendation_history (
        id, user_id, timestamp, query_summary, requirements_json,
        total_recommendations, top_product_json, categories_json,
        profile_context_json, is_recalculated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      item.id,
      item.userId,
      item.timestamp,
      item.querySummary,
      JSON.stringify(item.requirements || {}),
      item.totalRecommendations,
      item.topRecommendation ? JSON.stringify(item.topRecommendation) : null,
      JSON.stringify(item.categories || []),
      item.profileContextUsed ? JSON.stringify(item.profileContextUsed) : null,
      item.isRecalculated ? 1 : 0
    );

    return item;
  }

  static deleteRecommendationSession(userId: string, id: string): void {
    db.prepare("DELETE FROM recommendation_history WHERE user_id = ? AND id = ?").run(
      userId,
      id
    );
  }

  static clearRecommendationHistory(userId: string): void {
    db.prepare("DELETE FROM recommendation_history WHERE user_id = ?").run(userId);
  }
}
