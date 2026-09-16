"use client";

import * as React from "react";
import { AdminDataService } from "@/services/admin-data.service";
import type { User } from "@/types";
import { AdminTable, Column } from "@/components/admin/admin-table";
import { AdminConfirmModal } from "@/components/admin/admin-confirm-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/context/toast-context";
import {
  Users,
  Eye,
  UserCheck,
  UserX,
  Calendar,
  Sparkles,
  Sliders,
  ShieldCheck,
  Activity,
  Heart,
  Search as SearchIcon,
} from "lucide-react";

export default function AdminCustomersPage() {
  const { addToast } = useToast();
  const [customers, setCustomers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");

  // Selected customer for detail view
  const [selectedCustomer, setSelectedCustomer] = React.useState<User | null>(null);

  // Status toggle confirmation modal
  const [targetCustomerForStatus, setTargetCustomerForStatus] = React.useState<User | null>(null);
  const [actionLoading, setActionLoading] = React.useState(false);

  const loadCustomers = React.useCallback(() => {
    setLoading(true);
    AdminDataService.getCustomers({ search, status: statusFilter }).then((data) => {
      setCustomers(data);
      setLoading(false);
    });
  }, [search, statusFilter]);

  React.useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleToggleStatus = async () => {
    if (!targetCustomerForStatus) return;
    setActionLoading(true);

    const nextStatus: "active" | "inactive" =
      (targetCustomerForStatus.status || "active") === "active" ? "inactive" : "active";

    const updated = await AdminDataService.updateCustomerStatus(
      targetCustomerForStatus.id,
      nextStatus
    );
    setActionLoading(false);
    setTargetCustomerForStatus(null);

    if (updated) {
      loadCustomers();
      if (selectedCustomer?.id === updated.id) {
        setSelectedCustomer(updated);
      }
      addToast({
        type: "success",
        title: "Customer Status Updated",
        description: `${updated.name} has been set to ${nextStatus.toUpperCase()}.`,
      });
    }
  };

  const columns: Column<User>[] = [
    {
      header: "Customer",
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-tint text-sage-deep font-bold text-xs uppercase">
            {u.name.slice(0, 2)}
          </div>
          <div>
            <span className="font-semibold text-foreground block">{u.name}</span>
            <span className="text-foreground-muted text-[0.75rem]">{u.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      render: (u) => {
        const s = u.status || "active";
        return (
          <Badge
            variant={
              s === "active" ? "sage" : s === "suspended" ? "clay" : "default"
            }
          >
            {s.toUpperCase()}
          </Badge>
        );
      },
    },
    {
      header: "Skin Profile",
      render: (u) => {
        if (!u.skinProfile) return <span className="text-foreground-faint">Not started</span>;
        return (
          <div className="space-y-0.5">
            <span className="font-medium text-foreground block">
              {u.skinProfile.skinType || "Unspecified"} Skin
            </span>
            <span className="text-foreground-muted text-[0.7rem]">
              {u.skinProfile.concerns?.slice(0, 2).join(", ") || "No active concerns"}
            </span>
          </div>
        );
      },
    },
    {
      header: "Registered Date",
      render: (u) => (
        <span className="font-mono text-foreground-muted text-[0.75rem]">
          {u.createdAt}
        </span>
      ),
    },
    {
      header: "Profile Completion",
      render: (u) => {
        const complete = u.skinProfile?.isOnboardingComplete;
        return (
          <div className="flex items-center gap-2">
            <div className="h-2 w-16 bg-background-elevated rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${complete ? "bg-sage-deep w-full" : "bg-amber-500 w-1/3"}`}
              />
            </div>
            <span className="font-mono text-[0.7rem] text-foreground-muted">
              {complete ? "100%" : "30%"}
            </span>
          </div>
        );
      },
    },
    {
      header: "Actions",
      className: "text-right",
      render: (u) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => setSelectedCustomer(u)}
            leftIcon={<Eye className="h-3 w-3" />}
          >
            Details
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={`h-7 text-xs px-2 ${
              (u.status || "active") === "active"
                ? "text-status-warning hover:text-status-warning"
                : "text-status-success hover:text-status-success"
            }`}
            onClick={() => setTargetCustomerForStatus(u)}
            title={(u.status || "active") === "active" ? "Deactivate Customer" : "Activate Customer"}
          >
            {(u.status || "active") === "active" ? (
              <UserX className="h-3.5 w-3.5" />
            ) : (
              <UserCheck className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <AdminTable
        title="Customer Accounts Management"
        description="Search, view, and administer verified BeautyIQ customer profiles while respecting strict privacy boundaries."
        searchPlaceholder="Search customer by name, email, or skin type..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={[
          {
            key: "status",
            label: "Account Status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: "All Statuses", value: "all" },
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
              { label: "Suspended", value: "suspended" },
            ],
          },
        ]}
        columns={columns}
        data={customers}
        keyExtractor={(u) => u.id}
        loading={loading}
        emptyTitle="No customers match criteria"
        emptyDescription="Try clearing your search terms or filtering by all account statuses."
      />

      {/* CUSTOMER DETAILS MODAL (PRIVACY-PRESERVING: NO PASSWORD HASHES) */}
      {selectedCustomer && (
        <Modal
          open={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          title="Customer Account Inspection"
        >
          <div className="space-y-6 max-w-xl">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sage-tint text-sage-deep font-bold text-base uppercase">
                  {selectedCustomer.name.slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">
                    {selectedCustomer.name}
                  </h3>
                  <p className="text-xs text-foreground-muted">{selectedCustomer.email}</p>
                </div>
              </div>

              <Badge
                variant={
                  (selectedCustomer.status || "active") === "active" ? "sage" : "clay"
                }
              >
                {(selectedCustomer.status || "active").toUpperCase()}
              </Badge>
            </div>

            {/* Basic Account Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded bg-background-elevated space-y-1">
                <span className="text-[0.65rem] uppercase font-bold text-foreground-faint block">
                  Customer ID
                </span>
                <strong className="font-mono text-foreground">{selectedCustomer.id}</strong>
              </div>

              <div className="p-3 rounded bg-background-elevated space-y-1">
                <span className="text-[0.65rem] uppercase font-bold text-foreground-faint block">
                  Registration
                </span>
                <strong className="font-mono text-foreground">{selectedCustomer.createdAt}</strong>
              </div>

              <div className="p-3 rounded bg-background-elevated space-y-1">
                <span className="text-[0.65rem] uppercase font-bold text-foreground-faint block">
                  Onboarding
                </span>
                <strong className="text-foreground">
                  {selectedCustomer.skinProfile?.isOnboardingComplete ? "Completed" : "Incomplete"}
                </strong>
              </div>
            </div>

            {/* Skin Parameters Overview */}
            {selectedCustomer.skinProfile ? (
              <div className="rounded-lg border border-line p-4 space-y-3 bg-background-elevated/30 text-xs">
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <Sliders className="h-3.5 w-3.5 text-sage-deep" /> Active Skin Parameters
                  </span>
                  <Badge variant="sage">{selectedCustomer.skinProfile.skinType || "Standard"}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-foreground-faint text-[0.7rem] block">Target Concerns</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedCustomer.skinProfile.concerns?.map((c) => (
                        <span key={c} className="px-1.5 py-0.5 rounded bg-background-card border border-line text-[0.7rem]">
                          {c}
                        </span>
                      )) || <span className="text-foreground-muted">None specified</span>}
                    </div>
                  </div>

                  <div>
                    <span className="text-foreground-faint text-[0.7rem] block">Skincare Goals</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedCustomer.skinProfile.goals?.map((g) => (
                        <span key={g} className="px-1.5 py-0.5 rounded bg-background-card border border-line text-[0.7rem]">
                          {g}
                        </span>
                      )) || <span className="text-foreground-muted">None specified</span>}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-line/60 grid grid-cols-2 gap-2 text-[0.75rem]">
                  <div>
                    <span className="text-foreground-faint">Sensitivity Level:</span>{" "}
                    <strong>{selectedCustomer.skinProfile.sensitivityLevel || "Low"}</strong>
                  </div>
                  <div>
                    <span className="text-foreground-faint">Target Budget:</span>{" "}
                    <strong className="font-mono">
                      ₹{selectedCustomer.skinProfile.budget?.min || 300} – ₹
                      {selectedCustomer.skinProfile.budget?.max || 1200}
                    </strong>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-foreground-muted italic">
                No skin profile created yet.
              </p>
            )}

            {/* Account Activity Summary */}
            <div className="rounded-lg border border-line p-4 space-y-2 text-xs">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-clay" /> Saved & Activity Metrics
              </span>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-clay" />
                  <span>
                    <strong>{selectedCustomer.wishlistIds?.length || 0}</strong> products in wishlist
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <SearchIcon className="h-4 w-4 text-sage-deep" />
                  <span>
                    <strong>{selectedCustomer.searchHistory?.length || 0}</strong> recorded queries
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-line">
              <span className="text-[0.7rem] text-foreground-faint font-mono">
                Security: Passwords strictly encrypted (SHA-256)
              </span>
              <Button variant="outline" size="sm" onClick={() => setSelectedCustomer(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* STATUS TOGGLE CONFIRMATION MODAL */}
      <AdminConfirmModal
        open={!!targetCustomerForStatus}
        onClose={() => setTargetCustomerForStatus(null)}
        onConfirm={handleToggleStatus}
        title={`${(targetCustomerForStatus?.status || "active") === "active" ? "Deactivate" : "Activate"} Customer Account`}
        description={`Are you sure you want to ${(targetCustomerForStatus?.status || "active") === "active" ? "deactivate" : "reactivate"} the account for ${targetCustomerForStatus?.name}? ${(targetCustomerForStatus?.status || "active") === "active" ? "The customer will no longer be able to log in until reactivated." : "The customer will immediately regain access."}`}
        confirmLabel={(targetCustomerForStatus?.status || "active") === "active" ? "Deactivate Account" : "Activate Account"}
        confirmVariant={(targetCustomerForStatus?.status || "active") === "active" ? "clay" : "primary"}
        loading={actionLoading}
      />
    </div>
  );
}
