"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, User, ShieldCheck, Search, Heart } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { NotificationDropdown } from "@/components/layout/notification-dropdown";
import { useAuth } from "@/context/auth-context";

const mainNavLinks = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Categories", href: "/categories" },
  { label: "Ingredients", href: "/ingredients" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "About", href: "/about" },
];

export function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);
  const { user, role } = useAuth();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b transition-colors duration-300 ${
        scrolled
          ? "border-line bg-background/90 backdrop-blur-md shadow-subtle"
          : "border-transparent bg-background"
      }`}
    >
      <Container>
        <nav
          className="flex h-[72px] items-center justify-between"
          aria-label="Primary"
        >
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display text-[1.35rem] tracking-tight text-foreground">
              Beauty<span className="italic text-sage-deep">IQ</span>
            </span>
          </Link>

          <ul className="hidden items-center gap-6 xl:gap-8 lg:flex">
            {mainNavLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-[0.9rem] font-medium text-foreground-muted transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-3 lg:flex">
            <ThemeToggle />

            <div className="mx-1 h-5 w-px bg-line" aria-hidden="true" />

            <Link
              href="/ai-search"
              className="flex items-center gap-1.5 text-[0.9rem] font-medium text-foreground-muted transition-colors hover:text-foreground"
            >
              <Sparkles className="h-4 w-4 text-sage-deep" aria-hidden="true" />
              AI Requirements
            </Link>

            {role === "admin" ? (
              <Link href="/admin/dashboard">
                <Button size="sm" variant="clay" leftIcon={<ShieldCheck className="h-4 w-4" />}>
                  Admin Portal
                </Button>
              </Link>
            ) : user ? (
              <div className="flex items-center gap-2">
                <NotificationDropdown />

                <Link
                  href="/wishlist"
                  className="relative flex h-9 w-9 items-center justify-center rounded-full border border-line bg-background hover:bg-background-elevated hover:text-foreground text-foreground-muted transition-colors"
                  title="My Saved Wishlist"
                  aria-label="Wishlist"
                >
                  <Heart className="h-4 w-4" />
                  {user.wishlistIds && user.wishlistIds.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-clay text-[0.65rem] font-bold text-white px-1 shadow-xs">
                      {user.wishlistIds.length}
                    </span>
                  )}
                </Link>

                <Link href="/dashboard">
                  <Button size="sm" variant="outline" leftIcon={<User className="h-4 w-4 text-sage-deep" />}>
                    Dashboard
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button size="sm" variant="ghost">
                    Log in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" variant="outline">
                    Register
                  </Button>
                </Link>
              </div>
            )}

            <Link href="/onboarding">
              <Button size="sm" variant="accent">
                Get Recommendations
              </Button>
            </Link>
          </div>

          <MobileNav links={mainNavLinks} />
        </nav>
      </Container>
    </header>
  );
}
