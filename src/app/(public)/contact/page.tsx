"use client";

import * as React from "react";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { useToast } from "@/context/toast-context";

export default function ContactPage() {
  const { addToast } = useToast();
  const [submitted, setSubmitted] = React.useState(false);
  const [form, setForm] = React.useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;

    setSubmitted(true);
    addToast({
      type: "success",
      title: "Message Received",
      description: "Thank you for contacting BeautyIQ support.",
    });
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
              We have logged your query and will respond to {form.email} shortly.
            </p>
            <Button variant="outline" onClick={() => setSubmitted(false)}>
              Send Another Message
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
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
            <Button type="submit" variant="accent" size="lg" className="w-full" rightIcon={<Send className="h-4 w-4" />}>
              Submit Inquiry
            </Button>
          </form>
        )}
      </div>
    </Container>
  );
}
