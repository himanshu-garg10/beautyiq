import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Droplets, ShieldCheck, Sparkles, Sun } from "lucide-react";
import { Container } from "@/components/layout/container";

const concerns = [
  {
    title: "Glow & dullness",
    description: "Explore brightening-focused ingredients and products for a more radiant-looking routine.",
    href: "/products?concern=Dullness",
    image: "/images/concerns/glow-and-dullness.png",
    icon: Sparkles,
  },
  {
    title: "Acne & breakouts",
    description: "Browse cosmetic options commonly chosen for excess oil, pores and blemish-prone skin.",
    href: "/products?concern=Acne",
    image: "/images/concerns/acne-and-active-breakouts.jpg",
    icon: ShieldCheck,
  },
  {
    title: "Dryness & barrier",
    description: "Find hydration and barrier-support focused formulas to compare in the catalog.",
    href: "/products?concern=Dryness",
    image: "/images/concerns/dryness-and-barrier.jpg",
    icon: Droplets,
  },
  {
    title: "Dark spots & tone",
    description: "Discover products with commonly used ingredients for uneven-looking skin tone.",
    href: "/products?concern=Dark%20spots",
    image: "/images/concerns/uneven-tone-and-dark-spots.jpg",
    icon: Sun,
  },
];

export function ConcernSpotlight() {
  return (
    <section className="border-y border-line bg-background py-16 sm:py-20">
      <Container>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-champagne-deep">Start with your concern</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Skincare discovery, from the concern first.</h2>
            <p className="mt-3 text-sm leading-relaxed text-foreground-muted sm:text-base">Choose what you want to understand, then inspect matching product labels, ingredients and available offers.</p>
          </div>
          <Link href="/ingredients" className="inline-flex items-center gap-1.5 text-sm font-bold text-sage-deep transition-colors hover:text-foreground">
            Explore all concerns <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {concerns.map((concern) => {
            const Icon = concern.icon;
            return (
              <Link key={concern.title} href={concern.href} className="group relative isolate min-h-[310px] overflow-hidden rounded-3xl border border-line bg-background-elevated shadow-subtle transition-all duration-300 hover:-translate-y-1 hover:border-champagne-deep/60 hover:shadow-xl">
                <Image src={concern.image} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/42 to-black/5" />
                <div className="relative flex min-h-[310px] flex-col justify-end p-5 text-white">
                  <span className="mb-auto flex h-10 w-10 items-center justify-center rounded-xl border border-white/30 bg-white/15 backdrop-blur-md"><Icon className="h-5 w-5" /></span>
                  <p className="font-display text-2xl font-semibold tracking-tight drop-shadow-sm">{concern.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-white/85">{concern.description}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-champagne">Explore products <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" /></span>
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
