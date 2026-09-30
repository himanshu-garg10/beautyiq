/**
 * BeautyIQ In-Memory Sliding Window Rate Limiter
 * Protects sensitive endpoints (auth, search, AI discovery, admin pipeline) from brute-force & denial of service.
 */

interface RateLimitRecord {
  timestamps: number[];
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
  retryAfterSeconds?: number;
}

export class RateLimiter {
  private static store: Map<string, RateLimitRecord> = new Map();

  // Pre-configured rate limits for different endpoint categories
  static CONFIGS: Record<string, RateLimitConfig> = {
    auth: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 attempts per minute
    ai: { maxRequests: 25, windowMs: 60 * 1000 }, // 25 queries per minute
    search: { maxRequests: 60, windowMs: 60 * 1000 }, // 60 searches per minute
    pipeline: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 pipeline executions per minute
    customer_mutation: { maxRequests: 30, windowMs: 60 * 1000 }, // 30 profile updates per minute
    sensitive_default: { maxRequests: 30, windowMs: 60 * 1000 },
  };

  /**
   * Check if an incoming request exceeds the rate limit
   * @param key Unique client identifier (e.g. IP address, user ID, or composite key)
   * @param category Limit category or custom RateLimitConfig
   */
  static check(
    key: string,
    category: string | RateLimitConfig = "sensitive_default"
  ): RateLimitResult {
    const now = Date.now();
    const config: RateLimitConfig =
      typeof category === "string"
        ? this.CONFIGS[category] || this.CONFIGS.sensitive_default
        : category;

    const windowStart = now - config.windowMs;

    let record = this.store.get(key);
    if (!record) {
      record = { timestamps: [] };
      this.store.set(key, record);
    }

    // Filter out timestamps outside the active sliding window
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    if (record.timestamps.length >= config.maxRequests) {
      const oldestInWindow = record.timestamps[0];
      const resetMs = Math.max(0, oldestInWindow + config.windowMs - now);
      const retryAfterSeconds = Math.ceil(resetMs / 1000);

      return {
        allowed: false,
        limit: config.maxRequests,
        remaining: 0,
        resetMs,
        retryAfterSeconds,
      };
    }

    // Record this request
    record.timestamps.push(now);

    return {
      allowed: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - record.timestamps.length,
      resetMs: config.windowMs,
    };
  }

  /**
   * Reset store (useful for test isolation)
   */
  static reset(): void {
    this.store.clear();
  }
}
