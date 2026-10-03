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
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { AuthService } from "@/services/auth.service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export function AuthModal() {
  const { isAuthModalOpen, authModalMode, openAuthModal, closeAuthModal, login, register } = useAuth();
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
  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});
  const [generalError, setGeneralError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Sync mode with context
  React.useEffect(() => {
    if (authModalMode) {
      setMode(authModalMode);
      setErrors({});
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

  // Password Strength Calculation for Sign Up
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: "Weak", color: "bg-status-error" };
    if (score <= 3) return { score: 2, label: "Medium", color: "bg-amber-500" };
    return { score: 3, label: "Strong", color: "bg-sage-deep" };
  };

  const strength = getPasswordStrength(registerPassword);

  // Switch tabs
  const handleSwitchMode = (newMode: "login" | "register" | "forgot-password") => {
    setMode(newMode);
    setErrors({});
    setGeneralError(null);
    setForgotSuccess(false);
  };

  // Login Submit Handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    const emailTrimmed = loginEmail.trim();
    if (!emailTrimmed) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!loginPassword) {
      newErrors.password = "Password is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setGeneralError(null);
    setLoading(true);

    try {
      await login(emailTrimmed, loginPassword);
      addToast({
        type: "success",
        title: "Welcome back!",
        description: `Signed in as ${emailTrimmed}`,
      });
      closeAuthModal();
    } catch {
      setGeneralError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  // Sign Up Submit Handler
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    const nameTrimmed = registerName.trim();
    if (!nameTrimmed) {
      newErrors.name = "Full name is required.";
    } else if (nameTrimmed.length < 2) {
      newErrors.name = "Full name must be at least 2 characters.";
    }

    const emailTrimmed = registerEmail.trim();
    if (!emailTrimmed) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!registerPassword) {
      newErrors.password = "Password is required.";
    } else if (registerPassword.length < 8) {
      newErrors.password = "Password must be at least 8 characters long.";
    }

    if (!registerConfirmPassword) {
      newErrors.confirmPassword = "Confirm password is required.";
    } else if (registerPassword !== registerConfirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setGeneralError(null);
    setLoading(true);

    try {
      await register({
        name: nameTrimmed,
        email: emailTrimmed,
        password: registerPassword,
        confirmPassword: registerConfirmPassword,
      });
      addToast({
        type: "success",
        title: "Account Created Successfully!",
        description: `Welcome to BeautyIQ, ${nameTrimmed}.`,
      });
      closeAuthModal();
    } catch (err: any) {
      setGeneralError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Submit Handler
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailTrimmed = forgotEmail.trim();
    if (!emailTrimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setErrors({ email: "Please enter a valid email address." });
      return;
    }

    setErrors({});
    setGeneralError(null);
    setLoading(true);

    try {
      await AuthService.forgotPassword(emailTrimmed);
      setForgotSuccess(true);
    } catch (err: any) {
      setGeneralError(err.message || "Unable to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isAuthModalOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop with Blur */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeAuthModal}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal Container */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
            className="relative z-10 w-full max-w-md rounded-2xl border border-line bg-background-card p-6 sm:p-8 shadow-2xl text-foreground my-auto max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Close Button */}
            <button
              id="auth-modal-close-button"
              onClick={closeAuthModal}
              aria-label="Close dialog"
              className="absolute top-4 right-4 sm:top-5 sm:right-5 rounded-full p-2 text-foreground-muted hover:text-foreground hover:bg-background-elevated transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header / Brand */}
            <div className="text-center space-y-1.5 mb-6">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sage-tint text-sage-deep text-[0.7rem] font-semibold tracking-wide uppercase">
                <Sparkles className="h-3 w-3" />
                <span>Skincare Intelligence</span>
              </div>
              <h2 id="auth-modal-title" className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Beauty<span className="italic text-sage-deep">IQ</span>
              </h2>
              <p className="text-xs text-foreground-muted">
                {mode === "login"
                  ? "Sign in to access your skin profile, saved routine, and wishlist."
                  : mode === "register"
                    ? "Create your free account to unlock personalized recommendations."
                    : "Enter your email to receive password reset instructions."}
              </p>
            </div>

            {/* Mode Switcher Tabs (Login vs Register) */}
            {mode !== "forgot-password" && (
              <div className="grid grid-cols-2 p-1 bg-background-elevated rounded-xl border border-line mb-6">
                <button
                  type="button"
                  id="tab-switch-login"
                  onClick={() => handleSwitchMode("login")}
                  className={cn(
                    "py-2 text-xs font-semibold rounded-lg transition-all text-center",
                    mode === "login"
                      ? "bg-background-card text-foreground shadow-xs border border-line/40"
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
                      ? "bg-background-card text-foreground shadow-xs border border-line/40"
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
                <div>
                  <Input
                    id="login-email-input"
                    label="Email Address"
                    type="email"
                    placeholder="name@example.com"
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                    }}
                    error={errors.email}
                    leftIcon={<Mail className="h-4 w-4" />}
                    autoComplete="email"
                    required
                  />
                </div>

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
                      id="forgot-password-link-btn"
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
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                    }}
                    error={errors.password}
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
                  {loading ? "Signing In..." : "Sign In"}
                </Button>

                <div className="pt-4 text-center text-xs text-foreground-muted border-t border-line">
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
                <div>
                  <Input
                    id="register-name-input"
                    label="Full Name"
                    placeholder="e.g. Aanya Sharma"
                    value={registerName}
                    onChange={(e) => {
                      setRegisterName(e.target.value);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                    }}
                    error={errors.name}
                    leftIcon={<UserIcon className="h-4 w-4" />}
                    autoComplete="name"
                    required
                  />
                </div>

                <div>
                  <Input
                    id="register-email-input"
                    label="Email Address"
                    type="email"
                    placeholder="name@example.com"
                    value={registerEmail}
                    onChange={(e) => {
                      setRegisterEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                    }}
                    error={errors.email}
                    leftIcon={<Mail className="h-4 w-4" />}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Input
                    id="register-password-input"
                    label="Password"
                    type={showRegisterPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    value={registerPassword}
                    onChange={(e) => {
                      setRegisterPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                    }}
                    error={errors.password}
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

                  {/* Password Strength Indicator */}
                  {registerPassword && (
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between items-center text-[0.7rem]">
                        <span className="text-foreground-muted">Password Strength:</span>
                        <span className="font-semibold text-foreground">{strength.label}</span>
                      </div>
                      <div className="h-1.5 w-full bg-background-elevated rounded-full overflow-hidden flex gap-1">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-300",
                            strength.score >= 1 ? strength.color : "bg-transparent",
                            "w-1/3"
                          )}
                        />
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-300",
                            strength.score >= 2 ? strength.color : "bg-transparent",
                            "w-1/3"
                          )}
                        />
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-300",
                            strength.score >= 3 ? strength.color : "bg-transparent",
                            "w-1/3"
                          )}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Input
                    id="register-confirm-password-input"
                    label="Confirm Password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={registerConfirmPassword}
                    onChange={(e) => {
                      setRegisterConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                    }}
                    error={errors.confirmPassword}
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
                </div>

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
                  {loading ? "Creating Account..." : "Create Account"}
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
                      If an account exists with {forgotEmail}, we have dispatched a password reset link.
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
                      label="Your Account Email"
                      type="email"
                      placeholder="name@example.com"
                      value={forgotEmail}
                      onChange={(e) => {
                        setForgotEmail(e.target.value);
                        if (errors.email) setErrors({});
                      }}
                      error={errors.email}
                      leftIcon={<Mail className="h-4 w-4" />}
                      required
                    />

                    <Button
                      type="submit"
                      id="forgot-submit-btn"
                      variant="accent"
                      size="lg"
                      className="w-full font-semibold shadow-subtle"
                      isLoading={loading}
                      disabled={loading}
                    >
                      {loading ? "Sending..." : "Send Password Reset Link"}
                    </Button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => handleSwitchMode("login")}
                        className="text-xs text-sage-deep font-semibold hover:underline"
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
    </AnimatePresence>,
    document.body
  );
}
