import Link from "next/link";
import { Instagram, Twitter, Youtube, Linkedin, Sparkles, ShieldCheck } from "lucide-react";
import { Container } from "@/components/layout/container";

export function Footer() {
  return (
    <footer className="relative border-t border-line/40 bg-background-elevated text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-champagne/60 to-transparent"
      />
      <Container className="py-14 sm:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Column 1: Brand & Narrative */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block group">
              <span className="font-display text-2xl sm:text-[1.75rem] font-semibold tracking-tight text-foreground transition-opacity group-hover:opacity-90">
                <span className="text-gold-gradient">
                  Beauty
                </span>
                <span className="italic font-normal text-foreground">IQ</span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm leading-relaxed text-foreground-muted max-w-sm">
              AI-powered personalized cosmetics discovery and cross-platform product comparison. Bringing scientific transparency and price clarity to everyday skincare rituals.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="BeautyIQ on Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line/70 bg-background-card text-foreground-muted hover:border-champagne/60 hover:bg-champagne-tint hover:text-champagne-deep transition-all"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="BeautyIQ on Twitter"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line/70 bg-background-card text-foreground-muted hover:border-champagne/60 hover:bg-champagne-tint hover:text-champagne-deep transition-all"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="BeautyIQ on YouTube"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line/70 bg-background-card text-foreground-muted hover:border-champagne/60 hover:bg-champagne-tint hover:text-champagne-deep transition-all"
              >
                <Youtube className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="BeautyIQ on LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line/70 bg-background-card text-foreground-muted hover:border-champagne/60 hover:bg-champagne-tint hover:text-champagne-deep transition-all"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Discover */}
          <div className="space-y-3.5">
            <h4 className="font-sans text-xs font-semibold uppercase tracking-widest text-foreground-faint">
              Discover
            </h4>
            <ul className="space-y-2.5 text-sm text-foreground-faint">
              <li>
                <Link href="/products" className="hover:text-foreground-muted transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-foreground-muted transition-colors">
                  Product Categories
                </Link>
              </li>
              <li>
                <Link href="/brands" className="hover:text-foreground-muted transition-colors">
                  Verified Brands
                </Link>
              </li>
              <li>
                <Link href="/skin-scan" className="hover:text-foreground-muted transition-colors inline-flex items-center gap-1.5">
                  <span>Skin Scan</span>
                  <Sparkles className="h-3 w-3 text-champagne-deep" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Compare & Intelligence */}
          <div className="space-y-3.5">
            <h4 className="font-sans text-xs font-semibold uppercase tracking-widest text-foreground-faint">
              Intelligence
            </h4>
            <ul className="space-y-2.5 text-sm text-foreground-faint">
              <li>
                <Link href="/compare" className="hover:text-foreground-muted transition-colors">
                  Product Compare Matrix
                </Link>
              </li>
              <li>
                <Link href="/recommendations" className="hover:text-foreground-muted transition-colors">
                  AI Recommendations
                </Link>
              </li>
              <li>
                <Link href="/ingredients" className="hover:text-foreground-muted transition-colors">
                  Ingredient Database
                </Link>
              </li>
              <li>
                <Link href="/onboarding" className="hover:text-foreground-muted transition-colors">
                  Skin Profile Quiz
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-foreground-muted transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: About & Legal */}
          <div className="space-y-3.5">
            <h4 className="font-sans text-xs font-semibold uppercase tracking-widest text-foreground-faint">
              About &amp; Legal
            </h4>
            <ul className="space-y-2.5 text-sm text-foreground-faint">
              <li>
                <Link href="/about" className="hover:text-foreground-muted transition-colors">
                  About BeautyIQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground-muted transition-colors">
                  Contact &amp; Support
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground-muted transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground-muted transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/ai-safety" className="hover:text-foreground-muted transition-colors">
                  AI Safety &amp; Disclaimers
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimer & Copyright */}
        <div className="mt-12 pt-6 border-t border-line/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-foreground-faint">
          <p>© {new Date().getFullYear()} BeautyIQ Platform. All rights reserved.</p>
          <div className="flex items-center gap-1.5 text-[0.75rem]">
            <ShieldCheck className="h-3.5 w-3.5 text-champagne-deep shrink-0" />
            <span>Independent cosmetic analysis · Non-medical cosmetic guidance</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
