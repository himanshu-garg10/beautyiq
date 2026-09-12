"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = React.useState("customer@beautyiq.com");
  const [password, setPassword] = React.useState("password123");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    setLoading(true);
    try {
      const redirectPath = await login(email, password);
      addToast({
        type: "success",
        title: "Welcome back!",
        description: `Signed in as ${email}`,
      });
      router.push(redirectPath);
    } catch (err: any) {
      setError(err.message || "Invalid email or password.");
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
            Sign In to Your Account
          </h2>
          <p className="text-xs text-foreground-muted">
            Access your skin profile, saved wishlist, and recommendations.
          </p>
        </div>

        {error && (
          <Alert variant="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="h-4 w-4" />}
            required
          />

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs text-sage-deep font-semibold hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="h-4 w-4" />}
              required
            />
          </div>

          <Button
            type="submit"
            variant="accent"
            size="lg"
            className="w-full"
            isLoading={loading}
            disabled={loading}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Sign In
          </Button>
        </form>

        <div className="pt-4 text-center text-xs text-foreground-muted border-t border-line space-y-3">
          <p>
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-sage-deep font-semibold hover:underline">
              Create Account
            </Link>
          </p>

          <div className="rounded bg-background-elevated p-3 space-y-1 text-left">
            <span className="font-semibold text-foreground block">Quick Demo Login Shortcuts:</span>
            <div className="flex items-center justify-between text-xs font-mono">
              <button
                type="button"
                onClick={() => {
                  setEmail("customer@beautyiq.com");
                  setPassword("password123");
                }}
                className="text-sage-deep hover:underline"
              >
                Customer Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("admin@beautyiq.com");
                  setPassword("admin123");
                }}
                className="text-clay hover:underline"
              >
                Admin Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
