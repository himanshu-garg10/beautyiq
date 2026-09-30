import type { RoutineStep } from "./user";
import type { ProductUnit } from "./product";

export type DataSourceType = "api" | "feed" | "dataset" | "catalog";
export type DataSourceStatus = "active" | "inactive" | "pending";
export type PermissionStatus = "approved" | "pending" | "rejected";

export interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  status: DataSourceStatus;
  permissionStatus: PermissionStatus;
  lastSuccessfulUpdate: string | null;
  lastFailedUpdate: string | null;
  dataCoverage: string;
  reliabilityScore: number; // 0 - 100
  endpoint?: string;
  authType: "none" | "api_key" | "oauth" | "feed_url";
  config?: Record<string, any>;
}

export type RawRecordStatus = "pending" | "processed" | "failed" | "rejected";

export interface RawProductRecord {
  id: string;
  sourceId: string;
  sourceName: string;
  collectionTimestamp: string;
  externalRecordId: string;
  rawPayload: Record<string, any>;
  processingStatus: RawRecordStatus;
  failedStage?: string;
  failureReason?: string;
  targetProductId?: string;
}

export interface DataPipelineRunLog {
  id: string;
  sourceId: string;
  sourceName: string;
  startedAt: string;
  completedAt: string;
  status: "success" | "warning" | "failed";
  recordsReceived: number;
  recordsAccepted: number;
  recordsRejected: number;
  recordsUpdated: number;
  recordsCreated: number;
  duplicatesDetected: number;
  validationFailures: number;
  errors: string[];
}

export type DataQualityState = "Complete" | "Incomplete" | "Duplicate" | "Invalid" | "Outdated" | "Failed";

export interface PipelineValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fieldsValidated: string[];
}

export interface NormalizedQuantityResult {
  quantity: number;
  unit: ProductUnit;
}

export interface NormalizedBrandResult {
  canonicalBrand: string;
  originalBrand: string;
  confidence: number;
  isRecognized: boolean;
}

export interface NormalizedCategoryResult {
  canonicalCategory: RoutineStep;
  originalCategory: string;
  confidence: number;
  isUncertain: boolean;
}

export interface NormalizedIngredientSummary {
  normalized: string[];
  uncertain: string[];
  unidentifiedCount: number;
}
