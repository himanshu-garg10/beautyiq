"use client";

import * as React from "react";
import { AdminDataService } from "@/services/admin-data.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/context/toast-context";
import {
  Settings,
  Shield,
  Database,
  Trash2,
  Download,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Layers,
} from "lucide-react";

export default function AdminSettingsPage() {
  const { addToast } = useToast();

  const [maintenanceMode, setMaintenanceMode] = React.useState(false);
  const [strictScoring, setStrictScoring] = React.useState(true);
  const [autoFlagDuplicates, setAutoFlagDuplicates] = React.useState(true);
  const [purging, setPurging] = React.useState(false);

  const handlePurgeCache = () => {
    setPurging(true);
    setTimeout(() => {
      setPurging(false);
      AdminDataService.logAction(
        "PURGE_CACHE",
        "system",
        "sys-cache",
        "Redis / In-Memory Cache",
        "Purged dynamic listing prices and recommendation session caches."
      );
      addToast({
        type: "success",
        title: "Cache Purged",
        description: "All transient recommendation & listing prices have refreshed.",
      });
    }, 600);
  };

  const handleExportFullCatalog = async () => {
    const [products, brands, categories, ingredients, listings] = await Promise.all([
      AdminDataService.getProducts(),
      AdminDataService.getBrands(),
      AdminDataService.getCategories(),
      AdminDataService.getIngredients(),
      AdminDataService.getListings(),
    ]);

    const backup = {
      timestamp: new Date().toISOString(),
      platform: "BeautyIQ Admin Core v1.0",
      catalog: {
        products,
        brands,
        categories,
        ingredients,
        listings,
      },
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `beautyiq-full-catalog-backup-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    AdminDataService.logAction(
      "BACKUP_CATALOG",
      "system",
      "backup-all",
      "Full Catalog Backup",
      `Exported ${products.length} products, ${brands.length} brands, ${listings.length} listings.`
    );

    addToast({
      type: "success",
      title: "Backup Complete",
      description: "Complete BeautyIQ catalog exported as JSON.",
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <Badge variant="sage">System Controls</Badge>
          <span className="text-xs text-status-success font-medium flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> All Configurations Synced
          </span>
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
          Platform Configurations & Settings
        </h1>
        <p className="text-xs text-foreground-muted mt-1">
          Manage system maintenance flags, data validation thresholds, cache synchronization, and catalog backup exports.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* SECTION 1: SYSTEM CONTROLS & MAINTENANCE */}
        <div className="rounded-lg border border-line bg-background-card p-6 space-y-6 shadow-subtle">
          <div className="border-b border-line pb-4">
            <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
              <Shield className="h-4 w-4 text-sage-deep" /> System State & Operational Modes
            </h2>
            <p className="text-xs text-foreground-muted mt-0.5">
              Control platform availability, public registration, and customer maintenance flags.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-background-elevated/50 border border-line">
              <div>
                <span className="font-semibold text-foreground text-xs block">
                  Maintenance Mode
                </span>
                <p className="text-foreground-muted text-[0.75rem]">
                  When active, customer facing interfaces display a scheduled maintenance banner. Admin access remains open.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = !maintenanceMode;
                  setMaintenanceMode(next);
                  AdminDataService.logAction(
                    "TOGGLE_MAINTENANCE",
                    "system",
                    "sys-mode",
                    "Maintenance Mode",
                    `Maintenance mode set to ${next ? "ACTIVE" : "OFF"}`
                  );
                  addToast({
                    type: next ? "warning" : "info",
                    title: next ? "Maintenance Mode Enabled" : "Maintenance Mode Disabled",
                    description: next ? "Customer routes show maintenance alert." : "Platform open to public.",
                  });
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  maintenanceMode ? "bg-clay" : "bg-line"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                    maintenanceMode ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-background-elevated/50 border border-line">
              <div>
                <span className="font-semibold text-foreground text-xs block">
                  Strict Recommendation Formula Validation
                </span>
                <p className="text-foreground-muted text-[0.75rem]">
                  Require 100% hard constraint match on known allergies before considering candidate products.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStrictScoring(!strictScoring)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  strictScoring ? "bg-sage-deep" : "bg-line"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                    strictScoring ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-background-elevated/50 border border-line">
              <div>
                <span className="font-semibold text-foreground text-xs block">
                  Automated Duplicate Review Detection
                </span>
                <p className="text-foreground-muted text-[0.75rem]">
                  Automatically queue newly created products with &gt; 85% phonetic name similarity for duplicate review.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAutoFlagDuplicates(!autoFlagDuplicates)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  autoFlagDuplicates ? "bg-sage-deep" : "bg-line"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                    autoFlagDuplicates ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 2: CACHE & DATA BACKUP */}
        <div className="rounded-lg border border-line bg-background-card p-6 space-y-6 shadow-subtle">
          <div className="border-b border-line pb-4">
            <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
              <Database className="h-4 w-4 text-clay" /> Data Synchronization & Backups
            </h2>
            <p className="text-xs text-foreground-muted mt-0.5">
              Purge temporary runtime caches and download structured database backups for auditing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-line bg-background-elevated/40 space-y-3 flex flex-col justify-between">
              <div>
                <span className="font-semibold text-foreground text-xs block">
                  Purge Application Caches
                </span>
                <p className="text-foreground-muted text-[0.75rem] mt-1">
                  Clears all calculated price comparison summaries, session recommendations, and category aggregates.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePurgeCache}
                loading={purging}
                leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
              >
                Purge All Caches
              </Button>
            </div>

            <div className="p-4 rounded-lg border border-line bg-background-elevated/40 space-y-3 flex flex-col justify-between">
              <div>
                <span className="font-semibold text-foreground text-xs block">
                  Export Catalog Backup (JSON)
                </span>
                <p className="text-foreground-muted text-[0.75rem] mt-1">
                  Downloads an immutable snapshot containing all master products, partner brands, categories, ingredients, and active listings.
                </p>
              </div>
              <Button
                variant="clay"
                size="sm"
                onClick={handleExportFullCatalog}
                leftIcon={<Download className="h-3.5 w-3.5" />}
              >
                Download Full Backup
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
