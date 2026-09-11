import * as React from "react";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";

export default function TermsPage() {
  return (
    <Container className="py-10 space-y-6 max-w-3xl leading-relaxed text-foreground-muted">
      <Badge variant="sage">Legal Terms</Badge>
      <h1 className="font-display text-4xl font-bold text-foreground">
        Terms of Service
      </h1>

      <section className="space-y-3 pt-4 border-t border-line">
        <h3 className="font-display text-xl font-semibold text-foreground">1. Platform Scope & Terms</h3>
        <p className="text-sm">
          BeautyIQ is an informational skincare discovery and price intelligence platform. By accessing or using our services, you agree to these Terms.
        </p>
      </section>

      <section className="space-y-3 pt-2">
        <h3 className="font-display text-xl font-semibold text-foreground">2. Price Intelligence Disclaimer</h3>
        <p className="text-sm">
          Price listings and delivery estimates from third-party platforms (Nykaa, Amazon, Flipkart, etc.) are gathered for comparison purposes. Final transactions occur on external seller sites.
        </p>
      </section>
    </Container>
  );
}
