"use client";

import * as React from "react";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, CheckCircle2 } from "lucide-react";
import { useToast } from "@/context/toast-context";

export default function ContactPage() {
  const { addToast } = useToast();
  const [submitted, setSubmitted] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");
  const [form, setForm] = React.useState({ name: "", email: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error?.message || "Your message could not be sent. Please try again.");
      setSubmitted(true);
      addToast({ type: "success", title: "Message sent", description: "BeautyIQ support has received your inquiry." });
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Your message could not be sent. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-10 space-y-8 max-w-3xl">
      <div className="space-y-3 text-center">
        <Badge variant="sage" className="mx-auto">
          Support & Feedback
        </Badge>
        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">
          Contact BeautyIQ Team
        </h1>
        <p className="text-sm text-foreground-muted leading-relaxed">
          Have feedback on ingredient data, listing corrections, or partnership inquiries? Reach out below.
        </p>
      </div>

      <div className="rounded border border-line bg-background-card p-6 sm:p-8 shadow-subtle">
        {submitted ? (
          <div className="text-center py-8 space-y-3">
            <CheckCircle2 className="h-12 w-12 text-status-success mx-auto" />
            <h3 className="font-display text-xl font-bold text-foreground">
              Thank You for Contacting Us
            </h3>
            <p className="text-sm text-foreground-muted">
              Your message was sent successfully. We will reply to {form.email}.
            </p>
            <Button variant="outline" onClick={() => setSubmitted(false)}>
              Send Another Message
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error ? <p role="alert" className="rounded-lg border border-status-error/30 bg-status-error-bg px-3 py-2 text-sm text-status-error">{error}</p> : null}
            <Input
              label="Your Full Name"
              placeholder="e.g. Aanya Sharma"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. name@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <Textarea
              label="Message or Inquiry"
              placeholder="Describe your inquiry, ingredient correction request, or catalog feedback..."
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
            />
            <Button type="submit" variant="accent" size="lg" className="w-full" disabled={submitting} rightIcon={<Send className="h-4 w-4" />}>
              {submitting ? "Sending..." : "Submit Inquiry"}
            </Button>
          </form>
        )}
      </div>
    </Container>
  );
}
