"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { User, Mail, Lock, ArrowRight, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validations
    if (!name || name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await register({ name, email, password, confirmPassword });
      addToast({
        type: "success",
        title: "Account Created Successfully!",
        description: "Welcome to BeautyIQ. Let's set up your skin profile.",
      });
      router.push("/onboarding");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-background">
      <div className="w-full max-w-md space-y-6 rounded border border-line bg-background-card p-8 shadow-md">
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Aanya Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftIcon={<User className="h-4 w-4" />}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="h-4 w-4" />}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="h-4 w-4" />}
            helperText="Minimum 8 characters"
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leftIcon={<Lock className="h-4 w-4" />}
            required
          />

          <Button
            type="submit"
            variant="accent"
            size="lg"
            className="w-full"
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
