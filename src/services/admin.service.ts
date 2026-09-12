import { mockAdminMetric, mockActivityLogs, products, ingredients } from "@/lib/mock-data";
import type { AdminMetric, ActivityLog } from "@/types";
import { ApiResponse, createSuccessResponse, simulateDelay } from "./api-client";

export class AdminService {
  static async getMetrics(): Promise<ApiResponse<AdminMetric>> {
    await simulateDelay(150);
    return createSuccessResponse({
      ...mockAdminMetric,
      totalProducts: products.length,
      totalIngredients: ingredients.length,
    });
  }

  static async getActivityLogs(): Promise<ApiResponse<ActivityLog[]>> {
    await simulateDelay(150);
    return createSuccessResponse(mockActivityLogs);
  }
}
