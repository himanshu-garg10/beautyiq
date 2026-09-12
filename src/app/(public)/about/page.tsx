import * as React from "react";
import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ShieldCheck, Microscope, Layers, Scale } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About BeautyIQ — AI Powered Skincare Discovery",
  description: "Learn about BeautyIQ's mission to eliminate skincare guesswork through ingredient intelligence, compatibility scoring, and price transparency.",
};

export default function AboutPage() {
  return (
    <div className="space-y-12 py-10">
      <Container>
        {/* Header Hero */}
        <div className="max-w-3xl space-y-4">
          <Badge variant="sage">Our Mission & Purpose</Badge>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Skincare discovery rooted in science, ingredient intelligence & price transparency.
          </h1>
          <p className="text-lg text-foreground-muted leading-relaxed">
            BeautyIQ was built to solve a universal struggle: buying skincare products based on hype, viral trends, or sponsored reviews rather than what your unique skin actually requires.
          </p>
        </div>
      </Container>

      {/* Core Principles Section */}
      <Section className="bg-background-elevated/40 border-y border-line">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded border border-line bg-background-card p-6 space-y-3 shadow-subtle">
              <div className="h-10 w-10 rounded bg-sage-tint flex items-center justify-center text-sage-deep mb-2">
                <Microscope className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground">
                Ingredient Intelligence
              </h3>
              <p className="text-sm text-foreground-muted leading-relaxed">
                We analyze key active concentrations, pH levels, comedogenic ratings, and safety profiles to match products accurately to your skin type.
              </p>
            </div>

            <div className="rounded border border-line bg-background-card p-6 space-y-3 shadow-subtle">
              <div className="h-10 w-10 rounded bg-clay-tint flex items-center justify-center text-clay mb-2">
                <Scale className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground">
                Cross-Platform Intelligence
              </h3>
              <p className="text-sm text-foreground-muted leading-relaxed">
                Compare price per ml and value scores across major Indian marketplaces so you never overpay for your essential skincare routine.
              </p>
            </div>

            <div className="rounded border border-line bg-background-card p-6 space-y-3 shadow-subtle">
              <div className="h-10 w-10 rounded bg-sage-tint flex items-center justify-center text-sage-deep mb-2">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground">
                Responsible AI & Safety
              </h3>
              <p className="text-sm text-foreground-muted leading-relaxed">
                BeautyIQ strictly acts as an educational discovery system. We explicitly do not diagnose medical diseases or make false claims.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* Call to Action */}
      <Container className="text-center py-6">
        <div className="max-w-2xl mx-auto rounded border border-line bg-background-card p-8 md:p-12 space-y-6 shadow-subtle">
          <Sparkles className="h-8 w-8 text-sage-deep mx-auto" />
          <h2 className="font-display text-2xl font-bold text-foreground">
            Ready to find skincare that actually works for you?
          </h2>
          <p className="text-sm text-foreground-muted">
            Create your free skin profile or describe what you need in natural language.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link href="/onboarding">
              <Button variant="accent" size="lg">
                Build Skin Profile
              </Button>
            </Link>
            <Link href="/search">
              <Button variant="outline" size="lg">
                Try AI Search
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
