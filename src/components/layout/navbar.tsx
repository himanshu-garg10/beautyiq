"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  User,
  ShieldCheck,
  Heart,
  Scale,
  ChevronDown,
  LogOut,
  Sliders,
  LayoutDashboard,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { NotificationDropdown } from "@/components/layout/notification-dropdown";
import { useAuth } from "@/context/auth-context";
import { useComparison } from "@/context/comparison-context";
import { cn } from "@/lib/utils";

const mainNavLinks = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Categories", href: "/categories" },
  { label: "Ingredients", href: "/ingredients" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "About", href: "/about" },
  { label: "AI Requirements", href: "/ai-search", isHighlight: true },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = React.useState(false);
  const accountRef = React.useRef<HTMLDivElement>(null);

  const { user, role, logout, openAuthModal } = useAuth();
  const { selectedIds } = useComparison();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    }
    if (accountMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [accountMenuOpen]);

  const wishlistCount = user?.wishlistIds?.length ?? 0;
  const compareCount = selectedIds?.length ?? 0;

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b transition-all duration-300 ${
        scrolled
          ? "border-line bg-background/95 backdrop-blur-md shadow-subtle"
          : "border-line/60 bg-background"
      }`}
    >
      <Container>
        <nav
          className="flex h-[68px] items-center justify-between gap-4"
          aria-label="Primary navigation"
        >
          {/* Logo & Brand Tag */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="font-display text-[1.4rem] font-bold tracking-tight text-foreground group-hover:text-sage-deep transition-colors">
                Beauty<span className="italic text-sage-deep">IQ</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <ul className="hidden lg:flex items-center gap-1 xl:gap-2">
              {mainNavLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-[0.88rem] font-medium transition-all duration-150 flex items-center gap-1.5",
                        isActive
                          ? "bg-sage-tint text-sage-deep font-semibold dark:bg-sage-deep/20"
                          : link.isHighlight
                          ? "text-sage-deep font-semibold hover:bg-sage-tint/60 dark:hover:bg-sage-deep/15"
                          : "text-foreground-muted hover:text-foreground hover:bg-background-elevated/70"
                      )}
                    >
                      {link.isHighlight && <Sparkles className="h-3.5 w-3.5 text-sage-deep shrink-0" />}
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Right User Actions Area */}
          <div className="hidden lg:flex items-center gap-2.5">
            {/* Comparison Quick Badge (visible when products selected) */}
            {compareCount > 0 && (
              <Link
                href="/compare"
                className="relative flex h-9 items-center gap-1.5 px-3 rounded-full border border-sage-deep/40 bg-sage-tint/40 text-sage-deep text-xs font-semibold hover:bg-sage-tint transition-colors"
                title={`Comparing ${compareCount} products`}
              >
                <Scale className="h-3.5 w-3.5" />
                <span>Compare</span>
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-sage-deep text-[0.65rem] font-bold text-white px-1">
                  {compareCount}
                </span>
              </Link>
            )}

            {/* Wishlist Button */}
            {user ? (
              <Link
                href="/wishlist"
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-line bg-background-card hover:bg-background-elevated text-foreground-muted hover:text-foreground transition-colors shadow-subtle"
                title="Saved Wishlist"
                aria-label={`Saved Wishlist (${wishlistCount} items)`}
              >
                <Heart className={cn("h-4 w-4", wishlistCount > 0 && "text-rose-500 fill-rose-500/20")} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-clay text-[0.62rem] font-bold text-white px-1 shadow-xs">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            ) : (
              <button
                type="button"
                id="navbar-wishlist-logged-out"
                onClick={() => openAuthModal("login")}
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-line bg-background-card hover:bg-background-elevated text-foreground-muted hover:text-foreground transition-colors shadow-subtle"
                title="Saved Wishlist (Sign in required)"
                aria-label="Saved Wishlist"
              >
                <Heart className="h-4 w-4" />
              </button>
            )}

            {/* Notifications Dropdown (logged-in users) */}
            {user && <NotificationDropdown />}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Direct Dashboard Button */}
            {user && role !== "admin" && (
              <Link href="/dashboard">
                <Button
                  size="sm"
                  variant="outline"
                  className="hidden md:inline-flex items-center gap-1.5 font-semibold text-xs border-line bg-background-card hover:bg-background-elevated shadow-subtle text-foreground"
                >
                  <LayoutDashboard className="h-3.5 w-3.5 text-sage-deep" />
                  <span>Dashboard</span>
                </Button>
              </Link>
            )}

            {/* Account & Profile Menu */}
            {role === "admin" ? (
              <Link href="/admin/dashboard">
                <Button size="sm" variant="clay" leftIcon={<ShieldCheck className="h-4 w-4" />}>
                  Admin Portal
                </Button>
              </Link>
            ) : user ? (
              <div className="relative" ref={accountRef}>
                <button
                  id="navbar-account-menu-button"
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-line bg-background-card hover:bg-background-elevated text-foreground text-xs font-semibold transition-colors shadow-subtle"
                  aria-expanded={accountMenuOpen}
                  aria-label="User Account Menu"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sage-tint text-sage-deep font-bold text-[0.7rem]">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </span>
                  <span className="max-w-[100px] truncate text-foreground font-medium">
                    {user.name ? user.name.split(" ")[0] : "Account"}
                  </span>
                  <ChevronDown className="h-3 w-3 text-foreground-muted" />
                </button>

                {accountMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg border border-line bg-background-card p-1.5 shadow-lg z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-line mb-1">
                      <p className="font-semibold text-xs text-foreground truncate">{user.name}</p>
                      <p className="text-[0.7rem] text-foreground-muted truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-foreground hover:bg-background-elevated transition-colors"
                    >
                      <User className="h-3.5 w-3.5 text-sage-deep" />
                      Dashboard & Routine
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-foreground hover:bg-background-elevated transition-colors"
                    >
                      <Sliders className="h-3.5 w-3.5 text-sage-deep" />
                      Skin Profile Parameters
                    </Link>
                    <Link
                      href="/wishlist"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-foreground hover:bg-background-elevated transition-colors"
                    >
                      <Heart className="h-3.5 w-3.5 text-rose-500" />
                      Saved Wishlist ({wishlistCount})
                    </Link>
                    <div className="border-t border-line my-1" />
                    <button
                      onClick={() => {
                        setAccountMenuOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-status-error hover:bg-status-error-bg transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Button
                  id="navbar-login-button"
                  size="sm"
                  variant="ghost"
                  onClick={() => openAuthModal("login")}
                >
                  Log in
                </Button>
                <Button
                  id="navbar-register-button"
                  size="sm"
                  variant="outline"
                  onClick={() => openAuthModal("register")}
                >
                  Register
                </Button>
              </div>
            )}

            {/* Primary Action CTA */}
            <Link href="/onboarding">
              <Button size="sm" variant="accent" className="font-semibold shadow-subtle">
                Get Recommendations
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <MobileNav links={mainNavLinks} />
        </nav>
      </Container>
    </header>
  );
}
