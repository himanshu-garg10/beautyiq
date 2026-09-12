"use client";

import * as React from "react";
import Link from "next/link";
import { AuthService } from "@/services/auth.service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Mail, ArrowLeft, Send, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await AuthService.forgotPassword(email);
      if (res.data) {
        setSuccessMessage(res.data.message);
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
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
            Reset Password
          </h2>
          <p className="text-xs text-foreground-muted">
            Enter your registered email address to receive password recovery instructions.
          </p>
        </div>

        {error && <Alert variant="error">{error}</Alert>}

        {successMessage ? (
          <div className="text-center py-6 space-y-4">
            <CheckCircle2 className="h-12 w-12 text-status-success mx-auto" />
            <p className="text-sm text-foreground-muted leading-relaxed">
              {successMessage}
            </p>
            <div className="pt-2">
              <Link href="/login">
                <Button variant="outline">Return to Sign In</Button>
              </Link>
            </div>
          </div>
        ) : (
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

            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="w-full"
              isLoading={loading}
              disabled={loading}
              rightIcon={<Send className="h-4 w-4" />}
            >
              Send Reset Token
            </Button>
          </form>
        )}

        <div className="pt-2 text-center border-t border-line">
          <Link href="/login" className="inline-flex items-center gap-1 text-xs text-foreground-muted hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
