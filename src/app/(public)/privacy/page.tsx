import * as React from "react";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";

export default function PrivacyPage() {
  return (
    <Container className="py-10 space-y-6 max-w-3xl leading-relaxed text-foreground-muted">
      <Badge variant="sage">Legal & Privacy</Badge>
      <h1 className="font-display text-4xl font-bold text-foreground">
        Privacy Policy
      </h1>
      <p className="text-xs font-mono text-foreground-faint">Effective Date: September 2026</p>

      <section className="space-y-3 pt-4 border-t border-line">
        <h3 className="font-display text-xl font-semibold text-foreground">1. Skin Profile & Data Collection</h3>
        <p className="text-sm">
          BeautyIQ collects skin profile attributes (skin type, active concerns, budget ranges, and ingredient preferences) strictly to compute compatibility scores and personalize product discovery.
        </p>
      </section>

      <section className="space-y-3 pt-2">
        <h3 className="font-display text-xl font-semibold text-foreground">2. Data Confidentiality</h3>
        <p className="text-sm">
          We do not sell personal skin profiles to third-party advertisers or medical databases. Your active wishlist and search queries remain tied solely to your authenticated account.
        </p>
      </section>
    </Container>
  );
}
