"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  X,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { addToast } = useToast();

  // Form Fields
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  // Status & Validation
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

    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setValidationAlert({
        isOpen: true,
        title: "Name Required",
        message: "Please enter your full name (minimum 2 characters).",
      });
      return;
    }

    if (!trimmedEmail) {
      setValidationAlert({
        isOpen: true,
        title: "Email Address Required",
        message: "Please provide your email address to create an account.",
      });
      return;
    }

    if (!isGeneralEmail) {
      setValidationAlert({
        isOpen: true,
        title: "Invalid Email Address",
        message: "Please provide a valid email address (e.g. yourname@gmail.com).",
      });
      return;
    }

    if (!password || password.length < 8) {
      setValidationAlert({
        isOpen: true,
        title: "Password Too Short",
        message: "Password must be at least 8 characters long for account security.",
      });
      return;
    }

    if (password !== confirmPassword) {
      setValidationAlert({
        isOpen: true,
        title: "Passwords Do Not Match",
        message: "The confirmation password does not match the chosen password. Please re-enter both.",
      });
      return;
    }

    setLoading(true);

    try {
      await register({
        name: trimmedName,
        email: trimmedEmail.toLowerCase(),
        password,
        confirmPassword,
      });

      addToast({
        type: "success",
        title: "Account Created!",
        description: `Welcome to BeautyIQ, ${trimmedName}!`,
      });
      router.push("/onboarding");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Registration failed. Please try again.";
      setError(message);
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
      <div className="fixed inset-0 z-[60] bg-foreground/40 backdrop-blur-md flex items-center justify-center p-4">
        {/* Modal Card */}
        <div className="relative z-10 w-full max-w-md rounded-3xl border border-line/40 bg-background-card p-6 sm:p-8 shadow-elevated text-foreground my-auto max-h-[92vh] overflow-y-auto">
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
            <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground">
              Create an Account
            </h2>
            <p className="text-xs text-foreground-muted">
              Sign up with your Gmail to unlock personalized skincare intelligence.
            </p>
          </div>

          {error && (
            <div className="mb-4">
              <Alert variant="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            <Input
              id="page-signup-name"
              label="Full Name"
              placeholder="e.g. Aanya Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<User className="h-4 w-4" />}
              autoComplete="name"
              required
            />

            <Input
              id="page-signup-email"
              label="Gmail Address"
              type="email"
              placeholder="name@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="h-4 w-4" />}
              autoComplete="email"
              required
            />

            <Input
              id="page-signup-password"
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
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
              autoComplete="new-password"
              required
            />

            <Input
              id="page-signup-confirm-password"
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-foreground-muted hover:text-foreground focus:outline-none p-1"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              autoComplete="new-password"
              required
            />

            <Button
              type="submit"
              id="page-signup-submit"
              variant="accent"
              size="lg"
              className="w-full font-semibold shadow-subtle mt-2"
              isLoading={loading}
              disabled={loading}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Create Account
            </Button>
          </form>

          {/* Bottom links */}
          <div className="pt-4 text-center text-xs text-foreground-muted border-t border-line mt-5">
            <p>
              Already have an account?{" "}
              <Link href="/login" className="text-sage-deep font-semibold hover:underline">
                Sign In
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
