"use client";

import * as React from "react";
import { AdminDataService } from "@/services/admin-data.service";
import type { AdminActivityLog, AdminEntity } from "@/types";
import { AdminTable, Column } from "@/components/admin/admin-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ClipboardList, Shield, Download, Eye, Clock } from "lucide-react";
import { useToast } from "@/context/toast-context";

export default function AdminLogsPage() {
  const { addToast } = useToast();
  const [logs, setLogs] = React.useState<AdminActivityLog[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [entityFilter, setEntityFilter] = React.useState("all");

  const [selectedLog, setSelectedLog] = React.useState<AdminActivityLog | null>(null);

  const loadLogs = React.useCallback(() => {
    setLoading(true);
    AdminDataService.getLogs({
      search,
      entity: entityFilter,
    }).then((data) => {
      setLogs(data);
      setLoading(false);
    });
  }, [search, entityFilter]);

  React.useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleExportLogs = () => {
    const jsonStr = JSON.stringify(logs, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `beautyiq-admin-audit-logs-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    addToast({
      type: "success",
      title: "Logs Exported",
      description: "Audit trail downloaded as JSON.",
    });
  };

  const columns: Column<AdminActivityLog>[] = [
    {
      header: "Timestamp",
      render: (l) => (
        <span className="font-mono text-foreground-faint text-[0.75rem] flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {l.timestamp}
        </span>
      ),
    },
    {
      header: "Admin Actor",
      render: (l) => (
        <div>
          <span className="font-semibold text-foreground block text-xs">{l.adminName}</span>
          <span className="text-foreground-muted text-[0.7rem] font-mono">{l.adminEmail}</span>
        </div>
      ),
    },
    {
      header: "Action & Entity",
      render: (l) => (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[0.7rem] font-bold px-1.5 py-0.5 rounded bg-sage-tint/40 text-sage-deep uppercase">
              {l.action}
            </span>
            <span className="text-foreground text-xs font-semibold">{l.entityName}</span>
          </div>
          <p className="text-foreground-muted text-[0.7rem] truncate mt-0.5 max-w-sm">
            {l.details}
          </p>
        </div>
      ),
    },
    {
      header: "Target Entity",
      render: (l) => (
        <Badge variant="default">
          {l.entity.toUpperCase()}
        </Badge>
      ),
    },
    {
      header: "Status",
      render: (l) => (
        <Badge variant={l.status === "success" ? "sage" : "clay"}>
          {l.status.toUpperCase()}
        </Badge>
      ),
    },
    {
      header: "Inspect",
      className: "text-right",
      render: (l) => (
        <div className="flex items-center justify-end">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => setSelectedLog(l)}
            leftIcon={<Eye className="h-3 w-3" />}
          >
            Details
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <AdminTable
        title="Administrative Activity Audit Trail"
        description="Immutable administrative actions log tracking catalog modifications, listing updates, pricing changes, report resolutions, and account status toggles."
        searchPlaceholder="Search audit log by entity name, action, or admin..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={[
          {
            key: "entity",
            label: "Entity",
            value: entityFilter,
            onChange: setEntityFilter,
            options: [
              { label: "All Entities", value: "all" },
              { label: "Product", value: "product" },
              { label: "Listing", value: "listing" },
              { label: "Ingredient", value: "ingredient" },
              { label: "Brand", value: "brand" },
              { label: "Category", value: "category" },
              { label: "Customer", value: "customer" },
              { label: "Report", value: "report" },
              { label: "Support", value: "support" },
            ],
          },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportLogs}
            leftIcon={<Download className="h-4 w-4" />}
          >
            Export Logs (JSON)
          </Button>
        }
        columns={columns}
        data={logs}
        keyExtractor={(l) => l.id}
        loading={loading}
      />

      {/* LOG INSPECTION MODAL */}
      {selectedLog && (
        <Modal
          open={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title="Audit Log Event Inspection"
        >
          <div className="space-y-4 max-w-md text-xs">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="font-mono text-sage-deep font-bold">{selectedLog.id}</span>
              <Badge variant={selectedLog.status === "success" ? "sage" : "clay"}>
                {selectedLog.status.toUpperCase()}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded bg-background-elevated space-y-1">
                <span className="text-foreground-faint text-[0.65rem] uppercase font-bold block">
                  Action Code
                </span>
                <strong className="font-mono text-foreground text-xs">{selectedLog.action}</strong>
              </div>

              <div className="p-3 rounded bg-background-elevated space-y-1">
                <span className="text-foreground-faint text-[0.65rem] uppercase font-bold block">
                  Entity Type
                </span>
                <strong className="text-foreground uppercase text-xs">{selectedLog.entity}</strong>
              </div>

              <div className="p-3 rounded bg-background-elevated space-y-1">
                <span className="text-foreground-faint text-[0.65rem] uppercase font-bold block">
                  Target Entity
                </span>
                <strong className="text-foreground text-xs">{selectedLog.entityName}</strong>
              </div>

              <div className="p-3 rounded bg-background-elevated space-y-1">
                <span className="text-foreground-faint text-[0.65rem] uppercase font-bold block">
                  Timestamp
                </span>
                <strong className="font-mono text-foreground text-xs">{selectedLog.timestamp}</strong>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-line bg-background-elevated/40 space-y-1">
              <span className="text-foreground-faint text-[0.65rem] uppercase font-bold block">
                Operation Details
              </span>
              <p className="text-foreground leading-relaxed">{selectedLog.details}</p>
            </div>

            <div className="p-3 rounded bg-background-elevated space-y-1">
              <span className="text-foreground-faint text-[0.65rem] uppercase font-bold block">
                Executing Administrator
              </span>
              <p className="text-foreground font-semibold">
                {selectedLog.adminName} ({selectedLog.adminEmail})
              </p>
            </div>

            <div className="flex justify-end pt-3 border-t border-line">
              <Button variant="outline" size="sm" onClick={() => setSelectedLog(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
