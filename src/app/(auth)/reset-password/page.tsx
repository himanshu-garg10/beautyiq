"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { AuthService } from "@/services/auth.service";
import { useToast } from "@/context/toast-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Lock, ArrowRight } from "lucide-react";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams ? searchParams.get("token") || "demo-token" : "demo-token";

  const { addToast } = useToast();
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword || newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await AuthService.resetPassword(token, newPassword, confirmPassword);
      if (!res.success) {
        throw new Error(res.error?.message || "Reset failed");
      }

      addToast({
        type: "success",
        title: "Password Reset Complete",
        description: "Your password has been updated. Please sign in with your new credentials.",
      });

      router.push("/login");
    } catch (err: any) {
      setError(err.message || "Invalid or expired password reset token.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 rounded border border-line bg-background-card p-8 shadow-md">
      <div className="text-center space-y-2">
        <Link href="/" className="inline-block">
          <span className="font-display text-2xl tracking-tight text-foreground">
            Beauty<span className="italic text-sage-deep">IQ</span>
          </span>
        </Link>
        <h2 className="font-display text-2xl font-bold text-foreground">
          Set New Password
        </h2>
        <p className="text-xs text-foreground-muted">
          Enter a strong new password for your BeautyIQ account.
        </p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="New Password"
          type="password"
          placeholder="At least 8 characters"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          leftIcon={<Lock className="h-4 w-4" />}
          required
        />

        <Input
          label="Confirm New Password"
          type="password"
          placeholder="Re-enter new password"
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
          Update Password
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-background">
      <React.Suspense fallback={<div className="text-center text-foreground-muted">Loading...</div>}>
        <ResetPasswordContent />
      </React.Suspense>
    </div>
  );
}
