"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/navigation/Navbar";
import { HeroSection as Hero } from "@/components/hero/HeroSection";
import { TrustStrip } from "@/components/home/trust-strip";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import {
  ValidationAlertDialog,
  ValidationAlertState,
} from "@/components/auth/validation-alert-dialog";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  X,
} from "lucide-react";

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LoginForm />
    </React.Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { addToast } = useToast();

  // Form State
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  // Status & Error
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Validation Popup Modal State
  const [validationAlert, setValidationAlert] = React.useState<ValidationAlertState>({
    isOpen: false,
    title: "",
    message: "",
  });

  const trimmedEmail = email.trim();
  const isGmailFormat = trimmedEmail.toLowerCase().endsWith("@gmail.com");
  const isGeneralEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation for Email Address
    if (!trimmedEmail) {
      setValidationAlert({
        isOpen: true,
        title: "Email Address Required",
        message: "Please enter your email address to sign in.",
      });
      return;
    }

    if (!isGeneralEmail) {
      setValidationAlert({
        isOpen: true,
        title: "Invalid Email Address",
        message: "Please enter a valid email address (e.g. yourname@gmail.com).",
      });
      return;
    }

    if (!password) {
      setValidationAlert({
        isOpen: true,
        title: "Password Required",
        message: "Please enter your password to sign into your BeautyIQ account.",
      });
      return;
    }

    setLoading(true);

    try {
      const targetIdentifier = trimmedEmail.toLowerCase();
      const redirectPath = await login(targetIdentifier, password);

      addToast({
        type: "success",
        title: "Welcome back!",
        description: `Signed in as ${trimmedEmail}`,
      });

      const callbackUrl = searchParams.get("callbackUrl");
      const safeCallback =
        callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
          ? callbackUrl
          : null;
      router.push(safeCallback || redirectPath || "/account");
    } catch {
      setError("Invalid email or password. Please verify your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background selection:bg-champagne selection:text-foreground overflow-hidden">
      {/* Site Navbar */}
      <Navbar />

      {/* Website preview background (identical to opening the site) */}
      <div
        className="pt-[64px] pointer-events-none select-none opacity-85 filter blur-[2px] dark:opacity-30"
        aria-hidden="true"
      >
        <Hero />
        <TrustStrip />
      </div>

      {/* Floating Popup Overlay over site background */}
      <div className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-md flex items-center justify-center p-4">
        {/* Modal Card */}
        <div className="relative z-10 w-full max-w-md rounded-3xl border border-line bg-background-card p-6 sm:p-8 shadow-2xl text-foreground my-auto max-h-[92vh] overflow-y-auto">
          {/* Close button that returns to home */}
          <Link
            href="/"
            className="absolute top-4 right-4 sm:top-5 sm:right-5 rounded-full p-2 text-foreground-muted hover:text-foreground hover:bg-background-elevated transition-colors"
            aria-label="Close to Home"
          >
            <X className="h-5 w-5" />
          </Link>

          {/* Header */}
          <div className="text-center space-y-1.5 mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sage-tint text-sage-deep text-[0.7rem] font-semibold tracking-wide uppercase">
              <Sparkles className="h-3 w-3" />
              <span>Skincare Intelligence</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Sign In to Beauty<span className="italic text-sage-deep">IQ</span>
            </h2>
            <p className="text-xs text-foreground-muted">
              Enter your Gmail address to access your skin profile, saved routine, and wishlist.
            </p>
          </div>

          {error && (
            <div className="mb-4">
              <Alert variant="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            </div>
          )}

          {/* EMAIL (GMAIL) LOGIN FORM */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              id="page-login-email"
              label="Gmail Address"
              type="email"
              placeholder="name@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="h-4 w-4" />}
              autoComplete="email"
              required
            />

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="page-login-password"
                  className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-sage-deep font-semibold hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="page-login-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-foreground-muted hover:text-foreground focus:outline-none p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                autoComplete="current-password"
                required
              />
            </div>

            <Button
              type="submit"
              id="page-login-submit"
              variant="accent"
              size="lg"
              className="w-full font-semibold shadow-subtle mt-2"
              isLoading={loading}
              disabled={loading}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Sign In with Gmail
            </Button>
          </form>

          {/* Bottom switch to Sign Up */}
          <div className="pt-4 text-center text-xs text-foreground-muted border-t border-line mt-6">
            <p>
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-sage-deep font-semibold hover:underline">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Pop-up Validation Alert Dialog */}
      <ValidationAlertDialog
        state={validationAlert}
        onClose={() => setValidationAlert((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
