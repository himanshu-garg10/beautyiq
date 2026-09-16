import type { DataExportRequest } from "@/types";
import { mockUsers } from "@/lib/mock-data";
import { WishlistService } from "./wishlist.service";
import { SearchHistoryService } from "./search-history.service";
import { RecommendationHistoryService } from "./recommendation-history.service";
import { ComparisonService } from "./comparison.service";

const EXPORT_STORAGE_KEY = "beautyiq_data_export_req";

export class DataExportService {
  /**
   * Request a full customer data export archive
   */
  static async requestExport(userId: string = "u1"): Promise<DataExportRequest> {
    const newRequest: DataExportRequest = {
      id: `exp-${Date.now()}`,
      userId,
      requestedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      status: "PROCESSING",
    };

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`${EXPORT_STORAGE_KEY}_${userId}`, JSON.stringify(newRequest));
      } catch (e) {
        console.warn("Failed to save data export request:", e);
      }
    }

    // Simulate archive packaging delay
    setTimeout(() => {
      const readyRequest: DataExportRequest = {
        ...newRequest,
        status: "READY",
        downloadUrl: "#",
        fileSizeBytes: 24576, // ~24KB JSON archive
      };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(`${EXPORT_STORAGE_KEY}_${userId}`, JSON.stringify(readyRequest));
        } catch {}
      }
    }, 1500);

    return newRequest;
  }

  /**
   * Get current data export status for user
   */
  static getExportStatus(userId: string = "u1"): DataExportRequest | null {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(`${EXPORT_STORAGE_KEY}_${userId}`);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  /**
   * Generate raw JSON export data containing customer's actual data
   */
  static generateExportData(userId: string = "u1"): object | null {
    const user = mockUsers.find((u) => u.id === userId);
    if (!user) return null;

    const wishlistIds = WishlistService.getWishlistIds(userId);
    const searchHistory = SearchHistoryService.getSearchHistory(userId);
    const recommendationHistory = RecommendationHistoryService.getRecommendationHistory(userId);
    const comparisonHistory = ComparisonService.getComparisonHistory();

    return {
      appName: "BeautyIQ",
      exportGeneratedAt: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        personalProfile: user.personalProfile,
        skinProfile: user.skinProfile,
        notificationPreferences: user.notificationPreferences,
        privacySettings: user.privacySettings,
      },
      wishlist: wishlistIds,
      activity: {
        searchHistory,
        recommendationHistory,
        comparisonHistory,
      },
    };
  }
}
