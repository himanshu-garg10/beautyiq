import Link from "next/link";
import { Instagram, Twitter, Youtube, Linkedin, Sparkles, ShieldCheck } from "lucide-react";
import { Container } from "@/components/layout/container";

export function Footer() {
  return (
    <footer className="border-t border-line bg-background-elevated/50 text-foreground">
      <Container className="py-14 sm:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Column 1: Brand & Narrative */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block group">
              <span className="font-display text-2xl font-bold tracking-tight text-foreground group-hover:text-champagne-deep transition-colors">
                Beauty<span className="italic font-normal text-champagne-deep">IQ</span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm leading-relaxed text-foreground-muted max-w-sm">
              AI-powered personalized cosmetics recommendation and cross-platform product comparison platform. Bringing scientific transparency and price clarity to beauty discovery.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="BeautyIQ on Instagram"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-background hover:bg-champagne-tint hover:text-champagne-deep transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="BeautyIQ on Twitter"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-background hover:bg-champagne-tint hover:text-champagne-deep transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="BeautyIQ on YouTube"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-background hover:bg-champagne-tint hover:text-champagne-deep transition-colors"
              >
                <Youtube className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="BeautyIQ on LinkedIn"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-background hover:bg-champagne-tint hover:text-champagne-deep transition-colors"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Discover */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
              Discover
            </h4>
            <ul className="space-y-2 text-xs text-foreground-muted">
              <li>
                <Link href="/products" className="hover:text-foreground transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-foreground transition-colors">
                  Product Categories
                </Link>
              </li>
              <li>
                <Link href="/brands" className="hover:text-foreground transition-colors">
                  Verified Brands
                </Link>
              </li>
              <li>
                <Link href="/ai-search" className="hover:text-foreground transition-colors flex items-center gap-1">
                  <span>AI Natural Search</span>
                  <Sparkles className="h-2.5 w-2.5 text-champagne-deep" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Compare & Intelligence */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
              Intelligence
            </h4>
            <ul className="space-y-2 text-xs text-foreground-muted">
              <li>
                <Link href="/compare" className="hover:text-foreground transition-colors">
                  Product Compare Matrix
                </Link>
              </li>
              <li>
                <Link href="/recommendations" className="hover:text-foreground transition-colors">
                  AI Recommendations
                </Link>
              </li>
              <li>
                <Link href="/ingredients" className="hover:text-foreground transition-colors">
                  Ingredient Database
                </Link>
              </li>
              <li>
                <Link href="/onboarding" className="hover:text-foreground transition-colors">
                  Skin Profile Quiz
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-foreground transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: About & Legal */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
              About &amp; Legal
            </h4>
            <ul className="space-y-2 text-xs text-foreground-muted">
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  About BeautyIQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  Contact &amp; Support
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/ai-safety" className="hover:text-foreground transition-colors">
                  AI Safety &amp; Disclaimers
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimer & Copyright */}
        <div className="mt-12 pt-6 border-t border-line/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-foreground-faint">
          <p>© {new Date().getFullYear()} BeautyIQ Platform. All rights reserved.</p>
          <div className="flex items-center gap-1.5 text-[0.72rem]">
            <ShieldCheck className="h-3.5 w-3.5 text-champagne-deep" />
            <span>Independent cosmetic analysis • Non-medical cosmetic guidance</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
