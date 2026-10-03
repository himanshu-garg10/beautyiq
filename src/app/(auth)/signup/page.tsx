"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SignupPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const [fieldErrors, setFieldErrors] = React.useState<{ [key: string]: string }>({});
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

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

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const errors: { [key: string]: string } = {};

    const trimmedName = name.trim();
    if (!trimmedName) {
      errors.name = "Please enter your full name.";
    } else if (trimmedName.length < 2) {
      errors.name = "Full name must be at least 2 characters.";
    }

    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail) {
      errors.email = "Please enter your email address.";
    } else if (!emailRegex.test(trimmedEmail)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!password) {
      errors.password = "Please enter a password.";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters long.";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setLoading(true);

    try {
      await register({ name: trimmedName, email: trimmedEmail, password, confirmPassword });
      addToast({
        type: "success",
        title: "Account Created Successfully!",
        description: `Welcome to BeautyIQ, ${trimmedName}. Let's set up your profile.`,
      });
      router.push("/onboarding");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-background">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-line bg-background-card p-8 shadow-xl">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <span className="font-display text-2xl tracking-tight text-foreground">
              Beauty<span className="italic text-sage-deep">IQ</span>
            </span>
          </Link>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Create Your Account
          </h2>
          <p className="text-xs text-foreground-muted">
            Start discovering skincare tailored to your unique profile.
          </p>
        </div>

        {error && (
          <Alert variant="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
          <Input
            id="page-signup-name"
            label="Full Name"
            placeholder="e.g. Aanya Sharma"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: "" }));
            }}
            error={fieldErrors.name}
            leftIcon={<User className="h-4 w-4" />}
            required
          />

          <Input
            id="page-signup-email"
            label="Email Address"
            type="email"
            placeholder="e.g. name@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: "" }));
            }}
            error={fieldErrors.email}
            leftIcon={<Mail className="h-4 w-4" />}
            required
          />

          <div className="space-y-1">
            <Input
              id="page-signup-password"
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: "" }));
              }}
              error={fieldErrors.password}
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
              required
            />
            {password && (
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

          <Input
            id="page-signup-confirm"
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
            }}
            error={fieldErrors.confirmPassword}
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-foreground-muted hover:text-foreground focus:outline-none p-1"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
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
            {loading ? "Creating Account..." : "Create Free Account"}
          </Button>
        </form>

        <p className="text-center text-xs text-foreground-muted border-t border-line pt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-sage-deep font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
