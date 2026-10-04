"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sparkles,
  User,
  Heart,
  Scale,
  Search,
  ChevronDown,
  LogOut,
  Sliders,
  LayoutDashboard,
  ShieldCheck,
  X,
  ArrowRight,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { NotificationDropdown } from "@/components/layout/notification-dropdown";
import { useAuth } from "@/context/auth-context";
import { useComparison } from "@/context/comparison-context";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Categories", href: "/categories" },
  { label: "Concerns", href: "/ingredients" },
  { label: "Products", href: "/products" },
  { label: "Compare", href: "/compare", showBadge: true },
  { label: "AI Match", href: "/recommendations", isAi: true },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = React.useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = React.useState(false);
  const [searchModalOpen, setSearchModalOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const accountRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const { user, role, logout, openAuthModal } = useAuth();
  const { selectedIds } = useComparison();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
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

  React.useEffect(() => {
    if (searchModalOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 80);
    }
  }, [searchModalOpen]);

  const wishlistCount = user?.wishlistIds?.length ?? 0;
  const compareCount = selectedIds?.length ?? 0;

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchModalOpen(false);
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  }

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 w-full isolate overflow-visible rounded-b-3xl transition-all duration-300",
          scrolled
            ? "border-b border-white/80 bg-[linear-gradient(110deg,rgb(255_252_247_/_0.95),rgb(245_239_227_/_0.88),rgb(231_240_229_/_0.82),rgb(255_250_244_/_0.9))] backdrop-blur-3xl saturate-150 shadow-[0_10px_30px_rgb(30_26_20_/_0.14)] py-2.5 dark:border-white/10 dark:bg-[linear-gradient(110deg,rgb(21_25_26_/_0.96),rgb(37_45_42_/_0.9),rgb(51_43_35_/_0.86),rgb(23_22_27_/_0.94))] dark:shadow-[0_10px_34px_rgb(0_0_0_/_0.5)]"
            : "border-b border-white/80 bg-[linear-gradient(110deg,rgb(255_253_249_/_0.96),rgb(247_240_228_/_0.9),rgb(234_242_231_/_0.84),rgb(255_252_247_/_0.93))] backdrop-blur-2xl saturate-150 shadow-[0_6px_22px_rgb(30_26_20_/_0.1)] py-3.5 dark:border-white/10 dark:bg-[linear-gradient(110deg,rgb(25_29_30_/_0.97),rgb(43_50_45_/_0.91),rgb(57_47_38_/_0.87),rgb(24_23_29_/_0.95))] dark:shadow-[0_7px_26px_rgb(0_0_0_/_0.45)]"
        )}
      >
        <Container className="max-w-none px-5 sm:px-8 xl:px-12">
          <nav
            className="flex items-center justify-between gap-4"
            aria-label="Primary navigation"
          >
            {/* Left: BeautyIQ Wordmark */}
            <div className="flex items-center gap-5">
              <Link href="/" className="group flex items-center gap-2">
                <span className="font-display text-2xl md:text-[1.65rem] font-bold tracking-tight text-foreground group-hover:text-champagne-deep transition-colors">
                  Beauty<span className="italic font-normal text-champagne-deep ml-0.5">IQ</span>
                </span>
                <span className="hidden sm:inline-block h-1.5 w-1.5 rounded-full bg-champagne-deep/70" />
                <span className="hidden xl:flex flex-col text-[0.63rem] leading-[1.1] tracking-[0.16em] uppercase font-mono text-foreground-faint">
                  <span>AI Skincare</span>
                  <span>Intelligence</span>
                </span>
              </Link>
            </div>

            {/* Center: Main Navigation */}
            <ul className="hidden lg:flex items-center gap-2 xl:gap-4">
              {navLinks.map((link) => {
                const isActive = pathname === link.href ||
                  (link.href === "/recommendations" && pathname === "/ai-search");
                return (
                  <li key={link.href} className={link.href === "/" ? "mr-2" : undefined}>
                    <Link
                      href={link.href}
                      className={cn(
                        "relative px-3.5 py-1.5 rounded-full text-[0.9rem] transition-all duration-200 flex items-center gap-1.5 tracking-tight",
                        isActive
                          ? "font-semibold text-background bg-foreground border border-foreground shadow-md hover:bg-foreground"
                          : "font-medium text-foreground-muted hover:text-foreground"
                      )}
                    >
                      {link.isAi && (
                        <Sparkles className="h-3.5 w-3.5 text-champagne-deep shrink-0" />
                      )}
                      <span>{link.label}</span>
                      {link.showBadge && compareCount > 0 && (
                        <span className="ml-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-champagne-deep text-[0.62rem] font-bold text-white px-1">
                          {compareCount}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Right: Search, Wishlist, Profile & CTA */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Quick Search Button */}
              <button
                type="button"
                onClick={() => setSearchModalOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-background-card hover:bg-background-elevated text-foreground-muted hover:text-foreground transition-all shadow-subtle hover:border-line-strong"
                title="Search products and ingredients"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </button>

              {/* Wishlist Button with Badge */}
              {user ? (
                <Link
                  href="/wishlist"
                  className="relative hidden lg:flex h-9 w-9 items-center justify-center rounded-full border border-line bg-background-card hover:bg-background-elevated text-foreground-muted hover:text-foreground transition-all shadow-subtle hover:border-line-strong"
                  title="Saved Wishlist"
                  aria-label={`Wishlist with ${wishlistCount} items`}
                >
                  <Heart
                    className={cn(
                      "h-4 w-4 transition-colors",
                      wishlistCount > 0 && "text-rose-500 fill-rose-500/20"
                    )}
                  />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 text-[0.62rem] font-bold text-white px-1 shadow-xs">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              ) : null}

              {/* User Notifications (logged-in) */}
              {user && <div className="hidden lg:block"><NotificationDropdown /></div>}

              {/* Theme Toggle */}
              <div className="hidden lg:block"><ThemeToggle /></div>

              {/* User Account / Profile Menu */}
              {user ? (
                <div className="relative hidden lg:block" ref={accountRef}>
                  <button
                    onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-background-card text-foreground-muted transition-all shadow-subtle hover:border-line-strong hover:bg-background-elevated hover:text-foreground"
                    aria-label="User Account Menu"
                    aria-expanded={accountMenuOpen}
                  >
                    <User className="h-4 w-4" />
                  </button>

                  {/* Account Dropdown Menu */}
                  {accountMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 rounded-xl border border-line bg-background-card p-1.5 shadow-lg z-50 text-xs animate-fade-in">
                      <div className="px-3 py-2 border-b border-line/60">
                        <p className="font-semibold text-foreground truncate">{user.name}</p>
                        <p className="text-[0.7rem] text-foreground-faint truncate">{user.email}</p>
                      </div>
                      <div className="py-1">
                        {role === "admin" ? (
                          <Link
                            href="/admin/dashboard"
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-champagne-tint/60 text-foreground hover:bg-champagne-tint transition-colors"
                          >
                            <ShieldCheck className="h-3.5 w-3.5 text-champagne-deep" />
                            <span>Catalog Control Room</span>
                          </Link>
                        ) : null}
                        <Link
                          href="/account"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-foreground hover:bg-background-elevated transition-colors"
                        >
                          <User className="h-3.5 w-3.5 text-champagne-deep" />
                          <span>My Account</span>
                        </Link>
                        <Link
                          href="/dashboard"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-foreground hover:bg-background-elevated transition-colors"
                        >
                          <LayoutDashboard className="h-3.5 w-3.5 text-champagne-deep" />
                          <span>Skin Profile &amp; Dashboard</span>
                        </Link>
                        <Link
                          href="/compare"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-foreground hover:bg-background-elevated transition-colors"
                        >
                          <Scale className="h-3.5 w-3.5 text-champagne-deep" />
                          <span>Comparison Matrix ({compareCount})</span>
                        </Link>
                        <Link
                          href="/settings"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-foreground hover:bg-background-elevated transition-colors"
                        >
                          <Sliders className="h-3.5 w-3.5 text-champagne-deep" />
                          <span>Account Preferences</span>
                        </Link>
                      </div>
                      <div className="pt-1 border-t border-line/60">
                        <button
                          type="button"
                          onClick={() => {
                            setAccountMenuOpen(false);
                            logout();
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-status-error hover:bg-status-error-bg/60 transition-colors"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          <span>Log out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button size="sm" variant="outline" className="font-semibold text-xs">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/signup" className="hidden sm:inline-block">
                    <Button size="sm" variant="accent" className="font-semibold text-xs">
                      Sign up
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile Drawer Trigger */}
              <MobileNav links={navLinks} />
            </div>
          </nav>
        </Container>
      </header>

      {/* Quick Search Modal Dialog */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div
            className="relative w-full max-w-xl rounded-2xl border border-line bg-background-card p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-line/60">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Sparkles className="h-4 w-4 text-champagne-deep" />
                <span>Search BeautyIQ Database</span>
              </div>
              <button
                type="button"
                onClick={() => setSearchModalOpen(false)}
                className="rounded-full p-1 text-foreground-muted hover:text-foreground hover:bg-background-elevated transition-colors"
                aria-label="Close search"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands, or active ingredients (e.g. Niacinamide, Dot & Key)..."
                className="w-full rounded-xl border border-line bg-background px-4 py-3 pl-11 text-sm text-foreground placeholder:text-foreground-faint focus:border-champagne-deep focus:outline-none focus:ring-2 focus:ring-champagne/20"
              />
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-foreground-faint" />
              <button
                type="submit"
                className="absolute right-2.5 top-2.5 rounded-lg bg-foreground text-background px-3 py-1.5 text-xs font-semibold hover:bg-foreground/90 transition-colors"
              >
                Search
              </button>
            </form>

            <div className="pt-2 text-xs text-foreground-muted space-y-2">
              <span className="font-semibold uppercase tracking-wider text-[0.68rem] text-foreground-faint">
                Quick Suggestions:
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  "Niacinamide Serum",
                  "Gel Moisturizer",
                  "Mineral Sunscreen",
                  "Salicylic Acid",
                  "Minimalist",
                  "The Ordinary",
                ].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setSearchModalOpen(false);
                      router.push(`/products?q=${encodeURIComponent(term)}`);
                    }}
                    className="rounded-full border border-line bg-background-elevated/70 px-2.5 py-1 text-xs text-foreground hover:border-champagne/60 hover:bg-champagne-tint/40 transition-colors flex items-center gap-1"
                  >
                    <span>{term}</span>
                    <ArrowRight className="h-2.5 w-2.5 text-foreground-faint" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
