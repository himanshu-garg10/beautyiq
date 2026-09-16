"use client";

import * as React from "react";
import Link from "next/link";
import { AdminDataService } from "@/services/admin-data.service";
import type { AdminDashboardMetrics, AdminActivityLog } from "@/types";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Package,
  Award,
  FolderTree,
  FlaskConical,
  Globe,
  Store,
  Tag,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileQuestion,
  Search,
  Flag,
  LifeBuoy,
  Database,
  ArrowUpRight,
  ShieldCheck,
  Plus,
  RefreshCw,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = React.useState<AdminDashboardMetrics | null>(null);
  const [loading, setLoading] = React.useState(true);

  const loadData = React.useCallback(() => {
    setLoading(true);
    AdminDataService.getDashboardMetrics().then((data) => {
      setMetrics(data);
      setLoading(false);
    });
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header & Operational Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <Badge variant="sage">Operations Command Center</Badge>
            <span className="text-xs text-status-success font-medium flex items-center gap-1.5">
              <span className="flex h-2 w-2 rounded-full bg-status-success animate-pulse" />
              All Services Operational
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Platform Overview & Metrics
          </h1>
          <p className="text-xs text-foreground-muted mt-1">
            Real-time catalog distribution, marketplace seller networks, data quality health, and customer operations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />}
          >
            Refresh
          </Button>

          <Link href="/admin/products">
            <Button variant="clay" size="sm" leftIcon={<Plus className="h-4 w-4" />}>
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* SECTION 1: CORE CATALOG & PLATFORM METRICS */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-foreground-faint">
          1. Catalog & Marketplace Summary
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminStatCard
            title="Total Products"
            value={metrics?.totalProducts || 0}
            subtitle={`${metrics?.activeProducts || 0} active in customer catalog`}
            icon={<Package className="h-5 w-5" />}
            badge="Live Catalog"
          />
          <AdminStatCard
            title="Partner Brands"
            value={metrics?.totalBrands || 0}
            subtitle="Verified skincare brands"
            icon={<Award className="h-5 w-5 text-clay" />}
          />
          <AdminStatCard
            title="Routine Categories"
            value={metrics?.totalCategories || 0}
            subtitle="Standardized skincare steps"
            icon={<FolderTree className="h-5 w-5 text-amber-500" />}
          />
          <AdminStatCard
            title="Active Ingredients"
            value={metrics?.totalIngredients || 0}
            subtitle="With functions & synonyms"
            icon={<FlaskConical className="h-5 w-5 text-indigo-500" />}
          />
        </div>
      </div>

      {/* SECTION 2: MARKETPLACE LISTINGS & AVAILABILITY */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-foreground-faint">
          2. Listings, Platforms & Pricing
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminStatCard
            title="Tracked Listings"
            value={metrics?.totalListings || 0}
            subtitle={`Across ${metrics?.totalPlatforms || 0} platforms & ${metrics?.totalSellers || 0} sellers`}
            icon={<Tag className="h-5 w-5 text-sage-deep" />}
          />
          <AdminStatCard
            title="Available Listings"
            value={metrics?.availableListings || 0}
            subtitle="In-stock with valid price"
            icon={<CheckCircle2 className="h-5 w-5 text-status-success" />}
            trend={`${metrics ? Math.round((metrics.availableListings / (metrics.totalListings || 1)) * 100) : 0}% available`}
            trendUp={true}
          />
          <AdminStatCard
            title="Unavailable Listings"
            value={metrics?.unavailableListings || 0}
            subtitle="Out of stock / unpriced"
            icon={<XCircle className="h-5 w-5 text-status-warning" />}
            trendUp={false}
          />
          <AdminStatCard
            title="Integrated Platforms"
            value={metrics?.totalPlatforms || 0}
            subtitle={`${metrics?.totalSellers || 0} merchant entities`}
            icon={<Globe className="h-5 w-5 text-cyan-600" />}
          />
        </div>
      </div>

      {/* SECTION 3: DATA QUALITY & CUSTOMER OPERATIONS */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-foreground-faint">
          3. Operations, Quality & Customer Care
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminStatCard
            title="Registered Customers"
            value={metrics?.totalCustomers || 0}
            subtitle={`${metrics?.activeCustomers || 0} active accounts`}
            icon={<Users className="h-5 w-5 text-sage-deep" />}
          />
          <AdminStatCard
            title="Data Health Score"
            value={`${metrics?.dataQualityHealthScore || 100}%`}
            subtitle={`${metrics?.incompleteProducts || 0} incomplete products`}
            icon={<Database className="h-5 w-5 text-status-info" />}
            trend={metrics?.incompleteProducts ? `${metrics.incompleteProducts} need review` : "Complete"}
            trendUp={metrics?.incompleteProducts === 0}
          />
          <AdminStatCard
            title="Open Product Reports"
            value={metrics?.openReportsCount || 0}
            subtitle="Customer discrepancy reports"
            icon={<Flag className="h-5 w-5 text-clay" />}
            badge={metrics?.openReportsCount ? "Action Required" : "All Clear"}
          />
          <AdminStatCard
            title="Open Support Tickets"
            value={metrics?.openSupportCount || 0}
            subtitle="Pending customer replies"
            icon={<LifeBuoy className="h-5 w-5 text-amber-500" />}
            badge={metrics?.openSupportCount ? "Pending" : "Resolved"}
          />
        </div>
      </div>

      {/* SECTION 4: VISUAL DISTRIBUTION CHARTS & BREAKDOWNS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution Breakdown */}
        <div className="rounded-lg border border-line bg-background-card p-5 space-y-4 shadow-subtle">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold text-foreground">
              Product Distribution by Routine Step
            </h3>
            <Link
              href="/admin/categories"
              className="text-xs text-sage-deep font-semibold flex items-center gap-1 hover:underline"
            >
              Manage Categories <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {metrics?.categoryDistribution && metrics.categoryDistribution.length > 0 ? (
              metrics.categoryDistribution.map((item) => {
                const pct = Math.round((item.count / (metrics.totalProducts || 1)) * 100);
                return (
                  <div key={item.category} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-foreground">{item.category}</span>
                      <span className="text-foreground-muted font-mono">
                        {item.count} products ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-background-elevated rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sage-deep rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(pct, 5)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-foreground-muted py-6 text-center">
                No category distribution data available.
              </p>
            )}
          </div>
        </div>

        {/* Brand Distribution Breakdown */}
        <div className="rounded-lg border border-line bg-background-card p-5 space-y-4 shadow-subtle">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold text-foreground">
              Top Catalog Brands
            </h3>
            <Link
              href="/admin/brands"
              className="text-xs text-sage-deep font-semibold flex items-center gap-1 hover:underline"
            >
              Manage Brands <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {metrics?.brandDistribution && metrics.brandDistribution.length > 0 ? (
              metrics.brandDistribution.map((item) => {
                const pct = Math.round((item.count / (metrics.totalProducts || 1)) * 100);
                return (
                  <div key={item.brand} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-foreground">{item.brand}</span>
                      <span className="text-foreground-muted font-mono">
                        {item.count} items ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-background-elevated rounded-full overflow-hidden">
                      <div
                        className="h-full bg-clay rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(pct, 8)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-foreground-muted py-6 text-center">
                No brand distribution data available.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 5: RECENT ACTIVITY LOGS AUDIT TRAIL */}
      <div className="rounded-lg border border-line bg-background-card p-5 space-y-4 shadow-subtle">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-sage-deep" />
            <h3 className="font-display text-sm font-bold text-foreground">
              Recent Administrative Activity Log
            </h3>
          </div>
          <Link
            href="/admin/logs"
            className="text-xs text-sage-deep font-semibold flex items-center gap-1 hover:underline"
          >
            View Full Audit Log <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="space-y-2.5">
          {metrics?.recentActivity && metrics.recentActivity.length > 0 ? (
            metrics.recentActivity.map((log) => (
              <div
                key={log.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded bg-background-elevated/40 border border-line/60 text-xs gap-2"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[0.7rem] px-1.5 py-0.5 rounded bg-sage-tint/40 text-sage-deep uppercase">
                      {log.action}
                    </span>
                    <strong className="text-foreground">{log.entityName}</strong>
                  </div>
                  <p className="text-foreground-muted text-[0.75rem]">{log.details}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-foreground-faint text-[0.7rem]">
                  <span>{log.adminEmail}</span>
                  <span>•</span>
                  <span className="font-mono">{log.timestamp}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-foreground-muted text-center py-6">
              No recent audit logs available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
