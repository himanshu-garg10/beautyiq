"use client";

import Link from "next/link";
import { ArrowRight, FlaskConical, Scale, Sparkles } from "lucide-react";
import { Container } from "@/components/layout/container";
import { useChatContext } from "@/context/chat-context";

export function HomeQuickStart() {
  const { openChat } = useChatContext();

  return (
    <section className="border-y border-line bg-background-elevated/35 py-16 sm:py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-champagne-deep">Start where you need</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">A simpler way to choose skincare.</h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground-muted sm:text-base">Use any path below—no account is needed to browse.</p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {/* AI Chat card — opens chatbot */}
          <button
            type="button"
            onClick={openChat}
            className="group rounded-3xl border border-line bg-background-card p-6 shadow-subtle transition-all duration-300 hover:-translate-y-1 hover:border-champagne/60 hover:bg-champagne-tint/25 hover:shadow-lg text-left w-full"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-champagne-tint text-champagne-deep transition-transform group-hover:scale-105">
              <Sparkles className="h-5 w-5" />
            </span>
            <h3 className="mt-6 font-display text-xl font-bold text-foreground">Find a routine direction</h3>
            <p className="mt-2 text-sm leading-relaxed text-foreground-muted">Tell the AI what you want to improve, then refine the suggested product type and ingredients.</p>
            <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-champagne-deep">
              Ask BeautyIQ AI
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </button>

          <Link
            href="/products"
            className="group rounded-3xl border border-line bg-background-card p-6 shadow-subtle transition-all duration-300 hover:-translate-y-1 hover:border-champagne/60 hover:bg-champagne-tint/25 hover:shadow-lg"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-champagne-tint text-champagne-deep transition-transform group-hover:scale-105">
              <FlaskConical className="h-5 w-5" />
            </span>
            <h3 className="mt-6 font-display text-xl font-bold text-foreground">Explore real catalog details</h3>
            <p className="mt-2 text-sm leading-relaxed text-foreground-muted">Search product labels, categories and ingredients before choosing what to buy.</p>
            <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-champagne-deep">
              Browse products
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>

          <Link
            href="/compare"
            className="group rounded-3xl border border-line bg-background-card p-6 shadow-subtle transition-all duration-300 hover:-translate-y-1 hover:border-champagne/60 hover:bg-champagne-tint/25 hover:shadow-lg"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-champagne-tint text-champagne-deep transition-transform group-hover:scale-105">
              <Scale className="h-5 w-5" />
            </span>
            <h3 className="mt-6 font-display text-xl font-bold text-foreground">Build your own comparison</h3>
            <p className="mt-2 text-sm leading-relaxed text-foreground-muted">Add only the products you choose and compare their listed details side by side.</p>
            <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-champagne-deep">
              Start comparing
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </Container>
    </section>
  );
}
