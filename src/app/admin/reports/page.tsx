"use client";

import * as React from "react";
import { AdminDataService } from "@/services/admin-data.service";
import type { ProductReport, ReportStatus, ReportType } from "@/types";
import { AdminTable, Column } from "@/components/admin/admin-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/context/toast-context";
import { Flag, CheckCircle2, Clock, XCircle, AlertCircle, Edit2 } from "lucide-react";

export default function AdminReportsPage() {
  const { addToast } = useToast();
  const [reports, setReports] = React.useState<ProductReport[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [typeFilter, setTypeFilter] = React.useState("all");

  // Status Modal
  const [selectedReport, setSelectedReport] = React.useState<ProductReport | null>(null);
  const [newStatus, setNewStatus] = React.useState<ReportStatus>("resolved");
  const [adminNotes, setAdminNotes] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const loadReports = React.useCallback(() => {
    setLoading(true);
    AdminDataService.getReports({
      status: statusFilter,
      reportType: typeFilter,
    }).then((data) => {
      setReports(data);
      setLoading(false);
    });
  }, [statusFilter, typeFilter]);

  React.useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleOpenAction = (rep: ProductReport) => {
    setSelectedReport(rep);
    setNewStatus(rep.status === "open" ? "reviewing" : "resolved");
    setAdminNotes(rep.adminNotes || "");
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    setSaving(true);

    const updated = await AdminDataService.updateReportStatus(
      selectedReport.id,
      newStatus,
      adminNotes.trim()
    );

    setSaving(false);
    setSelectedReport(null);
    loadReports();

    if (updated) {
      addToast({
        type: "success",
        title: "Report Status Updated",
        description: `Report #${updated.id} marked as ${updated.status.toUpperCase()}.`,
      });
    }
  };

  const columns: Column<ProductReport>[] = [
    {
      header: "Issue Type",
      render: (r) => (
        <Badge
          variant={
            r.reportType === "wrong_price"
              ? "sage"
              : r.reportType === "wrong_ingredients"
              ? "clay"
              : "default"
          }
        >
          {r.reportType.replace("_", " ").toUpperCase()}
        </Badge>
      ),
    },
    {
      header: "Report Details",
      render: (r) => (
        <div>
          <strong className="text-foreground block font-semibold">{r.productName}</strong>
          <p className="text-foreground-muted text-[0.75rem] line-clamp-2 mt-0.5">
            {r.description}
          </p>
          {r.adminNotes && (
            <p className="text-sage-deep text-[0.7rem] italic mt-1">
              Admin note: {r.adminNotes}
            </p>
          )}
        </div>
      ),
    },
    {
      header: "Reported By",
      render: (r) => (
        <span className="text-foreground-muted text-xs">
          {r.userEmail || "Anonymous Customer"}
        </span>
      ),
    },
    {
      header: "Reported At",
      render: (r) => (
        <span className="font-mono text-foreground-faint text-[0.75rem]">
          {r.createdAt}
        </span>
      ),
    },
    {
      header: "Status",
      render: (r) => (
        <Badge
          variant={
            r.status === "resolved"
              ? "sage"
              : r.status === "rejected"
              ? "clay"
              : r.status === "reviewing"
              ? "default"
              : "clay"
          }
        >
          {r.status.toUpperCase()}
        </Badge>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      render: (r) => (
        <div className="flex items-center justify-end">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => handleOpenAction(r)}
            leftIcon={<Edit2 className="h-3 w-3" />}
          >
            Review & Status
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <AdminTable
        title="Customer Product Data Reports"
        description="Verify and resolve data discrepancies reported by customers, including price mismatches, formula updates, broken platform links, and stock issues."
        filters={[
          {
            key: "status",
            label: "Status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: "All Statuses", value: "all" },
              { label: "Open", value: "open" },
              { label: "Reviewing", value: "reviewing" },
              { label: "Resolved", value: "resolved" },
              { label: "Rejected", value: "rejected" },
            ],
          },
          {
            key: "type",
            label: "Issue Type",
            value: typeFilter,
            onChange: setTypeFilter,
            options: [
              { label: "All Types", value: "all" },
              { label: "Wrong Price", value: "wrong_price" },
              { label: "Wrong Ingredients", value: "wrong_ingredients" },
              { label: "Broken Link", value: "broken_link" },
              { label: "Availability Problem", value: "availability_issue" },
            ],
          },
        ]}
        columns={columns}
        data={reports}
        keyExtractor={(r) => r.id}
        loading={loading}
      />

      {/* STATUS UPDATE MODAL */}
      {selectedReport && (
        <Modal
          open={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          title="Review Product Report"
        >
          <form onSubmit={handleSaveStatus} className="space-y-4 max-w-md">
            <div className="p-3 rounded bg-background-elevated space-y-1 text-xs">
              <span className="text-foreground-faint text-[0.7rem] uppercase font-bold block">
                Customer Feedback
              </span>
              <strong className="text-foreground block">{selectedReport.productName}</strong>
              <p className="text-foreground-muted">{selectedReport.description}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Resolution Status *
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ReportStatus)}
                className="w-full bg-background rounded px-3 py-2 text-xs border border-line focus:outline-hidden focus:border-sage-deep"
              >
                <option value="open">Open</option>
                <option value="reviewing">Reviewing</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Admin Notes / Action Taken
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="e.g. Verified listing on Nykaa and corrected price to ₹549."
                rows={3}
                className="w-full bg-background rounded p-2 text-xs border border-line focus:outline-hidden focus:border-sage-deep"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
              <Button type="button" variant="outline" size="sm" onClick={() => setSelectedReport(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="clay" size="sm" loading={saving}>
                Update Report
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
