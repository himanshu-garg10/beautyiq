import * as React from "react";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, CheckCircle2 } from "lucide-react";

export default function AISafetyPage() {
  return (
    <Container className="py-10 space-y-8 max-w-3xl leading-relaxed text-foreground-muted">
      <div className="space-y-3">
        <Badge variant="sage">Safety &amp; Responsibility</Badge>
        <h1 className="font-display text-4xl font-bold text-foreground">
          AI Safety &amp; Medical Disclaimer
        </h1>
        <p className="text-sm text-foreground-muted leading-relaxed">
          How BeautyIQ handles skincare discovery responsibly, enforces medical boundaries, and avoids unverified claims.
        </p>
      </div>

      <div className="rounded border border-status-warning/30 bg-status-warning-bg/40 p-6 space-y-3">
        <h3 className="font-display text-xl font-semibold text-status-warning flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" /> Strict Non-Medical Boundary
        </h3>
        <p className="text-sm text-foreground-muted">
          BeautyIQ does NOT diagnose medical conditions, cure diseases, prescribe treatments, or replace professional dermatological care.
        </p>
      </div>

      <div className="space-y-4 pt-4 border-t border-line">
        <h3 className="font-display text-2xl font-bold text-foreground">
          Our Responsible Safety Principles
        </h3>

        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3 p-4 rounded border border-line bg-background-card">
            <CheckCircle2 className="h-5 w-5 text-sage-deep shrink-0 mt-0.5" />
            <div>
              <strong className="text-foreground block">Ingredient-First Transparency</strong>
              Recommendations state explicit reasons (e.g. &quot;Contains 2% Salicylic Acid for oily skin&quot;) without claiming guaranteed medical cures.
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded border border-line bg-background-card">
            <CheckCircle2 className="h-5 w-5 text-sage-deep shrink-0 mt-0.5" />
            <div>
              <strong className="text-foreground block">Interaction &amp; Avoidance Warnings</strong>
              Products containing potential irritants or contraindications (e.g. Retinol mixed with AHA) trigger warning badges.
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
