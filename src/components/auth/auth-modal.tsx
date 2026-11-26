"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User as UserIcon,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import {
  ValidationAlertDialog,
  ValidationAlertState,
} from "@/components/auth/validation-alert-dialog";
import { cn } from "@/lib/utils";

export function AuthModal() {
  const { isAuthModalOpen, authModalMode, closeAuthModal, login, register } = useAuth();
  const { addToast } = useToast();

  const [mounted, setMounted] = React.useState(false);
  const [mode, setMode] = React.useState<"login" | "register" | "forgot-password">("login");

  // Login Form States
  const [loginEmail, setLoginEmail] = React.useState("");
  const [loginPassword, setLoginPassword] = React.useState("");
  const [showLoginPassword, setShowLoginPassword] = React.useState(false);

  // Register Form States
  const [registerName, setRegisterName] = React.useState("");
  const [registerEmail, setRegisterEmail] = React.useState("");
  const [registerPassword, setRegisterPassword] = React.useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = React.useState("");
  const [showRegisterPassword, setShowRegisterPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = React.useState("");
  const [forgotSuccess, setForgotSuccess] = React.useState(false);

  // Form Validation & Feedback
  const [generalError, setGeneralError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Validation Popup Modal State
  const [validationAlert, setValidationAlert] = React.useState<ValidationAlertState>({
    isOpen: false,
    title: "",
    message: "",
  });

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Sync mode with context
  React.useEffect(() => {
    if (authModalMode) {
      setMode(authModalMode);
      setGeneralError(null);
    }
  }, [authModalMode]);

  // Handle ESC key and scroll lock
  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isAuthModalOpen) {
        closeAuthModal();
      }
    }
    if (isAuthModalOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", onKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isAuthModalOpen, closeAuthModal]);

  if (!mounted) return null;

  // Email validation helpers
  const currentEmail = mode === "login" ? loginEmail.trim() : registerEmail.trim();
  const isGmailFormat = currentEmail.toLowerCase().endsWith("@gmail.com");
  const isGeneralEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentEmail);

  // Switch tabs
  const handleSwitchMode = (newMode: "login" | "register" | "forgot-password") => {
    setMode(newMode);
    setGeneralError(null);
    setForgotSuccess(false);
  };

  // Login Submit Handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailTrimmed = loginEmail.trim();
    if (!emailTrimmed) {
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

    if (!loginPassword) {
      setValidationAlert({
        isOpen: true,
        title: "Password Required",
        message: "Please enter your password to sign in.",
      });
      return;
    }

    setGeneralError(null);
    setLoading(true);

    try {
      await login(emailTrimmed.toLowerCase(), loginPassword);
      addToast({
        type: "success",
        title: "Welcome Back!",
        description: `Signed in as ${emailTrimmed}`,
      });
      closeAuthModal();
    } catch {
      setGeneralError("Invalid email or password. Please verify your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Sign Up Submit Handler
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameTrimmed = registerName.trim();
    if (!nameTrimmed || nameTrimmed.length < 2) {
      setValidationAlert({
        isOpen: true,
        title: "Name Required",
        message: "Please enter your full name (minimum 2 characters).",
      });
      return;
    }

    const emailTrimmed = registerEmail.trim();
    if (!emailTrimmed) {
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

    if (!registerPassword || registerPassword.length < 8) {
      setValidationAlert({
        isOpen: true,
        title: "Password Too Short",
        message: "Password must be at least 8 characters long for account security.",
      });
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setValidationAlert({
        isOpen: true,
        title: "Passwords Do Not Match",
        message: "The confirmation password does not match the chosen password.",
      });
      return;
    }

    setGeneralError(null);
    setLoading(true);

    try {
      await register({
        name: nameTrimmed,
        email: emailTrimmed.toLowerCase(),
        password: registerPassword,
        confirmPassword: registerConfirmPassword,
      });
      addToast({
        type: "success",
        title: "Account Created Successfully!",
        description: `Welcome to BeautyIQ, ${nameTrimmed}.`,
      });
      closeAuthModal();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed. Please try again.";
      setGeneralError(message);
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Submit Handler (Dispatches real email via Resend)
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailTrimmed = forgotEmail.trim();
    if (!emailTrimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setValidationAlert({
        isOpen: true,
        title: "Valid Email Required",
        message: "Please enter a valid email address to receive reset instructions.",
      });
      return;
    }

    setGeneralError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "email", target: emailTrimmed }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "Could not send the recovery email.");
      }
      setForgotSuccess(true);
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : "Could not send the recovery email.");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isAuthModalOpen && (
        <motion.div
          id="auth-modal-overlay"
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-foreground/40 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAuthModal}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
            className="relative z-10 w-full max-w-md rounded-3xl border border-line/40 bg-background-card p-6 sm:p-8 shadow-elevated text-foreground my-auto max-h-[92vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0 }}
          >
            {/* Close Button */}
            <button
              type="button"
              id="auth-modal-close-btn"
              onClick={closeAuthModal}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 rounded-full p-2 text-foreground-muted hover:text-foreground hover:bg-background-elevated transition-colors"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header / Brand */}
            <div className="text-center space-y-1.5 mb-5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sage-tint text-sage-deep text-[0.7rem] font-semibold tracking-wide uppercase">
                <Sparkles className="h-3 w-3" />
                <span>Skincare Intelligence</span>
              </div>
              <h2 id="auth-modal-title" className="font-display text-3xl font-semibold tracking-tight text-foreground">
                Beauty<span className="italic text-gold-gradient">IQ</span>
              </h2>
              <p className="text-xs text-foreground-muted">
                {mode === "login"
                  ? "Sign in with your Gmail to access your skin profile and recommendations."
                  : mode === "register"
                  ? "Create your account with Gmail to unlock personalized skincare intelligence."
                  : "Enter your email to receive password recovery instructions."}
              </p>
            </div>

            {/* Mode Switcher Tabs (Sign In vs Create Account) */}
            {mode !== "forgot-password" && (
              <div className="grid grid-cols-2 p-1 bg-background-elevated rounded-xl border border-line mb-5">
                <button
                  type="button"
                  id="tab-switch-login"
                  onClick={() => handleSwitchMode("login")}
                  className={cn(
                    "py-2 text-xs font-semibold rounded-lg transition-all text-center",
                    mode === "login"
                      ? "bg-background-card text-foreground shadow-xs border border-line/40 font-bold"
                      : "text-foreground-muted hover:text-foreground"
                  )}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  id="tab-switch-register"
                  onClick={() => handleSwitchMode("register")}
                  className={cn(
                    "py-2 text-xs font-semibold rounded-lg transition-all text-center",
                    mode === "register"
                      ? "bg-background-card text-foreground shadow-xs border border-line/40 font-bold"
                      : "text-foreground-muted hover:text-foreground"
                  )}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* General Error Alert */}
            {generalError && (
              <div className="mb-4">
                <Alert variant="error" onClose={() => setGeneralError(null)}>
                  {generalError}
                </Alert>
              </div>
            )}

            {/* Mode: LOGIN */}
            {mode === "login" && (
              <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
                <Input
                  id="login-email-input"
                  label="Gmail Address"
                  type="email"
                  placeholder="name@gmail.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  leftIcon={<Mail className="h-4 w-4" />}
                  autoComplete="email"
                  required
                />

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label
                      htmlFor="login-password-input"
                      className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      id="forgot-password-link"
                      onClick={() => handleSwitchMode("forgot-password")}
                      className="text-xs text-sage-deep font-semibold hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input
                    id="login-password-input"
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    leftIcon={<Lock className="h-4 w-4" />}
                    rightIcon={
                      <button
                        type="button"
                        id="toggle-login-password-btn"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="text-foreground-muted hover:text-foreground focus:outline-none p-1"
                        aria-label={showLoginPassword ? "Hide password" : "Show password"}
                      >
                        {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }
                    autoComplete="current-password"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  id="login-submit-btn"
                  variant="accent"
                  size="lg"
                  className="w-full font-semibold shadow-subtle mt-2"
                  isLoading={loading}
                  disabled={loading}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Sign In with Gmail
                </Button>

                <div className="pt-3 text-center text-xs text-foreground-muted border-t border-line">
                  <p>
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      id="switch-to-register-btn"
                      onClick={() => handleSwitchMode("register")}
                      className="text-sage-deep font-semibold hover:underline"
                    >
                      Create Account
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* Mode: REGISTER */}
            {mode === "register" && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5" noValidate>
                <Input
                  id="register-name-input"
                  label="Full Name"
                  placeholder="e.g. Aanya Sharma"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  leftIcon={<UserIcon className="h-4 w-4" />}
                  autoComplete="name"
                  required
                />

                <Input
                  id="register-email-input"
                  label="Gmail Address"
                  type="email"
                  placeholder="name@gmail.com"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  leftIcon={<Mail className="h-4 w-4" />}
                  autoComplete="email"
                  required
                />

                <Input
                  id="register-password-input"
                  label="Password"
                  type={showRegisterPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  leftIcon={<Lock className="h-4 w-4" />}
                  rightIcon={
                    <button
                      type="button"
                      id="toggle-register-password-btn"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="text-foreground-muted hover:text-foreground focus:outline-none p-1"
                      aria-label={showRegisterPassword ? "Hide password" : "Show password"}
                    >
                      {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  autoComplete="new-password"
                  required
                />

                <Input
                  id="register-confirm-password-input"
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={registerConfirmPassword}
                  onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                  leftIcon={<Lock className="h-4 w-4" />}
                  rightIcon={
                    <button
                      type="button"
                      id="toggle-register-confirm-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-foreground-muted hover:text-foreground focus:outline-none p-1"
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  autoComplete="new-password"
                  required
                />

                <Button
                  type="submit"
                  id="register-submit-btn"
                  variant="accent"
                  size="lg"
                  className="w-full font-semibold shadow-subtle mt-2"
                  isLoading={loading}
                  disabled={loading}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Create Account
                </Button>

                <div className="pt-3 text-center text-xs text-foreground-muted border-t border-line">
                  <p>
                    Already have an account?{" "}
                    <button
                      type="button"
                      id="switch-to-login-btn"
                      onClick={() => handleSwitchMode("login")}
                      className="text-sage-deep font-semibold hover:underline"
                    >
                      Sign In
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* Mode: FORGOT PASSWORD */}
            {mode === "forgot-password" && (
              <div className="space-y-4">
                {forgotSuccess ? (
                  <div className="rounded-xl border border-line bg-sage-tint/40 p-5 text-center space-y-3">
                    <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-full bg-sage-deep text-white">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-sm text-foreground">Check Your Email</h3>
                    <p className="text-xs text-foreground-muted">
                      If an account exists with {forgotEmail}, a verification code and recovery instructions have been sent via email.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSwitchMode("login")}
                      className="mt-2 text-xs"
                    >
                      Back to Sign In
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotSubmit} className="space-y-4" noValidate>
                    <Input
                      id="forgot-email-input"
                      label="Gmail Address"
                      type="email"
                      placeholder="name@gmail.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      leftIcon={<Mail className="h-4 w-4" />}
                      autoComplete="email"
                      required
                    />

                    <Button
                      type="submit"
                      id="forgot-submit-btn"
                      variant="accent"
                      size="lg"
                      className="w-full font-semibold shadow-subtle mt-2"
                      isLoading={loading}
                      disabled={loading}
                      rightIcon={<ArrowRight className="h-4 w-4" />}
                    >
                      Send Verification Email
                    </Button>

                    <div className="pt-3 text-center text-xs text-foreground-muted border-t border-line">
                      <button
                        type="button"
                        id="back-to-login-btn"
                        onClick={() => handleSwitchMode("login")}
                        className="text-sage-deep font-semibold hover:underline"
                      >
                        Back to Sign In
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Pop-up Validation Alert Dialog */}
      <ValidationAlertDialog
        state={validationAlert}
        onClose={() => setValidationAlert((prev) => ({ ...prev, isOpen: false }))}
      />
    </AnimatePresence>,
    document.body
  );
}
