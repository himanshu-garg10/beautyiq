"use client";

import * as React from "react";
import { AdminService } from "@/services/admin.service";
import type { AdminMetric, ActivityLog } from "@/types";
import { Activity, Database, Package, Users, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = React.useState<AdminMetric | null>(null);
  const [logs, setLogs] = React.useState<ActivityLog[]>([]);

  React.useEffect(() => {
    AdminService.getMetrics().then((res) => {
      if (res.data) setMetrics(res.data);
    });
    AdminService.getActivityLogs().then((res) => {
      if (res.data) setLogs(res.data);
    });
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="sage">System Overview</Badge>
          <span className="text-xs text-status-success font-mono flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> All Services Operational
          </span>
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Admin Operations Dashboard
        </h1>
        <p className="text-sm text-foreground-muted">
          Platform performance metrics, scrapers, data quality pipeline, and audit logs.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded border border-line bg-background-card p-5 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
              Total Users
            </span>
            <Users className="h-5 w-5 text-sage-deep" />
          </div>
          <p className="font-mono text-3xl font-bold text-foreground mt-3">
            {metrics?.totalUsers.toLocaleString() || "14,280"}
          </p>
          <p className="text-xs text-status-success mt-1">↑ 12% growth this month</p>
        </div>

        <div className="rounded border border-line bg-background-card p-5 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
              Catalog Products
            </span>
            <Package className="h-5 w-5 text-clay" />
          </div>
          <p className="font-mono text-3xl font-bold text-foreground mt-3">
            {metrics?.totalProducts.toLocaleString() || "1,845"}
          </p>
          <p className="text-xs text-foreground-faint mt-1">Across 8 skincare categories</p>
        </div>

        <div className="rounded border border-line bg-background-card p-5 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
              Data Quality
            </span>
            <Database className="h-5 w-5 text-status-info" />
          </div>
          <p className="font-mono text-3xl font-bold text-foreground mt-3">
            {metrics?.dataQualityScore || 98.4}%
          </p>
          <p className="text-xs text-status-warning mt-1">
            {metrics?.duplicateQueueCount || 3} duplicates in review queue
          </p>
        </div>

        <div className="rounded border border-line bg-background-card p-5 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
              System Health
            </span>
            <Activity className="h-5 w-5 text-status-success" />
          </div>
          <p className="font-mono text-3xl font-bold text-status-success mt-3">
            {metrics?.systemHealth || "Optimal"}
          </p>
          <p className="text-xs text-foreground-faint mt-1">
            {metrics?.scrapesLast24h || 4200} price updates synced (24h)
          </p>
        </div>
      </div>

      {/* System Activity Logs */}
      <div className="space-y-4">
        <h3 className="font-display text-xl font-semibold text-foreground">
          Recent System & Scraper Logs
        </h3>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Actor / System</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target Entity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-mono text-xs text-foreground-faint">
                  {log.timestamp}
                </TableCell>
                <TableCell className="font-medium text-foreground">{log.actorEmail}</TableCell>
                <TableCell className="font-mono text-xs">{log.action}</TableCell>
                <TableCell>{log.target}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      log.status === "success"
                        ? "sage"
                        : log.status === "warning"
                        ? "clay"
                        : "neutral"
                    }
                  >
                    {log.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-foreground-muted max-w-xs truncate">
                  {log.details}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
