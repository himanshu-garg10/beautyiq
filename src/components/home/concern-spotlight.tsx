import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Droplets, ShieldCheck, Sparkles, Sun } from "lucide-react";
import { Container } from "@/components/layout/container";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

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
    <section className="border-y border-line/70 bg-background py-16 sm:py-24">
      <Container>
        <ScrollReveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-champagne-deep">
              Start with your concern
            </p>
            <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-[2.65rem]">
              Skincare discovery, from the concern first.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-foreground-muted sm:text-base">
              Choose what you want to understand, then inspect matching product labels, ingredients and available offers.
            </p>
          </div>
          <Link
            href="/ingredients"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-sage-deep transition-colors hover:text-foreground"
          >
            Explore all concerns
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </ScrollReveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {concerns.map((concern, index) => {
            const Icon = concern.icon;
            return (
              <ScrollReveal key={concern.title} delay={index * 0.08} className="h-full">
                <Link
                  href={concern.href}
                  className="group relative isolate flex h-full min-h-[330px] overflow-hidden rounded-3xl border border-line/80 bg-background-elevated shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-champagne/65 hover:shadow-elevated"
                >
                  <Image
                    src={concern.image}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12100E]/90 via-[#12100E]/42 to-[#12100E]/10 transition-opacity duration-300 group-hover:opacity-95" />
                  <div className="relative flex min-h-[330px] w-full flex-col justify-end p-6 text-white">
                    <span className="mb-auto flex h-10 w-10 items-center justify-center rounded-xl border border-white/25 bg-white/15 backdrop-blur-md transition-transform duration-300 group-hover:scale-105">
                      <Icon className="h-5 w-5" />
                    </span>
                    <p className="font-display text-2xl font-medium tracking-tight drop-shadow-sm">
                      {concern.title}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-white/85">
                      {concern.description}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#E8C98A]">
                      Explore products
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
