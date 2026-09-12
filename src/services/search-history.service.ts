import type { SearchHistoryItem, StructuredSkincareRequirement } from "@/types";
import { mockSearchHistory } from "@/lib/mock-data";

const SEARCH_HISTORY_KEY = "beautyiq_search_history";

export class SearchHistoryService {
  /**
   * Get search history items for a user
   */
  static getSearchHistory(userId: string = "u1"): SearchHistoryItem[] {
    const userDefaults = mockSearchHistory.filter((s) => s.userId === userId);
    if (typeof window === "undefined") {
      return userDefaults;
    }
    try {
      const stored = localStorage.getItem(`${SEARCH_HISTORY_KEY}_${userId}`);
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(`${SEARCH_HISTORY_KEY}_${userId}`, JSON.stringify(userDefaults));
      return userDefaults;
    } catch {
      return userDefaults;
    }
  }

  /**
   * Add a new search history item
   */
  static addSearch(
    userId: string = "u1",
    query: string,
    searchType: "keyword" | "ai-requirement" | "category" | "ingredient" = "keyword",
    extractedCriteria?: StructuredSkincareRequirement | any
  ): SearchHistoryItem {
    if (!query || !query.trim()) {
      return {
        id: `sh-${Date.now()}`,
        userId,
        query: "",
        timestamp: new Date().toISOString(),
        searchType,
      };
    }

    const current = this.getSearchHistory(userId);
    // Remove duplicate queries to keep history fresh
    const filtered = current.filter((s) => s.query.toLowerCase() !== query.trim().toLowerCase());

    const newItem: SearchHistoryItem = {
      id: `sh-${Date.now()}`,
      userId,
      query: query.trim(),
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      searchType,
      extractedCriteria,
    };

    const updated = [newItem, ...filtered].slice(0, 20); // Keep last 20 searches

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`${SEARCH_HISTORY_KEY}_${userId}`, JSON.stringify(updated));
      } catch (e) {
        console.warn("Failed to persist search history:", e);
      }
    }

    return newItem;
  }

  /**
   * Delete an individual search item
   */
  static deleteSearch(userId: string = "u1", id: string): SearchHistoryItem[] {
    const current = this.getSearchHistory(userId);
    const updated = current.filter((s) => s.id !== id);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`${SEARCH_HISTORY_KEY}_${userId}`, JSON.stringify(updated));
      } catch (e) {
        console.warn("Failed to update search history:", e);
      }
    }

    return updated;
  }

  /**
   * Clear all search history
   */
  static clearSearchHistory(userId: string = "u1"): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(`${SEARCH_HISTORY_KEY}_${userId}`);
      } catch (e) {
        console.warn("Failed to clear search history:", e);
      }
    }
  }
}
