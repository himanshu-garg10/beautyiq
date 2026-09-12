"use client";

import * as React from "react";
import { AdminDataService } from "@/services/admin-data.service";
import type { SupportRequest, SupportStatus, SupportPriority } from "@/types";
import { AdminTable, Column } from "@/components/admin/admin-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/context/toast-context";
import { LifeBuoy, Send, MessageSquare, Edit2, Clock, AlertTriangle } from "lucide-react";

export default function AdminSupportPage() {
  const { addToast } = useToast();
  const [tickets, setTickets] = React.useState<SupportRequest[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [priorityFilter, setPriorityFilter] = React.useState("all");

  // Selected Ticket Modal
  const [selectedTicket, setSelectedTicket] = React.useState<SupportRequest | null>(null);
  const [replyText, setReplyText] = React.useState("");
  const [newStatus, setNewStatus] = React.useState<SupportStatus>("resolved");
  const [saving, setSaving] = React.useState(false);

  const loadSupport = React.useCallback(() => {
    setLoading(true);
    AdminDataService.getSupportRequests({
      status: statusFilter,
      priority: priorityFilter,
    }).then((data) => {
      setTickets(data);
      setLoading(false);
    });
  }, [statusFilter, priorityFilter]);

  React.useEffect(() => {
    loadSupport();
  }, [loadSupport]);

  const handleOpenTicket = (t: SupportRequest) => {
    setSelectedTicket(t);
    setReplyText(t.adminResponse || "");
    setNewStatus(t.status === "open" ? "in_progress" : t.status);
  };

  const handleSaveTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setSaving(true);

    const updated = await AdminDataService.updateSupportStatus(
      selectedTicket.id,
      newStatus,
      replyText.trim()
    );

    setSaving(false);
    setSelectedTicket(null);
    loadSupport();

    if (updated) {
      addToast({
        type: "success",
        title: "Ticket Updated",
        description: `Support request #${updated.id} marked as ${updated.status.toUpperCase()}.`,
      });
    }
  };

  const columns: Column<SupportRequest>[] = [
    {
      header: "Subject & Customer",
      render: (t) => (
        <div>
          <strong className="text-foreground block font-semibold">{t.subject}</strong>
          <div className="flex items-center gap-2 text-[0.7rem] text-foreground-muted mt-0.5">
            <span>{t.userName}</span>
            <span>•</span>
            <span className="font-mono">{t.userEmail}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Category",
      render: (t) => (
        <span className="capitalize text-xs font-medium text-foreground">
          {t.category}
        </span>
      ),
    },
    {
      header: "Priority",
      render: (t) => {
        const isUrgent = t.priority === "urgent" || t.priority === "high";
        return (
          <Badge variant={isUrgent ? "clay" : "default"}>
            {t.priority.toUpperCase()}
          </Badge>
        );
      },
    },
    {
      header: "Status",
      render: (t) => (
        <Badge
          variant={
            t.status === "resolved"
              ? "sage"
              : t.status === "in_progress"
              ? "default"
              : t.status === "closed"
              ? "default"
              : "clay"
          }
        >
          {t.status.replace("_", " ").toUpperCase()}
        </Badge>
      ),
    },
    {
      header: "Date",
      render: (t) => (
        <span className="font-mono text-foreground-faint text-[0.75rem]">
          {t.createdAt}
        </span>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      render: (t) => (
        <div className="flex items-center justify-end">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => handleOpenTicket(t)}
            leftIcon={<MessageSquare className="h-3 w-3" />}
          >
            Reply / Status
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <AdminTable
        title="Customer Support Requests"
        description="Review inquiries, sensitivity assistance requests, recommendation clarifications, and routine guidance."
        filters={[
          {
            key: "status",
            label: "Status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: "All Statuses", value: "all" },
              { label: "Open", value: "open" },
              { label: "In Progress", value: "in_progress" },
              { label: "Resolved", value: "resolved" },
              { label: "Closed", value: "closed" },
            ],
          },
          {
            key: "priority",
            label: "Priority",
            value: priorityFilter,
            onChange: setPriorityFilter,
            options: [
              { label: "All Priorities", value: "all" },
              { label: "Urgent", value: "urgent" },
              { label: "High", value: "high" },
              { label: "Medium", value: "medium" },
              { label: "Low", value: "low" },
            ],
          },
        ]}
        columns={columns}
        data={tickets}
        keyExtractor={(t) => t.id}
        loading={loading}
      />

      {/* TICKET RESPONSE MODAL */}
      {selectedTicket && (
        <Modal
          open={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title="Customer Inquiry & Reply"
        >
          <form onSubmit={handleSaveTicket} className="space-y-4 max-w-lg">
            <div className="p-3.5 rounded-lg border border-line bg-background-elevated space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-line pb-2">
                <span className="font-bold text-foreground">{selectedTicket.subject}</span>
                <Badge variant={selectedTicket.priority === "high" ? "clay" : "default"}>
                  {selectedTicket.priority.toUpperCase()}
                </Badge>
              </div>

              <p className="text-foreground-muted leading-relaxed">{selectedTicket.message}</p>

              <div className="pt-2 border-t border-line flex justify-between text-[0.7rem] text-foreground-faint">
                <span>
                  From: {selectedTicket.userName} ({selectedTicket.userEmail})
                </span>
                <span className="font-mono">{selectedTicket.createdAt}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Ticket Status *
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as SupportStatus)}
                className="w-full bg-background rounded px-3 py-2 text-xs border border-line focus:outline-hidden focus:border-sage-deep"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Internal Response / Customer Guidance
              </label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Compose administrative guidance or dermatological clarification..."
                rows={4}
                className="w-full bg-background rounded p-2 text-xs border border-line focus:outline-hidden focus:border-sage-deep"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
              <Button type="button" variant="outline" size="sm" onClick={() => setSelectedTicket(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="clay" size="sm" loading={saving} leftIcon={<Send className="h-3.5 w-3.5" />}>
                Save Response
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
