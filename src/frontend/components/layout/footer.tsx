import Link from "next/link";
import { Instagram, Twitter, Youtube, ShieldAlert } from "lucide-react";
import { Container } from "@/components/layout/container";

const footerColumns = [
  {
    title: "Discovery",
    links: [
      { label: "Products Catalog", href: "/products" },
      { label: "AI Requirement Search", href: "/ai-search" },
      { label: "Categories", href: "/categories" },
      { label: "Ingredient Intelligence", href: "/ingredients" },
      { label: "Brand Index", href: "/brands" },
    ],
  },
  {
    title: "Platform",
    links: [
      { label: "About BeautyIQ", href: "/about" },
      { label: "How It Works", href: "/how-it-works" },
      { label: "AI Safety & Governance", href: "/ai-safety" },
      { label: "Skin Profile Questionnaire", href: "/onboarding" },
      { label: "Compare Matrix", href: "/compare" },
    ],
  },
  {
    title: "Support & Legal",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "Frequently Asked Questions", href: "/faq" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Skincare Safety Disclaimer", href: "/ai-safety" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-background-elevated/60 text-foreground">
      <Container className="py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-sm space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-display text-2xl tracking-tight text-foreground">
                Beauty<span className="italic text-sage-deep">IQ</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-foreground-muted">
              AI-powered personalized skincare product discovery, ingredient intelligence, and cross-platform price comparison platform. Discover products matched to your unique skin profile.
            </p>
            <div className="flex items-center gap-4 pt-1">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="BeautyIQ on Instagram"
                className="text-foreground-faint transition-colors hover:text-sage-deep"
              >
                <Instagram className="h-[18px] w-[18px]" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="BeautyIQ on Twitter"
                className="text-foreground-faint transition-colors hover:text-sage-deep"
              >
                <Twitter className="h-[18px] w-[18px]" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="BeautyIQ on YouTube"
                className="text-foreground-faint transition-colors hover:text-sage-deep"
              >
                <Youtube className="h-[18px] w-[18px]" />
              </a>
            </div>
          </div>

          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 font-display text-sm font-semibold text-foreground uppercase tracking-wider">
                {col.title}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-foreground-muted transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Safety Disclaimer Banner */}
        <div className="mt-14 rounded border border-line bg-background-card p-5">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 shrink-0 text-status-warning mt-0.5" />
            <div className="text-xs leading-relaxed text-foreground-muted space-y-1">
              <p className="font-semibold text-foreground">
                Important Skincare & AI Safety Notice
              </p>
              <p>
                BeautyIQ provides ingredient information, compatibility scores, and product discovery for general informational guidance only. BeautyIQ does not offer medical or dermatological advice, nor does it diagnose, treat, or cure skin medical conditions. Always consult a qualified board-certified dermatologist for persistent or severe skin conditions.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-line pt-6 flex flex-col gap-4 text-xs text-foreground-faint sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} BeautyIQ Platform. All rights reserved.</span>
          <div className="flex flex-wrap gap-5">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="/ai-safety" className="hover:text-foreground">
              AI Safety
            </Link>
            <Link href="/contact" className="hover:text-foreground">
              Contact Support
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
