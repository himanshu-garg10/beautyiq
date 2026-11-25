"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, FlaskConical, Search, ShieldCheck, Sparkles, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { useChatContext } from "@/context/chat-context";

const steps = [
  { icon: Sparkles, title: "Tell us your goal", text: "Describe glow, acne, dryness, sensitivity, or a routine need." },
  { icon: FlaskConical, title: "Understand the formula", text: "Review ingredients and product details before deciding." },
  { icon: Scale, title: "Compare verified offers", text: "See store offers only when a source has been added to the catalog." },
];

const popularSearches = [
  { label: "Glow", query: "glow" },
  { label: "Acne care", query: "acne" },
  { label: "Dry skin", query: "dryness" },
  { label: "Sunscreen", query: "sunscreen" },
];

export function HeroSection() {
  const router = useRouter();
  const { openChat } = useChatContext();
  const [query, setQuery] = React.useState("");
  function searchCatalog(event: React.FormEvent) {
    event.preventDefault();
    const value = query.trim();
    if (value) router.push(`/products?q=${encodeURIComponent(value)}`);
  }

  return (
    <section className="relative isolate min-h-[calc(100svh-76px)] overflow-hidden border-b border-line/60 bg-gradient-to-br from-background via-champagne-tint/30 to-background">
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-12 h-96 w-96 rounded-full bg-sage-tint/45 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-28 bottom-0 h-[28rem] w-[28rem] rounded-full bg-champagne/20 blur-3xl" />
      <Container className="relative flex min-h-[calc(100svh-76px)] items-center py-12 sm:py-16 lg:py-20">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1.08fr_.92fr] lg:gap-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: "easeOut" }} className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-champagne/40 bg-background-card/75 px-3 py-1.5 text-xs font-semibold text-champagne-deep shadow-subtle backdrop-blur"><Sparkles className="h-3.5 w-3.5" />Beauty discovery, made clearer</div>
            <h1 className="font-display text-5xl font-bold leading-[1.04] tracking-tight text-foreground sm:text-6xl lg:text-7xl">Find beauty that<span className="block italic font-normal text-champagne-deep"> fits your skin.</span></h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-foreground-muted sm:text-lg">Search a growing beauty catalog, understand ingredients, and use an AI-guided brief to narrow products for your routine.</p>
            <form onSubmit={searchCatalog} className="mt-8 flex max-w-xl items-center gap-2 rounded-2xl border border-line bg-background-card p-2 shadow-lg shadow-foreground/5">
              <Search className="ml-2 h-5 w-5 shrink-0 text-champagne-deep" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm text-foreground outline-none placeholder:text-foreground-faint sm:text-base" placeholder="Search products, brands, or ingredients" aria-label="Search BeautyIQ catalog" />
              <Button type="submit" variant="accent" className="shrink-0 rounded-xl px-4 sm:px-5" rightIcon={<ArrowRight className="h-4 w-4" />}>Search</Button>
            </form>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-foreground-faint"><span>Popular:</span>{popularSearches.map((item) => <Link key={item.query} href={`/products?q=${encodeURIComponent(item.query)}`} className="rounded-full border border-line bg-background-card/70 px-2.5 py-1 font-medium text-foreground-muted transition-colors hover:border-champagne/70 hover:bg-champagne-tint hover:text-foreground">{item.label}</Link>)}</div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button variant="outline" className="rounded-full" onClick={openChat}>Ask BeautyIQ AI</Button>
              <Link href="/products" className="inline-flex items-center gap-1.5 px-3 text-sm font-semibold text-foreground-muted transition-colors hover:text-foreground">Browse catalog <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-line/60 pt-5 text-xs text-foreground-muted"><span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-sage-deep" />No invented prices</span><span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-sage-deep" />Source-linked catalog entries</span></div>
          </motion.div>
          <motion.aside initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.12, ease: "easeOut" }} className="relative">
            <div className="rounded-[2rem] border border-line/80 bg-background-card/85 p-6 shadow-2xl shadow-foreground/10 backdrop-blur sm:p-8">
              <div className="flex items-start justify-between gap-4 border-b border-line/70 pb-5"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-champagne-deep">BeautyIQ flow</p><h2 className="mt-2 font-display text-2xl font-bold text-foreground">Make every choice intentional.</h2></div><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-champagne-tint text-champagne-deep"><Sparkles className="h-5 w-5" /></span></div>
              <ol className="mt-3 divide-y divide-line/70">{steps.map((step, index) => { const Icon = step.icon; return <li key={step.title} className="flex gap-4 py-5"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-background-elevated text-sm font-bold text-champagne-deep">0{index + 1}</span><div><div className="flex items-center gap-2"><Icon className="h-4 w-4 text-sage-deep" /><h3 className="text-sm font-bold text-foreground">{step.title}</h3></div><p className="mt-1 text-sm leading-relaxed text-foreground-muted">{step.text}</p></div></li>; })}</ol>
              <button
                type="button"
                onClick={openChat}
                className="mt-3 flex w-full items-center justify-between rounded-2xl bg-foreground px-5 py-4 text-sm font-semibold text-background transition-transform hover:-translate-y-0.5"
              >
                Chat with BeautyIQ AI <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.aside>
        </div>
      </Container>
    </section>
  );
}
