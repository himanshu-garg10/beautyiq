import type { DataSource, DataSourceType, PermissionStatus } from "@/types";

const DATA_SOURCES_KEY = "beautyiq_data_sources";

export const DEFAULT_DATA_SOURCES: DataSource[] = [
  {
    id: "src-brand-direct",
    name: "Brand Direct Catalog Feed",
    type: "feed",
    status: "active",
    permissionStatus: "approved",
    lastSuccessfulUpdate: "2026-09-11 18:30",
    lastFailedUpdate: null,
    dataCoverage: "Primary Indian & Korean dermo-cosmetic brands (Minimalist, Cetaphil, Dot & Key, Plum, etc.)",
    reliabilityScore: 96,
    authType: "feed_url",
    endpoint: "https://feeds.beautyiq.internal/v1/brand-direct",
    config: {
      updateIntervalHours: 24,
      allowDirectMerge: true,
      priceTrustWeight: 0.98,
    },
  },
  {
    id: "src-open-skincare-dataset",
    name: "Open INCI & Dermatology Dataset",
    type: "dataset",
    status: "active",
    permissionStatus: "approved",
    lastSuccessfulUpdate: "2026-09-10 12:00",
    lastFailedUpdate: null,
    dataCoverage: "Verified active ingredient formulations, CAS numbers, comedogenic ratings, and safety profiles",
    reliabilityScore: 94,
    authType: "none",
    endpoint: "https://data.beautyiq.internal/inci-catalog-v2.json",
    config: {
      updateIntervalHours: 168,
      readOnlyReference: true,
    },
  },
  {
    id: "src-retailer-partner-api",
    name: "Permitted Retailer Partner API",
    type: "api",
    status: "active",
    permissionStatus: "approved",
    lastSuccessfulUpdate: "2026-09-12 08:00",
    lastFailedUpdate: null,
    dataCoverage: "Live listing pricing, seller stock availability, and verified merchant product URLs",
    reliabilityScore: 90,
    authType: "api_key",
    endpoint: "https://partner-api.beautyiq.internal/retailer/v1",
    config: {
      requiresCredentials: true,
      envVarKey: "BEAUTYIQ_RETAILER_API_KEY",
      updateIntervalHours: 6,
    },
  },
  {
    id: "src-controlled-dev",
    name: "Controlled Skincare Benchmark Dataset",
    type: "dataset",
    status: "active",
    permissionStatus: "approved",
    lastSuccessfulUpdate: "2026-09-12 10:00",
    lastFailedUpdate: null,
    dataCoverage: "Curated real-world dermo-cosmetic products for deterministic development and benchmark testing",
    reliabilityScore: 95,
    authType: "none",
    config: {
      isBenchmark: true,
      isLocal: true,
    },
  },
  {
    id: "src-unapproved-feed-sample",
    name: "Unverified External Feed Draft",
    type: "feed",
    status: "pending",
    permissionStatus: "pending",
    lastSuccessfulUpdate: null,
    lastFailedUpdate: "2026-09-08 14:00 (Permission not granted)",
    dataCoverage: "Unverified sample third-party feed awaiting compliance and authorization review",
    reliabilityScore: 40,
    authType: "none",
    config: {
      isBlocked: true,
      blockReason: "Pending formal data sharing agreement. Prohibited scraping policy enforced.",
    },
  },
];

export class DataSourceService {
  private static getStoredSources(): DataSource[] {
    if (typeof window === "undefined") return DEFAULT_DATA_SOURCES;
    try {
      const stored = localStorage.getItem(DATA_SOURCES_KEY);
      if (!stored) {
        localStorage.setItem(DATA_SOURCES_KEY, JSON.stringify(DEFAULT_DATA_SOURCES));
        return DEFAULT_DATA_SOURCES;
      }
      return JSON.parse(stored);
    } catch {
      return DEFAULT_DATA_SOURCES;
    }
  }

  private static saveSources(sources: DataSource[]): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(DATA_SOURCES_KEY, JSON.stringify(sources));
      } catch (e) {
        console.warn("Failed to persist data sources:", e);
      }
    }
  }

  static async getDataSources(): Promise<DataSource[]> {
    return this.getStoredSources();
  }

  static async getDataSourceById(id: string): Promise<DataSource | null> {
    const sources = this.getStoredSources();
    return sources.find((s) => s.id === id) || null;
  }

  static async registerDataSource(source: Partial<DataSource>): Promise<DataSource> {
    const sources = this.getStoredSources();
    const newSource: DataSource = {
      id: source.id || `src-${Date.now()}`,
      name: source.name || "New Data Source",
      type: source.type || "feed",
      status: source.status || "pending",
      // CRITICAL PRINCIPLE: Never mark an unverified source as approved by default
      permissionStatus: source.permissionStatus || "pending",
      lastSuccessfulUpdate: null,
      lastFailedUpdate: null,
      dataCoverage: source.dataCoverage || "Standard catalog coverage",
      reliabilityScore: Math.max(0, Math.min(100, source.reliabilityScore ?? 70)),
      endpoint: source.endpoint,
      authType: source.authType || "none",
      config: source.config || {},
    };

    const updated = [...sources, newSource];
    this.saveSources(updated);
    return newSource;
  }

  static async updateDataSource(id: string, updates: Partial<DataSource>): Promise<DataSource | null> {
    const sources = this.getStoredSources();
    const idx = sources.findIndex((s) => s.id === id);
    if (idx === -1) return null;

    sources[idx] = {
      ...sources[idx],
      ...updates,
    };

    this.saveSources(sources);
    return sources[idx];
  }

  static async recordSyncSuccess(id: string): Promise<void> {
    const sources = this.getStoredSources();
    const target = sources.find((s) => s.id === id);
    if (target) {
      target.lastSuccessfulUpdate = new Date().toISOString().replace("T", " ").substring(0, 16);
      target.status = "active";
      this.saveSources(sources);
    }
  }

  static async recordSyncFailure(id: string, errorReason: string): Promise<void> {
    const sources = this.getStoredSources();
    const target = sources.find((s) => s.id === id);
    if (target) {
      target.lastFailedUpdate = `${new Date().toISOString().replace("T", " ").substring(0, 16)} (${errorReason})`;
      this.saveSources(sources);
    }
  }

  /**
   * Safety guard: returns true ONLY if source is approved and active
   */
  static isSourcePermitted(source: DataSource): boolean {
    return source.permissionStatus === "approved" && source.status === "active";
  }
}
