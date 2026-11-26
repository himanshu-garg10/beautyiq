"use client";

import Link from "next/link";
import { ArrowRight, FlaskConical, Scale, Sparkles } from "lucide-react";
import { Container } from "@/components/layout/container";
import { useChatContext } from "@/context/chat-context";
import { ScrollReveal, StaggerReveal, StaggerItem } from "@/components/ui/scroll-reveal";

export function HomeQuickStart() {
  const { openChat } = useChatContext();

  return (
    <section className="border-y border-line/70 bg-background-elevated/35 py-16 sm:py-24">
      <Container>
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-champagne-deep">
            Start where you need
          </p>
          <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-[2.65rem]">
            A simpler way to choose skincare.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground-muted sm:text-base">
            Use any path below—no account is needed to browse.
          </p>
        </ScrollReveal>

        <StaggerReveal className="mt-12 grid gap-6 md:grid-cols-3">
          {/* AI Chat card — opens chatbot */}
          <StaggerItem className="flex">
            <button
              type="button"
              onClick={openChat}
              className="group flex w-full flex-col rounded-3xl border border-line/80 bg-[image:var(--gradient-card)] p-7 text-left shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-champagne/65 hover:shadow-card-hover"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-champagne/35 bg-champagne-tint text-champagne-deep transition-transform duration-300 group-hover:scale-105">
                  <Sparkles className="h-5 w-5" />
                </span>
                <span className="font-mono text-xs font-medium text-foreground-faint">01</span>
              </div>
              <h3 className="mt-6 font-display text-2xl font-semibold text-foreground">
                Find a routine direction
              </h3>
              <p className="mt-2.5 flex-1 text-sm leading-relaxed text-foreground-muted">
                Tell the AI what you want to improve, then refine the suggested product type and ingredients.
              </p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-champagne-deep">
                Ask BeautyIQ AI
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </span>
            </button>
          </StaggerItem>

          <StaggerItem className="flex">
            <Link
              href="/products"
              className="group flex w-full flex-col rounded-3xl border border-line/80 bg-[image:var(--gradient-card)] p-7 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-champagne/65 hover:shadow-card-hover"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sage/30 bg-sage-tint text-sage-deep transition-transform duration-300 group-hover:scale-105">
                  <FlaskConical className="h-5 w-5" />
                </span>
                <span className="font-mono text-xs font-medium text-foreground-faint">02</span>
              </div>
              <h3 className="mt-6 font-display text-2xl font-semibold text-foreground">
                Explore real catalog details
              </h3>
              <p className="mt-2.5 flex-1 text-sm leading-relaxed text-foreground-muted">
                Search product labels, categories and ingredients before choosing what to buy.
              </p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-champagne-deep">
                Browse products
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </span>
            </Link>
          </StaggerItem>

          <StaggerItem className="flex">
            <Link
              href="/compare"
              className="group flex w-full flex-col rounded-3xl border border-line/80 bg-[image:var(--gradient-card)] p-7 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-champagne/65 hover:shadow-card-hover"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-champagne/35 bg-champagne-tint text-champagne-deep transition-transform duration-300 group-hover:scale-105">
                  <Scale className="h-5 w-5" />
                </span>
                <span className="font-mono text-xs font-medium text-foreground-faint">03</span>
              </div>
              <h3 className="mt-6 font-display text-2xl font-semibold text-foreground">
                Build your own comparison
              </h3>
              <p className="mt-2.5 flex-1 text-sm leading-relaxed text-foreground-muted">
                Add only the products you choose and compare their listed details side by side.
              </p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-champagne-deep">
                Start comparing
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </span>
            </Link>
          </StaggerItem>
        </StaggerReveal>
      </Container>
    </section>
  );
}
