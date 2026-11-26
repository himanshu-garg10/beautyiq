"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Upload,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle,
  Star,
  ChevronDown,
  ChevronUp,
  Trash2,
  Sunrise,
  Moon,
  Sparkles,
  Info,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/layout/container";

// ─── Types ───────────────────────────────────────────────────────────────────

/**
 * State machine: intro → capture → analyzing → results
 * "intro" replaces the old "consent" step — consent is merged into the Start button.
 */
type ScanStep = "intro" | "capture" | "analyzing" | "results";
type CaptureTab = "camera" | "upload";

interface DetectedConcern {
  name: string;
  severity: "mild" | "moderate" | "severe";
  region: string;
  whatWeSee: string;
  possibleCauses: string[];
  howToCare: string[];
  suggestedIngredients: string[];
}

interface RoutineTips {
  morning: string[];
  night: string[];
}

interface ScanResult {
  detectedConcerns: DetectedConcern[];
  skinType: string | null;
  skinTypeReason: string;
  overallSummary: string;
  routineTips: RoutineTips;
  seeDermatologist: boolean;
  seeDermatologistReason: string;
  photoQualityOk: boolean;
  photoQualityIssue: string | null;
  scanId: string | null;
}

interface RecommendedProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  rating: number | null;
  image: string;
  slug: string;
}

interface ScanHistoryItem {
  id: string;
  skinType: string;
  concerns: Array<{ name?: string } | unknown>;
  summary: string;
  createdAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const severityVariant = {
  mild: "success",
  moderate: "warning",
  severe: "error",
} as const;

const severityLabel = { mild: "Mild", moderate: "Moderate", severe: "Severe" } as const;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function countConcerns(concerns: Array<{ name?: string } | unknown>): number {
  return Array.isArray(concerns) ? concerns.length : 0;
}

// ─── Rotating status messages for the analysis loading screen ────────────────

const ANALYSIS_MESSAGES = [
  "Checking photo quality…",
  "Looking at skin texture…",
  "Finding concerns…",
  "Analysing skin type…",
  "Preparing your tips…",
  "Almost done…",
];

function useRotatingMessage(active: boolean, intervalMs = 3500) {
  const [idx, setIdx] = React.useState(0);
  React.useEffect(() => {
    if (!active) { setIdx(0); return; }
    const id = setInterval(() => setIdx((i) => Math.min(i + 1, ANALYSIS_MESSAGES.length - 1)), intervalMs);
    return () => clearInterval(id);
  }, [active, intervalMs]);
  return ANALYSIS_MESSAGES[idx];
}

// ─── Face Outline SVG Overlay ─────────────────────────────────────────────────

function FaceOutlineOverlay() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 400 300"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <ellipse
        cx="200" cy="150" rx="90" ry="118"
        fill="none"
        stroke="rgba(255,255,255,0.75)"
        strokeWidth="2.5"
        strokeDasharray="8 5"
      />
    </svg>
  );
}

// ─── Concern Card ─────────────────────────────────────────────────────────────

function ConcernCard({ concern }: { concern: DetectedConcern }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="rounded-2xl border border-line bg-background-card shadow-subtle overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-background-elevated transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Badge variant={severityVariant[concern.severity]} className="shrink-0">
            {severityLabel[concern.severity]}
          </Badge>
          <span className="text-sm font-semibold text-foreground truncate">{concern.name}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-foreground-faint hidden sm:block">📍 {concern.region}</span>
          {open ? <ChevronUp className="h-4 w-4 text-foreground-muted" /> : <ChevronDown className="h-4 w-4 text-foreground-muted" />}
        </div>
      </button>

      <div className="px-4 pb-2 sm:hidden -mt-1">
        <span className="text-xs text-foreground-faint">📍 {concern.region}</span>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="border-t border-line/60 px-4 py-4 space-y-4">
              {concern.whatWeSee && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-foreground-faint">What we see</p>
                  <p className="text-sm text-foreground-muted leading-relaxed">{concern.whatWeSee}</p>
                </div>
              )}
              {concern.possibleCauses?.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-foreground-faint">Why it may happen</p>
                  <ul className="space-y-1">
                    {concern.possibleCauses.map((cause, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground-muted">
                        <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-champagne-deep/70" />
                        {cause}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {concern.howToCare?.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-foreground-faint">How to care</p>
                  <ul className="space-y-1.5">
                    {concern.howToCare.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground-muted">
                        <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-status-success" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {concern.suggestedIngredients?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-foreground-faint">Helpful ingredients</p>
                  <div className="flex flex-wrap gap-1.5">
                    {concern.suggestedIngredients.map((ing) => (
                      <Badge key={ing} variant="sage">{ing}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Routine Card ─────────────────────────────────────────────────────────────

function RoutineCard({ tips }: { tips: RoutineTips }) {
  if (!tips || (tips.morning.length === 0 && tips.night.length === 0)) return null;
  return (
    <div className="rounded-2xl border border-line bg-background-card p-5 space-y-5">
      <p className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-champagne-deep" />
        Your Simple Routine
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        {tips.morning.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground-muted flex items-center gap-1.5">
              <Sunrise className="h-3.5 w-3.5 text-champagne-deep" /> Morning
            </p>
            <ol className="space-y-2">
              {tips.morning.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground-muted">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-champagne-tint text-xs font-bold text-champagne-deep">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}
        {tips.night.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground-muted flex items-center gap-1.5">
              <Moon className="h-3.5 w-3.5 text-sage-deep" /> Night
            </p>
            <ol className="space-y-2">
              {tips.night.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground-muted">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sage-tint text-xs font-bold text-sage-deep">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Product Mini Card ────────────────────────────────────────────────────────

function ProductMiniCard({ product, concern }: { product: RecommendedProduct; concern: string }) {
  return (
    <Link
      href={`/products?concern=${encodeURIComponent(concern)}`}
      className="group flex items-center gap-3 rounded-xl border border-line bg-background-card p-3 hover:border-champagne/50 hover:bg-background-elevated transition-all shadow-subtle"
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-background-elevated">
        {product.image ? (
          <Image src={product.image} alt={product.name} fill className="object-cover" sizes="56px" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-foreground-faint text-xs">🧴</div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground truncate group-hover:text-champagne-deep transition-colors">{product.name}</p>
        <p className="text-xs text-foreground-muted truncate">{product.brand}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <Star className="h-3 w-3 text-champagne-deep fill-champagne-deep/40" />
          <span className="text-xs text-foreground-faint">{product.rating?.toFixed(1) ?? "—"}</span>
          <span className="text-xs text-foreground-faint">· {product.category}</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SkinScanPage() {
  // ── State machine ──────────────────────────────────────────────────────────
  // Using a ref for the "current" step to avoid stale-closure issues in
  // async callbacks, plus a React state to drive rendering.
  const stepRef = React.useRef<ScanStep>("intro");
  const [step, _setStep] = React.useState<ScanStep>("intro");
  const setStep = React.useCallback((next: ScanStep) => {
    stepRef.current = next;
    _setStep(next);
  }, []);

  const [captureTab, setCaptureTab] = React.useState<CaptureTab>("camera");
  const [capturedImage, setCapturedImage] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [scanResult, setScanResult] = React.useState<ScanResult | null>(null);
  const [recommendations, setRecommendations] = React.useState<RecommendedProduct[]>([]);
  const [recoLoading, setRecoLoading] = React.useState(false);
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [history, setHistory] = React.useState<ScanHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = React.useState(false);
  const [cameraPermissionDenied, setCameraPermissionDenied] = React.useState(false);
  const [cameraAvailable, setCameraAvailable] = React.useState(true);
  const [isDragging, setIsDragging] = React.useState(false);
  const [analyzeError, setAnalyzeError] = React.useState<string | null>(null);
  const [analyzing, setAnalyzing] = React.useState(false);

  // Busy guards: prevent double-clicks on each action
  const [busyStart, setBusyStart] = React.useState(false);
  const [busyCapture, setBusyCapture] = React.useState(false);
  const [busyAnalyze, setBusyAnalyze] = React.useState(false);

  const videoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const abortRef = React.useRef<AbortController | null>(null);

  const analysisMessage = useRotatingMessage(step === "analyzing");

  // ── Camera lifecycle ───────────────────────────────────────────────────────
  // Start/stop camera only when explicitly called, NOT via useEffect on step.
  // This avoids the double-fire that caused the two-clicks bug.

  const stopCamera = React.useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = React.useCallback(async () => {
    // Don't start if already streaming
    if (streamRef.current) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraAvailable(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      // Check if the user navigated away while waiting for permission
      if (stepRef.current !== "capture") {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      const error = err as Error;
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        setCameraPermissionDenied(true);
      } else {
        setCameraAvailable(false);
      }
    }
  }, []);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      stopCamera();
      abortRef.current?.abort();
    };
  }, [stopCamera]);

  // ── Go to capture step ─────────────────────────────────────────────────────

  const goToCapture = React.useCallback(async () => {
    if (busyStart) return;
    setBusyStart(true);
    setStep("capture");
    // Start camera after step is set so stepRef guard works
    await startCamera();
    setBusyStart(false);
  }, [busyStart, setStep, startCamera]);

  // ── Switch capture tab ─────────────────────────────────────────────────────

  const switchTab = React.useCallback((tab: CaptureTab) => {
    if (tab === "camera") {
      setCaptureTab("camera");
      void startCamera();
    } else {
      stopCamera();
      setCaptureTab("upload");
    }
  }, [startCamera, stopCamera]);

  // ── Capture photo ─────────────────────────────────────────────────────────

  const capturePhoto = React.useCallback(() => {
    if (busyCapture || !videoRef.current || !canvasRef.current) return;
    setBusyCapture(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) { setBusyCapture(false); return; }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        setBusyCapture(false);
        if (!blob) return;
        const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
        setCapturedImage(file);
        setPreviewUrl(URL.createObjectURL(file));
        stopCamera();
      },
      "image/jpeg",
      0.92,
    );
  }, [busyCapture, stopCamera]);

  // ── Retake ────────────────────────────────────────────────────────────────

  const retake = React.useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setCapturedImage(null);
    setPreviewUrl(null);
    setAnalyzeError(null);
    if (captureTab === "camera") void startCamera();
  }, [previewUrl, captureTab, startCamera]);

  // ── Upload ────────────────────────────────────────────────────────────────

  const handleFileSelect = React.useCallback((file: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setAnalyzeError("Please upload a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAnalyzeError("Image must be under 5 MB.");
      return;
    }
    setAnalyzeError(null);
    setCapturedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  }, []);

  const handleDrop = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  // ── Analyze ───────────────────────────────────────────────────────────────

  const analyzeSkin = React.useCallback(async () => {
    if (busyAnalyze || !capturedImage) return;
    setBusyAnalyze(true);
    setAnalyzeError(null);
    setAnalyzing(true);
    setStep("analyzing");

    // Cancel any previous in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const form = new FormData();
      form.append("image", capturedImage);

      // 60-second client timeout to match server maxDuration
      const timeoutId = setTimeout(() => controller.abort(), 60_000);

      let res: Response;
      try {
        res = await fetch("/api/ai/analyze-skin", {
          method: "POST",
          body: form,
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      // Guard: user may have cancelled
      if (controller.signal.aborted) return;

      const json = (await res.json()) as {
        success: boolean;
        data?: ScanResult;
        error?: { code: string; message: string };
      };

      if (!json.success || !json.data) {
        setAnalyzeError(json.error?.message ?? "Analysis failed. Please try again.");
        setStep("capture");
        return;
      }

      setScanResult(json.data);
      setStep("results");

      // Fetch product recommendations (non-fatal)
      if (json.data.detectedConcerns.length > 0) {
        setRecoLoading(true);
        const engineRequest = {
          requirements: {
            skinType: json.data.skinType ?? undefined,
            concerns: json.data.detectedConcerns.map((c) => c.name),
            goals: [],
            category: null,
            minPrice: null,
            maxPrice: null,
            preferredBrands: [],
            excludedBrands: [],
            preferredIngredients: [],
            avoidIngredients: [],
            knownAllergies: [],
            texturePreference: null,
            finishPreference: null,
            fragrancePreference: null,
            properties: [],
            extractedAt: new Date().toISOString(),
            isConfirmed: true,
            confidenceScores: {},
            id: `scan_${Date.now()}`,
            rawQuery: "skin scan",
          },
          priority: "CONCERN",
        };
        try {
          const recoRes = await fetch("/api/recommendations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(engineRequest),
          });
          const recoJson = (await recoRes.json()) as {
            success?: boolean;
            products?: RecommendedProduct[];
            data?: { products?: RecommendedProduct[] };
          };
          const products = recoJson?.products ?? recoJson?.data?.products ?? [];
          setRecommendations((products as RecommendedProduct[]).slice(0, 4));
        } catch {
          // non-fatal
        } finally {
          setRecoLoading(false);
        }
      }
    } catch (err) {
      if (controller.signal.aborted) {
        // User cancelled — stay on capture with the photo
        setStep("capture");
        setAnalyzeError(null);
      } else {
        const msg = err instanceof Error && err.name === "AbortError"
          ? "Analysis timed out. Please try again."
          : "Network error. Please try again.";
        setAnalyzeError(msg);
        setStep("capture");
      }
    } finally {
      setBusyAnalyze(false);
      setAnalyzing(false);
      if (abortRef.current === controller) abortRef.current = null;
    }
  }, [busyAnalyze, capturedImage, setStep]);

  // ── Cancel analysis ───────────────────────────────────────────────────────

  const cancelAnalysis = React.useCallback(() => {
    abortRef.current?.abort();
    setStep("capture");
    setAnalyzeError(null);
  }, [setStep]);

  // ── History ───────────────────────────────────────────────────────────────

  const loadHistory = React.useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch("/api/ai/skin-scan-history");
      if (res.ok) {
        const json = (await res.json()) as { data?: ScanHistoryItem[] };
        setHistory((json.data ?? []).slice(0, 5));
      }
    } catch {
      // non-fatal
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const deleteHistoryItem = React.useCallback(async (scanId: string) => {
    try {
      await fetch(`/api/ai/skin-scan-history?scanId=${scanId}`, { method: "DELETE" });
      setHistory((prev) => prev.filter((s) => s.id !== scanId));
    } catch {
      // non-fatal
    }
  }, []);

  // ── Reset to intro ────────────────────────────────────────────────────────

  const reset = React.useCallback(() => {
    abortRef.current?.abort();
    stopCamera();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setCapturedImage(null);
    setPreviewUrl(null);
    setScanResult(null);
    setRecommendations([]);
    setAnalyzeError(null);
    setCameraPermissionDenied(false);
    setCaptureTab("camera");
    setStep("intro");
  }, [previewUrl, stopCamera, setStep]);

  // ─────────────────────────────────────────────────────────────────────────

  const pageVariants = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -16, transition: { duration: 0.18 } },
  };

  const topConcernName = scanResult?.detectedConcerns[0]?.name ?? "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-elevated/40 to-background">
      <Container className="max-w-2xl py-10 sm:py-14">
        <AnimatePresence mode="wait">

          {/* ── STEP: Intro ───────────────────────────────────── */}
          {step === "intro" && (
            <motion.div
              key="intro"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-8"
            >
              {/* Title */}
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sage/30 bg-sage-tint/60 text-xs font-semibold text-sage-deep">
                  <Camera className="h-3.5 w-3.5" />
                  <span>AI-Powered Face Scan</span>
                </div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                  Skin Analysis
                </h1>
                <p className="text-foreground-muted text-base leading-relaxed max-w-md mx-auto">
                  Take or upload a selfie to get a plain-English breakdown of your skin — what
                  we see, why it happens, and how to care for it.
                </p>
              </div>

              {/* Quick tips */}
              <div className="rounded-2xl border border-line/60 bg-background-card p-5 space-y-3 shadow-card">
                <p className="text-sm font-semibold text-foreground">3 tips for a better scan</p>
                <ul className="space-y-2">
                  {[
                    "🌞  Use natural daylight or face a bright window",
                    "🚫  No filters, sunglasses, or heavy makeup",
                    "👤  Look straight at the camera, face centred",
                  ].map((tip) => (
                    <li key={tip} className="text-sm text-foreground-muted">{tip}</li>
                  ))}
                </ul>
              </div>

              {/* Privacy + disclaimer — compact inline rows */}
              <div className="space-y-2 text-xs text-foreground-faint">
                <p className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-sage-deep shrink-0" />
                  Your photo is analysed in memory and never stored on our servers.
                </p>
                <p className="flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-status-warning shrink-0" />
                  Cosmetic guidance only — not a medical diagnosis.
                </p>
              </div>

              {/* CTA with inline consent note */}
              <div className="space-y-2">
                <Button
                  size="lg"
                  variant="accent"
                  className="w-full rounded-full"
                  onClick={() => void goToCapture()}
                  disabled={busyStart}
                >
                  {busyStart ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                  Start Skin Scan
                </Button>
                <p className="text-center text-xs text-foreground-faint">
                  By continuing you agree to analysis of your photo for skincare guidance.
                </p>
              </div>
            </motion.div>
          )}

          {/* ── STEP: Capture ─────────────────────────────────── */}
          {step === "capture" && (
            <motion.div
              key="capture"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-6"
            >
              <div className="text-center space-y-1">
                <h2 className="font-display text-2xl font-bold text-foreground">
                  {previewUrl ? "Review Your Photo" : "Take or Upload a Photo"}
                </h2>
                <p className="text-sm text-foreground-muted">
                  Make sure your face is well-lit and clearly visible.
                </p>
              </div>

              {analyzeError && (
                <div className="rounded-xl border border-status-error/30 bg-status-error-bg px-4 py-3 text-sm text-status-error flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {analyzeError}
                </div>
              )}

              {previewUrl ? (
                /* ── Review photo ── */
                <div className="space-y-4">
                  <div className="relative mx-auto w-full max-w-sm aspect-[4/3] rounded-2xl overflow-hidden border border-line shadow-md">
                    <Image src={previewUrl} alt="Captured face" fill className="object-cover" />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-full"
                      onClick={retake}
                      disabled={busyAnalyze}
                    >
                      <RefreshCw className="h-4 w-4" />
                      Retake
                    </Button>
                    <Button
                      variant="accent"
                      className="flex-1 rounded-full"
                      onClick={() => void analyzeSkin()}
                      disabled={busyAnalyze}
                    >
                      {busyAnalyze ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      Analyze Skin
                    </Button>
                  </div>
                </div>
              ) : (
                /* ── Camera / upload ── */
                <div className="space-y-4">
                  {/* Tabs */}
                  <div className="flex rounded-xl overflow-hidden border border-line">
                    {(["camera", "upload"] as CaptureTab[]).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => switchTab(tab)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                          captureTab === tab
                            ? "bg-foreground text-background"
                            : "bg-background-card text-foreground-muted hover:bg-background-elevated"
                        }`}
                      >
                        {tab === "camera" ? <Camera className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
                        {tab === "camera" ? "Take Photo" : "Upload Photo"}
                      </button>
                    ))}
                  </div>

                  {captureTab === "camera" ? (
                    <div className="space-y-3">
                      {!cameraAvailable ? (
                        <div className="rounded-2xl border border-line bg-background-card p-6 text-center space-y-2">
                          <Camera className="h-10 w-10 mx-auto text-foreground-faint" />
                          <p className="text-sm text-foreground-muted">Camera is not available on this device or browser.</p>
                          <Button variant="outline" size="sm" onClick={() => switchTab("upload")}>Upload a Photo Instead</Button>
                        </div>
                      ) : cameraPermissionDenied ? (
                        <div className="rounded-2xl border border-status-error/30 bg-status-error-bg p-6 text-center space-y-2">
                          <AlertCircle className="h-10 w-10 mx-auto text-status-error" />
                          <p className="text-sm text-status-error font-semibold">Camera access was denied.</p>
                          <p className="text-xs text-foreground-muted">Please allow camera access in your browser settings and refresh, or upload a photo instead.</p>
                          <Button variant="outline" size="sm" onClick={() => switchTab("upload")}>Upload a Photo Instead</Button>
                        </div>
                      ) : (
                        <div className="relative mx-auto w-full max-w-sm aspect-[4/3] rounded-2xl overflow-hidden bg-black border border-line shadow-md">
                          <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
                          <FaceOutlineOverlay />
                        </div>
                      )}

                      <canvas ref={canvasRef} className="hidden" />

                      {!cameraPermissionDenied && cameraAvailable && (
                        <>
                          <p className="text-center text-xs text-foreground-faint">
                            💡 Face a window or bright light for best results. Keep your face centred in the oval.
                          </p>
                          <Button
                            variant="accent"
                            size="lg"
                            className="w-full rounded-full"
                            onClick={capturePhoto}
                            disabled={busyCapture}
                          >
                            {busyCapture ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Camera className="h-4 w-4" />
                            )}
                            Capture
                          </Button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative mx-auto flex w-full max-w-sm aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed transition-colors ${
                          isDragging
                            ? "border-sage-deep bg-sage-tint/40"
                            : "border-line hover:border-champagne/60 bg-background-card hover:bg-background-elevated"
                        }`}
                      >
                        <Upload className="h-10 w-10 text-foreground-faint" />
                        <div className="text-center">
                          <p className="text-sm font-medium text-foreground">Drop your photo here</p>
                          <p className="text-xs text-foreground-muted mt-1">or click to browse · JPEG, PNG, WebP · max 5 MB</p>
                        </div>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleFileSelect(f);
                          e.target.value = "";
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={reset}
                className="w-full text-center text-xs text-foreground-faint hover:text-foreground-muted transition-colors"
              >
                ← Back to overview
              </button>
            </motion.div>
          )}

          {/* ── STEP: Analyzing ───────────────────────────────── */}
          {step === "analyzing" && (
            <motion.div
              key="analyzing"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col items-center justify-center min-h-[60vh] gap-6"
            >
              {/* Photo preview thumbnail */}
              {previewUrl && (
                <div className="relative h-24 w-24 rounded-2xl overflow-hidden border border-line shadow-md">
                  <Image src={previewUrl} alt="Your photo" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/20" />
                </div>
              )}

              {/* Spinner */}
              <div className="relative h-20 w-20">
                <div className="absolute inset-0 rounded-full border-4 border-line" />
                <div className="absolute inset-0 rounded-full border-4 border-t-sage-deep animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera className="h-8 w-8 text-sage-deep" />
                </div>
              </div>

              {/* Rotating status message */}
              <div className="text-center space-y-1 max-w-xs">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={analysisMessage}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3 }}
                    className="text-lg font-semibold text-foreground"
                  >
                    {analysisMessage}
                  </motion.p>
                </AnimatePresence>
                <p className="text-sm text-foreground-muted">
                  Our AI is reading your photo carefully. This may take up to 30 seconds.
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full max-w-xs h-1.5 rounded-full bg-background-elevated overflow-hidden">
                <motion.div
                  className="h-full bg-sage-deep rounded-full"
                  initial={{ width: "5%" }}
                  animate={{ width: analyzing ? "90%" : "100%" }}
                  transition={{ duration: 25, ease: "linear" }}
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-foreground-faint">
                <ShieldCheck className="h-3.5 w-3.5" />
                Your photo is processed securely and never stored.
              </div>

              {/* Cancel */}
              <button
                type="button"
                onClick={cancelAnalysis}
                className="flex items-center gap-1.5 text-xs text-foreground-faint hover:text-foreground-muted transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </button>
            </motion.div>
          )}

          {/* ── STEP: Results ─────────────────────────────────── */}
          {step === "results" && scanResult && (
            <motion.div
              key="results"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-6"
            >
              {/* Photo quality error */}
              {!scanResult.photoQualityOk ? (
                <div className="space-y-4 text-center">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-status-warning-bg border border-status-warning/30 mx-auto">
                    <AlertCircle className="h-8 w-8 text-status-warning" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground">Photo Quality Issue</h2>
                  <p className="text-sm text-foreground-muted max-w-sm mx-auto">
                    {scanResult.photoQualityIssue ?? "We couldn't analyse your photo. Please try again with a clearer image."}
                  </p>
                  <Button variant="accent" size="lg" className="rounded-full" onClick={reset}>
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </Button>
                </div>
              ) : (
                <>
                  {/* Results header */}
                  <div className="text-center space-y-2">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-sage-tint border border-sage/30 mx-auto">
                      <CheckCircle className="h-7 w-7 text-sage-deep" />
                    </div>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Your Skin Analysis</h2>
                  </div>

                  {/* ── Overall Summary ─────────────────────────── */}
                  <div className="rounded-2xl border border-line/60 bg-background-card p-5 space-y-3 shadow-card">
                    <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Info className="h-4 w-4 text-champagne-deep" />
                      Overall Picture
                    </p>
                    <p className="text-sm text-foreground-muted leading-relaxed">
                      {scanResult.overallSummary || "Analysis complete."}
                    </p>
                    {scanResult.skinType && (
                      <div className="pt-1 flex flex-wrap items-center gap-2">
                        <Badge variant="sage" className="text-sm px-3 py-1">{scanResult.skinType} Skin</Badge>
                        {scanResult.skinTypeReason && (
                          <span className="text-xs text-foreground-faint">{scanResult.skinTypeReason}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ── Dermatologist notice ─────────────────────── */}
                  {scanResult.seeDermatologist && (
                    <div className="rounded-2xl border border-status-warning/40 bg-status-warning-bg p-4 flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-status-warning shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">We recommend seeing a dermatologist</p>
                        <p className="text-xs text-foreground-muted leading-relaxed">
                          {scanResult.seeDermatologistReason || "Some signs in your photo may benefit from a professional assessment. A dermatologist can give you a proper evaluation."}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ── Detected Concerns ───────────────────────── */}
                  {scanResult.detectedConcerns.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-foreground">
                        Detected Concerns ({scanResult.detectedConcerns.length})
                      </p>
                      <p className="text-xs text-foreground-faint -mt-1">
                        Tap each concern to see what we see, why it happens, and how to care for it.
                      </p>
                      <div className="space-y-2">
                        {scanResult.detectedConcerns.map((concern) => (
                          <ConcernCard key={concern.name} concern={concern} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-line bg-background-card p-5 text-center">
                      <CheckCircle className="h-8 w-8 text-status-success mx-auto mb-2" />
                      <p className="text-sm font-semibold text-foreground">Your skin looks great!</p>
                      <p className="text-xs text-foreground-muted mt-1">No significant cosmetic concerns detected.</p>
                    </div>
                  )}

                  {/* ── Routine Tips ─────────────────────────────── */}
                  <RoutineCard tips={scanResult.routineTips} />

                  {/* ── Recommended Products ─────────────────────── */}
                  {(recoLoading || recommendations.length > 0) && (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-foreground">Recommended Products</p>
                      {recoLoading ? (
                        <div className="flex items-center gap-2 py-4 text-sm text-foreground-muted">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Finding products for you…
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 gap-2">
                            {recommendations.map((product) => (
                              <ProductMiniCard key={product.id} product={product} concern={topConcernName} />
                            ))}
                          </div>
                          {topConcernName && (
                            <Link
                              href={`/products?concern=${encodeURIComponent(topConcernName)}`}
                              className="inline-flex items-center gap-1.5 text-xs text-champagne-deep font-medium hover:underline"
                            >
                              See all products for {topConcernName} →
                            </Link>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* ── Scan History ─────────────────────────────── */}
                  <div className="rounded-2xl border border-line/60 bg-background-card overflow-hidden shadow-card">
                    <button
                      type="button"
                      onClick={() => {
                        const next = !historyOpen;
                        setHistoryOpen(next);
                        if (next && history.length === 0) void loadHistory();
                      }}
                      className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-foreground hover:bg-background-elevated transition-colors"
                    >
                      <span>Scan History</span>
                      {historyOpen ? (
                        <ChevronUp className="h-4 w-4 text-foreground-muted" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-foreground-muted" />
                      )}
                    </button>
                    <AnimatePresence>
                      {historyOpen && (
                        <motion.div
                          key="history"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-line px-5 py-4 space-y-3">
                            {historyLoading ? (
                              <div className="flex items-center gap-2 text-sm text-foreground-muted">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading history…
                              </div>
                            ) : history.length === 0 ? (
                              <p className="text-sm text-foreground-muted">
                                No scan history found.{" "}
                                <Link href="/login" className="text-champagne-deep font-medium hover:underline">Sign in</Link>{" "}
                                to save your scans.
                              </p>
                            ) : (
                              history.map((scan) => (
                                <div
                                  key={scan.id}
                                  className="flex items-start justify-between gap-3 py-2 border-b border-line/60 last:border-0"
                                >
                                  <div className="min-w-0 space-y-0.5">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-semibold text-foreground">{scan.skinType} Skin</span>
                                      <Badge variant="neutral">{countConcerns(scan.concerns)} concerns</Badge>
                                    </div>
                                    <p className="text-xs text-foreground-faint">{formatDate(scan.createdAt)}</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => void deleteHistoryItem(scan.id)}
                                    className="shrink-0 rounded-lg p-1.5 text-foreground-faint hover:text-status-error hover:bg-status-error-bg/60 transition-colors"
                                    aria-label="Delete scan"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Guest note */}
                  {!scanResult.scanId && (
                    <p className="text-center text-xs text-foreground-faint">
                      <Link href="/login" className="text-champagne-deep font-medium hover:underline">Sign in</Link>{" "}
                      to save your scan history and track progress over time.
                    </p>
                  )}
                </>
              )}

              {/* Scan Again */}
              <Button variant="outline" size="lg" className="w-full rounded-full" onClick={reset}>
                <RefreshCw className="h-4 w-4" />
                Scan Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </div>
  );
}
