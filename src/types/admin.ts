export type ReportType =
  | "wrong_price"
  | "wrong_info"
  | "wrong_ingredients"
  | "broken_link"
  | "availability_issue"
  | "duplicate"
  | "other";

export type ReportStatus = "open" | "reviewing" | "resolved" | "rejected";

export interface ProductReport {
  id: string;
  productId: string;
  productName: string;
  userId?: string;
  userEmail?: string;
  reportType: ReportType;
  description: string;
  status: ReportStatus;
  createdAt: string;
  resolvedAt?: string;
  adminNotes?: string;
}

export type SupportCategory = "general" | "routine" | "recommendation" | "account" | "bug";
export type SupportPriority = "low" | "medium" | "high" | "urgent";
export type SupportStatus = "open" | "in_progress" | "resolved" | "closed";

export interface SupportRequest {
  id: string;
  userId?: string;
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  category: SupportCategory;
  priority: SupportPriority;
  status: SupportStatus;
  createdAt: string;
  updatedAt: string;
  adminResponse?: string;
}

export type AdminEntity =
  | "product"
  | "brand"
  | "category"
  | "ingredient"
  | "platform"
  | "seller"
  | "listing"
  | "customer"
  | "report"
  | "support"
  | "system";

export interface AdminActivityLog {
  id: string;
  timestamp: string;
  adminEmail: string;
  adminName: string;
  action: string;
  entity: AdminEntity;
  entityId: string;
  entityName: string;
  details: string;
  status: "success" | "warning" | "error";
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  actorEmail: string;
  action: string;
  target: string;
  status: "success" | "warning" | "error";
  details?: string;
}

export interface AdminMetric {
  totalUsers: number;
  totalProducts: number;
  totalIngredients: number;
  totalSearches: number;
  systemHealth: "Optimal" | "Degraded" | "Critical";
  dataQualityScore: number;
  duplicateQueueCount: number;
  scrapesLast24h: number;
}

export type DataQualityIssueType =
  | "missing_ingredients"
  | "missing_image"
  | "missing_price"
  | "missing_quantity"
  | "missing_source"
  | "invalid_listing"
  | "outdated"
  | "duplicate_candidate";

export interface DataQualityIssue {
  id: string;
  entityType: "product" | "listing" | "ingredient";
  entityId: string;
  entityName: string;
  issueType: DataQualityIssueType;
  severity: "low" | "medium" | "high";
  detectedAt: string;
  status: "pending" | "resolved" | "ignored";
  description: string;
}

export interface DuplicateCandidate {
  id: string;
  entityType: "product" | "brand" | "ingredient" | "listing";
  item1: { id: string; name: string; details: string };
  item2: { id: string; name: string; details: string };
  similarityScore: number;
  reasons: string[];
  status: "pending" | "merged" | "dismissed";
  detectedAt: string;
}

export interface AdminDashboardMetrics {
  totalCustomers: number;
  activeCustomers: number;
  totalProducts: number;
  activeProducts: number;
  totalBrands: number;
  totalCategories: number;
  totalIngredients: number;
  totalPlatforms: number;
  totalSellers: number;
  totalListings: number;
  availableListings: number;
  unavailableListings: number;
  incompleteProducts: number;
  reviewProducts: number;
  duplicateCandidatesCount: number;
  openReportsCount: number;
  openSupportCount: number;
  categoryDistribution: { category: string; count: number }[];
  brandDistribution: { brand: string; count: number }[];
  availabilityDistribution: { status: string; count: number }[];
  dataQualityHealthScore: number;
  recentActivity: AdminActivityLog[];
}
