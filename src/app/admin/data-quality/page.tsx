"use client";

import * as React from "react";
import { AdminDataService } from "@/services/admin-data.service";
import { DataSourceService } from "@/services/data-pipeline/data-source.service";
import { PipelineOrchestratorService } from "@/services/data-pipeline/pipeline-orchestrator.service";
import { RawStorageService } from "@/services/data-pipeline/raw-storage.service";
import type {
  DataQualityIssue,
  DuplicateCandidate,
  DataSource,
  DataPipelineRunLog,
  RawProductRecord,
} from "@/types";
import { AdminTable, Column } from "@/components/admin/admin-table";
import { AdminConfirmModal } from "@/components/admin/admin-confirm-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/context/toast-context";
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Copy,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Play,
  FileText,
  Radio,
  Server,
  XCircle,
  ExternalLink,
  Code,
  ShieldAlert,
} from "lucide-react";

export default function AdminDataQualityPage() {
  const { addToast } = useToast();
  const [issues, setIssues] = React.useState<DataQualityIssue[]>([]);
  const [duplicates, setDuplicates] = React.useState<DuplicateCandidate[]>([]);
  const [sources, setSources] = React.useState<DataSource[]>([]);
  const [pipelineLogs, setPipelineLogs] = React.useState<DataPipelineRunLog[]>([]);
  const [failedRecords, setFailedRecords] = React.useState<RawProductRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<"issues" | "duplicates" | "pipeline" | "sources" | "sandbox">("issues");

  // Duplicate action state
  const [selectedCandidate, setSelectedCandidate] = React.useState<DuplicateCandidate | null>(null);
  const [actionType, setActionType] = React.useState<"merged" | "dismissed">("dismissed");
  const [actionLoading, setActionLoading] = React.useState(false);

  // Sandbox state
  const [sandboxSourceId, setSandboxSourceId] = React.useState("src-brand-direct");
  const [sandboxPayload, setSandboxPayload] = React.useState(
    JSON.stringify(
      [
        {
          name: "10% Niacinamide Face Serum with Zinc",
          brand: "Minimalist India",
          category: "Serum",
          quantity: "30 ml",
          unit: "ml",
          price: 549,
          originalPrice: 599,
          allIngredients: ["Aqua", "Niacinamide", "Zinc PCA", "Glycerin"],
          rating: 4.8,
          source: "Minimalist Brand Feed",
          sourceUrl: "https://beminimalist.co/products/niacinamide-10",
          availability: "Available",
        },
        {
          name: "Gentle Skin Cleanser",
          brand: "CETAPHIL",
          category: "Cleanser",
          quantity: "125 ml",
          unit: "ml",
          price: 335,
          allIngredients: ["Aqua", "Cetyl Alcohol", "Propylene Glycol", "Sodium Lauryl Sulfate"],
          rating: 4.6,
          source: "Cetaphil Official Catalog",
          sourceUrl: "https://cetaphil.in/products/gentle-skin-cleanser",
          availability: "Available",
        },
      ],
      null,
      2
    )
  );
  const [sandboxRunning, setSandboxRunning] = React.useState(false);
  const [sandboxResult, setSandboxResult] = React.useState<DataPipelineRunLog | null>(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    const [issueData, dupData, sourceData, logData, failedData] = await Promise.all([
      AdminDataService.getDataQualityIssues(),
      AdminDataService.getDuplicateCandidates(),
      DataSourceService.getDataSources(),
      PipelineOrchestratorService.getPipelineLogs(),
      RawStorageService.getFailedRecords(),
    ]);
    setIssues(issueData);
    setDuplicates(dupData);
    setSources(sourceData);
    setPipelineLogs(logData);
    setFailedRecords(failedData);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleResolveIssue = async (id: string) => {
    await AdminDataService.resolveDataQualityIssue(id);
    loadData();
    addToast({
      type: "success",
      title: "Issue Resolved",
      description: "Data quality item marked as resolved.",
    });
  };

  const handleConfirmDuplicateAction = async () => {
    if (!selectedCandidate) return;
    setActionLoading(true);

    await AdminDataService.resolveDuplicateCandidate(selectedCandidate.id, actionType);

    setActionLoading(false);
    setSelectedCandidate(null);
    loadData();
    addToast({
      type: "success",
      title: `Candidate ${actionType === "merged" ? "Merged" : "Dismissed"}`,
      description: `Duplicate review item #${selectedCandidate.id} completed.`,
    });
  };

  const handleTriggerSync = async (source: DataSource) => {
    if (!DataSourceService.isSourcePermitted(source)) {
      addToast({
        type: "error",
        title: "Ingestion Blocked",
        description: `Source "${source.name}" is pending approval. Scraping or unapproved feeds are forbidden.`,
      });
      return;
    }

    setLoading(true);
    // Trigger benchmark real ingestion for source
    const sampleItems = [
      {
        name: `${source.name.includes("Cetaphil") ? "Cetaphil" : "Minimalist"} Daily Hydrating Serum`,
        brand: source.name.includes("Cetaphil") ? "Cetaphil" : "Minimalist",
        category: "Serum",
        quantity: 50,
        unit: "ml",
        price: 599,
        originalPrice: 650,
        allIngredients: ["Aqua", "Hyaluronic Acid", "Panthenol", "Glycerin"],
        rating: 4.7,
        source: source.name,
        sourceUrl: source.endpoint || "https://beminimalist.co",
        availability: "Available",
      },
    ];

    const log = await PipelineOrchestratorService.runIngestionPipeline(source.id, sampleItems);
    await loadData();

    addToast({
      type: log.status === "failed" ? "error" : "success",
      title: "Sync Completed",
      description: `Pipeline ${log.id}: ${log.recordsAccepted} accepted, ${log.recordsCreated} created in catalog.`,
    });
  };

  const handleRunSandbox = async () => {
    try {
      const parsed = JSON.parse(sandboxPayload);
      if (!Array.isArray(parsed)) {
        throw new Error("Payload must be a JSON array of product records.");
      }
      setSandboxRunning(true);
      const log = await PipelineOrchestratorService.runIngestionPipeline(sandboxSourceId, parsed);
      setSandboxResult(log);
      setSandboxRunning(false);
      loadData();
      addToast({
        type: log.status === "failed" ? "error" : "success",
        title: "Pipeline Sandbox Execution Finished",
        description: `Ingested ${log.recordsReceived} items: ${log.recordsAccepted} accepted, ${log.recordsRejected} rejected.`,
      });
    } catch (e: any) {
      setSandboxRunning(false);
      addToast({
        type: "error",
        title: "Invalid JSON Payload",
        description: e.message || "Failed to parse JSON",
      });
    }
  };

  const issueColumns: Column<DataQualityIssue>[] = [
    {
      header: "Entity & Issue Type",
      render: (i) => (
        <div>
          <strong className="text-foreground block font-semibold">{i.entityName}</strong>
          <div className="flex items-center gap-1.5 text-[0.7rem] text-foreground-muted mt-0.5">
            <span className="uppercase font-mono font-bold text-sage-deep">{i.entityType}</span>
            <span>•</span>
            <span className="capitalize">{i.issueType.replace(/_/g, " ")}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Severity",
      render: (i) => (
        <Badge
          variant={
            i.severity === "high"
              ? "clay"
              : i.severity === "medium"
              ? "default"
              : "sage"
          }
        >
          {i.severity.toUpperCase()}
        </Badge>
      ),
    },
    {
      header: "Description",
      render: (i) => (
        <span className="text-foreground-muted text-xs leading-relaxed line-clamp-2">
          {i.description}
        </span>
      ),
    },
    {
      header: "Status",
      render: (i) => (
        <Badge variant={i.status === "resolved" ? "sage" : "default"}>
          {i.status.toUpperCase()}
        </Badge>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      render: (i) => (
        <div className="flex items-center justify-end">
          {i.status === "pending" ? (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs px-2"
              onClick={() => handleResolveIssue(i.id)}
              leftIcon={<CheckCircle2 className="h-3 w-3 text-status-success" />}
            >
              Resolve
            </Button>
          ) : (
            <span className="text-foreground-faint text-[0.7rem] italic">Resolved</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Data Pipeline &amp; Quality Intelligence
            </h1>
            <Badge variant="sage" className="text-[0.65rem] uppercase">
              Stage 10 Architecture
            </Badge>
          </div>
          <p className="text-xs text-foreground-muted mt-1">
            Real product data ingestion, source registry, raw payload storage, schema validation, normalization, and duplicate detection.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg border border-line bg-background-elevated self-start lg:self-auto">
          <button
            onClick={() => setActiveTab("issues")}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
              activeTab === "issues"
                ? "bg-background-card text-foreground shadow-xs"
                : "text-foreground-muted hover:text-foreground"
            }`}
          >
            Issues ({issues.filter((i) => i.status === "pending").length})
          </button>
          <button
            onClick={() => setActiveTab("duplicates")}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
              activeTab === "duplicates"
                ? "bg-background-card text-foreground shadow-xs"
                : "text-foreground-muted hover:text-foreground"
            }`}
          >
            Duplicates ({duplicates.filter((d) => d.status === "pending").length})
          </button>
          <button
            onClick={() => setActiveTab("sources")}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
              activeTab === "sources"
                ? "bg-background-card text-foreground shadow-xs"
                : "text-foreground-muted hover:text-foreground"
            }`}
          >
            Data Sources ({sources.length})
          </button>
          <button
            onClick={() => setActiveTab("pipeline")}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
              activeTab === "pipeline"
                ? "bg-background-card text-foreground shadow-xs"
                : "text-foreground-muted hover:text-foreground"
            }`}
          >
            Execution Logs ({pipelineLogs.length})
          </button>
          <button
            onClick={() => setActiveTab("sandbox")}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1 ${
              activeTab === "sandbox"
                ? "bg-background-card text-foreground shadow-xs"
                : "text-foreground-muted hover:text-foreground"
            }`}
          >
            <Code className="h-3.5 w-3.5" /> Pipeline Sandbox
          </button>
        </div>
      </div>

      {/* TAB 1: DATA QUALITY ISSUES */}
      {activeTab === "issues" && (
        <AdminTable
          title="Catalog Completeness & Field Issues"
          description="Incomplete entities automatically flagged for missing ingredients, unpriced listings, or outdated records."
          columns={issueColumns}
          data={issues}
          keyExtractor={(i) => i.id}
          loading={loading}
        />
      )}

      {/* TAB 2: DUPLICATE CANDIDATE REVIEW MATRIX */}
      {activeTab === "duplicates" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-line bg-background-card p-5 space-y-2 shadow-subtle">
            <h2 className="font-display text-lg font-bold text-foreground">
              Duplicate Review Queue
            </h2>
            <p className="text-xs text-foreground-muted">
              Products flagged with moderate identity confidence (65%-89%) across platforms. Merging links multi-platform listings to a single canonical Product entity without silent data overwrite.
            </p>
          </div>

          <div className="space-y-4">
            {duplicates.length === 0 ? (
              <div className="p-8 text-center text-sm text-foreground-muted border border-line rounded bg-background-card">
                No pending duplicate review candidates.
              </div>
            ) : (
              duplicates.map((dup) => {
                const isPending = dup.status === "pending";
                return (
                  <div
                    key={dup.id}
                    className={`rounded-lg border p-5 space-y-4 shadow-subtle transition-all ${
                      isPending
                        ? "border-line bg-background-card"
                        : "border-line/60 bg-background-card/50 opacity-75"
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-line pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-600">
                          {dup.entityType} Duplicate Candidate
                        </span>
                        <span className="text-xs font-semibold text-foreground">
                          Match Confidence: {dup.similarityScore}%
                        </span>
                      </div>

                      <Badge variant={dup.status === "pending" ? "clay" : "sage"}>
                        {dup.status.toUpperCase()}
                      </Badge>
                    </div>

                    {/* Side-by-Side Comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-3.5 rounded bg-background-elevated/60 border border-line space-y-1">
                        <span className="text-[0.65rem] uppercase font-bold text-foreground-faint block">
                          Existing Record A (ID: {dup.item1.id})
                        </span>
                        <strong className="text-foreground text-sm font-semibold block">
                          {dup.item1.name}
                        </strong>
                        <p className="text-foreground-muted">{dup.item1.details}</p>
                      </div>

                      <div className="p-3.5 rounded bg-background-elevated/60 border border-line space-y-1">
                        <span className="text-[0.65rem] uppercase font-bold text-foreground-faint block">
                          Candidate Record B (ID: {dup.item2.id})
                        </span>
                        <strong className="text-foreground text-sm font-semibold block">
                          {dup.item2.name}
                        </strong>
                        <p className="text-foreground-muted">{dup.item2.details}</p>
                      </div>
                    </div>

                    {/* Match Reasons */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-foreground-faint text-[0.7rem] uppercase font-bold">
                        Detection Reasons:
                      </span>
                      {dup.reasons.map((r, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-background-elevated text-foreground-muted text-[0.75rem]"
                        >
                          {r}
                        </span>
                      ))}
                    </div>

                    {isPending && (
                      <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCandidate(dup);
                            setActionType("dismissed");
                          }}
                        >
                          Dismiss as Distinct
                        </Button>

                        <Button
                          variant="clay"
                          size="sm"
                          onClick={() => {
                            setSelectedCandidate(dup);
                            setActionType("merged");
                          }}
                        >
                          Confirm &amp; Merge Records
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: DATA SOURCES REGISTRY */}
      {activeTab === "sources" && (
        <div className="space-y-6">
          <div className="rounded-lg border border-line bg-background-card p-5 space-y-2 shadow-subtle">
            <h2 className="font-display text-lg font-bold text-foreground">
              Approved Data Source Registry
            </h2>
            <p className="text-xs text-foreground-muted">
              BeautyIQ connects exclusively to permitted APIs, approved datasets, and direct product feeds. Unauthorized scraping, bot bypass, and anti-scraping evasion are strictly forbidden.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sources.map((src) => {
              const isApproved = src.permissionStatus === "approved";
              return (
                <div
                  key={src.id}
                  className={`rounded-lg border p-5 space-y-4 shadow-subtle ${
                    isApproved ? "border-line bg-background-card" : "border-amber-300 dark:border-amber-900 bg-amber-50/20 dark:bg-amber-950/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-semibold text-foreground text-base">
                          {src.name}
                        </h3>
                        <Badge variant={isApproved ? "sage" : "warning"}>
                          {src.permissionStatus.toUpperCase()}
                        </Badge>
                      </div>
                      <span className="text-[0.7rem] font-mono text-foreground-faint uppercase">
                        Type: {src.type} • Auth: {src.authType}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-sage-deep block">
                        {src.reliabilityScore}% Trust
                      </span>
                      <span className="text-[0.65rem] text-foreground-faint">Reliability</span>
                    </div>
                  </div>

                  <p className="text-xs text-foreground-muted leading-relaxed">
                    {src.dataCoverage}
                  </p>

                  <div className="text-[0.7rem] font-mono text-foreground-faint space-y-0.5 border-t border-line pt-2">
                    <div>Last Sync: {src.lastSuccessfulUpdate || "Never"}</div>
                    {src.endpoint && <div className="truncate">Endpoint: {src.endpoint}</div>}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    {isApproved ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTriggerSync(src)}
                        leftIcon={<RefreshCw className="h-3.5 w-3.5 text-sage-deep" />}
                      >
                        Trigger Ingestion Sync
                      </Button>
                    ) : (
                      <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 text-xs font-medium">
                        <ShieldAlert className="h-4 w-4" /> Permission Pending
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: PIPELINE EXECUTION LOGS */}
      {activeTab === "pipeline" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-line bg-background-card p-5 space-y-2 shadow-subtle flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">
                Pipeline Execution Audit Trail
              </h2>
              <p className="text-xs text-foreground-muted">
                Detailed run logs recording records received, accepted, rejected, updated, created, and duplicate candidate detections.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={loadData} leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
              Refresh Logs
            </Button>
          </div>

          <div className="space-y-3">
            {pipelineLogs.length === 0 ? (
              <div className="p-8 text-center text-sm text-foreground-muted border border-line rounded bg-background-card">
                No pipeline execution logs recorded yet. Run a sync from the Data Sources tab or Sandbox.
              </div>
            ) : (
              pipelineLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded border border-line bg-background-card p-4 space-y-3 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={log.status === "success" ? "sage" : log.status === "warning" ? "clay" : "warning"}>
                        {log.status.toUpperCase()}
                      </Badge>
                      <strong className="text-foreground text-sm font-semibold">
                        {log.sourceName}
                      </strong>
                      <span className="text-[0.7rem] font-mono text-foreground-faint">
                        ({log.id})
                      </span>
                    </div>

                    <span className="text-xs font-mono text-foreground-muted">
                      {log.startedAt}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs text-center">
                    <div className="p-2 rounded bg-background-elevated">
                      <span className="text-foreground-faint text-[0.65rem] block uppercase">Received</span>
                      <strong className="text-foreground font-mono text-sm">{log.recordsReceived}</strong>
                    </div>
                    <div className="p-2 rounded bg-background-elevated">
                      <span className="text-foreground-faint text-[0.65rem] block uppercase">Accepted</span>
                      <strong className="text-status-success font-mono text-sm">{log.recordsAccepted}</strong>
                    </div>
                    <div className="p-2 rounded bg-background-elevated">
                      <span className="text-foreground-faint text-[0.65rem] block uppercase">Created</span>
                      <strong className="text-sage-deep font-mono text-sm">{log.recordsCreated}</strong>
                    </div>
                    <div className="p-2 rounded bg-background-elevated">
                      <span className="text-foreground-faint text-[0.65rem] block uppercase">Updated</span>
                      <strong className="text-foreground font-mono text-sm">{log.recordsUpdated}</strong>
                    </div>
                    <div className="p-2 rounded bg-background-elevated">
                      <span className="text-foreground-faint text-[0.65rem] block uppercase">Rejected</span>
                      <strong className="text-status-error font-mono text-sm">{log.recordsRejected}</strong>
                    </div>
                    <div className="p-2 rounded bg-background-elevated">
                      <span className="text-foreground-faint text-[0.65rem] block uppercase">Duplicates</span>
                      <strong className="text-amber-600 font-mono text-sm">{log.duplicatesDetected}</strong>
                    </div>
                  </div>

                  {log.errors.length > 0 && (
                    <div className="p-2.5 rounded bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300 space-y-1">
                      <span className="font-semibold block text-[0.7rem] uppercase">
                        Validation &amp; Processing Warnings:
                      </span>
                      {log.errors.map((err, i) => (
                        <div key={i} className="font-mono text-[0.7rem]">• {err}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: RAW INGESTION SANDBOX */}
      {activeTab === "sandbox" && (
        <div className="space-y-6">
          <div className="rounded-lg border border-line bg-background-card p-5 space-y-2 shadow-subtle">
            <h2 className="font-display text-lg font-bold text-foreground">
              Raw Data Ingestion &amp; Pipeline Sandbox
            </h2>
            <p className="text-xs text-foreground-muted">
              Test-run raw product payloads through the 10-stage pipeline: Validation → Cleaning → Brand &amp; Category Normalization → Ingredient Resolution → Product Identity Matching → Data Confidence assessment.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Input JSON Editor */}
            <div className="space-y-3 rounded-lg border border-line bg-background-card p-5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-xs text-foreground uppercase tracking-wider">
                  Raw External Payload (JSON Array)
                </label>
                <select
                  value={sandboxSourceId}
                  onChange={(e) => setSandboxSourceId(e.target.value)}
                  className="text-xs border border-line rounded px-2 py-1 bg-background-elevated text-foreground"
                >
                  {sources.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.permissionStatus})
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                value={sandboxPayload}
                onChange={(e) => setSandboxPayload(e.target.value)}
                rows={16}
                className="w-full font-mono text-xs p-3 rounded border border-line bg-background-elevated text-foreground leading-relaxed focus:outline-none focus:ring-1 focus:ring-sage-deep"
              />

              <Button
                variant="clay"
                className="w-full"
                onClick={handleRunSandbox}
                loading={sandboxRunning}
                leftIcon={<Play className="h-4 w-4" />}
              >
                Execute 10-Stage Pipeline
              </Button>
            </div>

            {/* Pipeline Output */}
            <div className="space-y-4">
              <div className="rounded-lg border border-line bg-background-card p-5 space-y-3">
                <h3 className="font-display font-semibold text-foreground text-sm flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-sage-deep" /> Pipeline Execution Results
                </h3>

                {sandboxResult ? (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-2 rounded bg-background-elevated">
                      <span className="font-semibold text-foreground">Status:</span>
                      <Badge variant={sandboxResult.status === "success" ? "sage" : "warning"}>
                        {sandboxResult.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="p-2 rounded bg-background-elevated">
                        <span className="text-foreground-faint text-[0.65rem] block uppercase">Accepted</span>
                        <strong className="text-status-success font-mono text-base">{sandboxResult.recordsAccepted}</strong>
                      </div>
                      <div className="p-2 rounded bg-background-elevated">
                        <span className="text-foreground-faint text-[0.65rem] block uppercase">Rejected</span>
                        <strong className="text-status-error font-mono text-base">{sandboxResult.recordsRejected}</strong>
                      </div>
                      <div className="p-2 rounded bg-background-elevated">
                        <span className="text-foreground-faint text-[0.65rem] block uppercase">Created Products</span>
                        <strong className="text-sage-deep font-mono text-base">{sandboxResult.recordsCreated}</strong>
                      </div>
                      <div className="p-2 rounded bg-background-elevated">
                        <span className="text-foreground-faint text-[0.65rem] block uppercase">Duplicate Candidates</span>
                        <strong className="text-amber-600 font-mono text-base">{sandboxResult.duplicatesDetected}</strong>
                      </div>
                    </div>

                    {sandboxResult.errors.length > 0 && (
                      <div className="p-3 rounded bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 space-y-1">
                        <span className="font-semibold block text-[0.7rem] uppercase">Errors &amp; Rejected Items:</span>
                        {sandboxResult.errors.map((err, i) => (
                          <div key={i} className="font-mono text-[0.7rem]">• {err}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-foreground-muted italic py-8 text-center">
                    Execute the pipeline on the sample payload to inspect real normalization, validation, and database updates.
                  </p>
                )}
              </div>

              {/* Failed Raw Storage Audit */}
              {failedRecords.length > 0 && (
                <div className="rounded-lg border border-amber-300 dark:border-amber-900 bg-amber-50/30 dark:bg-amber-950/10 p-5 space-y-2">
                  <h4 className="font-display text-sm font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4" /> Preserved Failed Raw Records ({failedRecords.length})
                  </h4>
                  <p className="text-[0.75rem] text-foreground-muted">
                    Failed records are preserved intact for error correction and re-processing.
                  </p>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pt-1">
                    {failedRecords.map((fr) => (
                      <div key={fr.id} className="p-2 rounded bg-background-card border border-line text-[0.7rem]">
                        <strong className="text-foreground">{fr.sourceName} (#{fr.externalRecordId})</strong>
                        <span className="text-rose-600 block font-mono">{fr.failureReason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DUPLICATE ACTION MODAL */}
      <AdminConfirmModal
        open={!!selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        onConfirm={handleConfirmDuplicateAction}
        title={actionType === "merged" ? "Merge Candidate Duplicate" : "Dismiss Duplicate Candidate"}
        description={
          actionType === "merged"
            ? `Are you sure you want to merge "${selectedCandidate?.item2.name}" into "${selectedCandidate?.item1.name}"? Historical ratings and price listings will be mapped to the primary record.`
            : `Are you sure you want to dismiss this duplicate review? Both "${selectedCandidate?.item1.name}" and "${selectedCandidate?.item2.name}" will remain as distinct catalog entities.`
        }
        confirmLabel={actionType === "merged" ? "Merge Records" : "Dismiss Candidate"}
        confirmVariant={actionType === "merged" ? "clay" : "primary"}
        loading={actionLoading}
      />
    </div>
  );
}
