import type { RawProductRecord, RawRecordStatus } from "@/types";

const RAW_STORAGE_KEY = "beautyiq_raw_records";

export class RawStorageService {
  private static inMemoryRecords: RawProductRecord[] = [];

  private static getStoredRecords(): RawProductRecord[] {
    if (typeof window === "undefined") {
      return this.inMemoryRecords;
    }
    try {
      const stored = localStorage.getItem(RAW_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return this.inMemoryRecords;
    }
  }

  private static saveStoredRecords(records: RawProductRecord[]): void {
    this.inMemoryRecords = records;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(RAW_STORAGE_KEY, JSON.stringify(records));
      } catch (e) {
        console.warn("Failed to persist raw records:", e);
      }
    }
  }

  /**
   * Preserves raw external product payload before any transformation or normalization
   */
  static async storeRawRecord(
    sourceId: string,
    sourceName: string,
    externalRecordId: string,
    rawPayload: Record<string, any>
  ): Promise<RawProductRecord> {
    const records = this.getStoredRecords();
    const newRecord: RawProductRecord = {
      id: `raw-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sourceId,
      sourceName,
      collectionTimestamp: new Date().toISOString(),
      externalRecordId: externalRecordId || `ext-${Date.now()}`,
      rawPayload,
      processingStatus: "pending",
    };

    // Keep most recent 500 raw records in audit storage
    const updated = [newRecord, ...records].slice(0, 500);
    this.saveStoredRecords(updated);
    return newRecord;
  }

  static async getRawRecords(filter?: {
    sourceId?: string;
    status?: RawRecordStatus | "all";
  }): Promise<RawProductRecord[]> {
    let records = this.getStoredRecords();
    if (filter?.sourceId && filter.sourceId !== "all") {
      records = records.filter((r) => r.sourceId === filter.sourceId);
    }
    if (filter?.status && filter.status !== "all") {
      records = records.filter((r) => r.processingStatus === filter.status);
    }
    return records;
  }

  static async getRawRecordById(id: string): Promise<RawProductRecord | null> {
    const records = this.getStoredRecords();
    return records.find((r) => r.id === id) || null;
  }

  static async markRecordProcessed(
    id: string,
    targetProductId: string
  ): Promise<RawProductRecord | null> {
    const records = this.getStoredRecords();
    const target = records.find((r) => r.id === id);
    if (!target) return null;

    target.processingStatus = "processed";
    target.targetProductId = targetProductId;
    delete target.failedStage;
    delete target.failureReason;

    this.saveStoredRecords(records);
    return target;
  }

  /**
   * If a product fails validation: do not destroy the raw record. Store failure reason and stage.
   */
  static async markRecordFailed(
    id: string,
    failedStage: string,
    failureReason: string
  ): Promise<RawProductRecord | null> {
    const records = this.getStoredRecords();
    const target = records.find((r) => r.id === id);
    if (!target) return null;

    target.processingStatus = "failed";
    target.failedStage = failedStage;
    target.failureReason = failureReason;

    this.saveStoredRecords(records);
    return target;
  }

  static async markRecordRejected(
    id: string,
    reason: string
  ): Promise<RawProductRecord | null> {
    const records = this.getStoredRecords();
    const target = records.find((r) => r.id === id);
    if (!target) return null;

    target.processingStatus = "rejected";
    target.failedStage = "validation";
    target.failureReason = reason;

    this.saveStoredRecords(records);
    return target;
  }

  static async getFailedRecords(): Promise<RawProductRecord[]> {
    const records = this.getStoredRecords();
    return records.filter((r) => r.processingStatus === "failed" || r.processingStatus === "rejected");
  }

  static async clearRawRecords(): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.removeItem(RAW_STORAGE_KEY);
    }
  }
}
