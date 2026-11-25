"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Sparkles,
  Camera,
  User,
  Heart,
  Search,
  LogOut,
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
  { label: "Skin Scan", href: "/skin-scan", isScan: true },
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

  const { user, role, logout } = useAuth();
  const { selectedIds } = useComparison();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
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
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setSearchModalOpen(false);
    }
    if (searchModalOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
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
          "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300",
          scrolled
            ? "bg-background/90 backdrop-blur-md border-b border-line/30 shadow-sm py-2.5"
            : "bg-background/80 backdrop-blur-md border-b border-transparent py-3.5"
        )}
      >
        <Container className="max-w-none px-4 sm:px-8 xl:px-12">
          <nav
            className="flex items-center justify-between gap-4"
            aria-label="Primary navigation"
          >
            {/* Left: BeautyIQ Wordmark */}
            <div className="flex items-center gap-5 shrink-0">
              <Link href="/" className="group flex items-center gap-2.5">
                <span className="font-display text-2xl md:text-[1.7rem] font-semibold tracking-tight text-foreground transition-opacity group-hover:opacity-90">
                  <span className="text-gold-gradient">
                    Beauty
                  </span>
                  <span className="italic font-normal text-foreground ml-0.5">IQ</span>
                </span>
                <span className="hidden sm:inline-block h-1.5 w-1.5 rounded-full bg-champagne/80" />
                <span className="hidden xl:flex flex-col text-[0.62rem] leading-[1.15] tracking-[0.18em] uppercase font-mono text-foreground-faint">
                  <span>AI Skincare</span>
                  <span>Intelligence</span>
                </span>
              </Link>
            </div>

            {/* Center: Main Navigation */}
            <ul className="hidden lg:flex items-center gap-1.5 xl:gap-3">
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "relative px-3.5 py-2 text-sm font-medium transition-colors duration-200 flex items-center gap-1.5 tracking-tight",
                        isActive
                          ? "font-semibold text-foreground"
                          : "text-foreground-muted hover:text-foreground"
                      )}
                    >
                      {link.isScan && (
                        <Camera className="h-3.5 w-3.5 text-sage-deep shrink-0" />
                      )}
                      <span>{link.label}</span>
                      {link.showBadge && compareCount > 0 && (
                        <span className="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-champagne text-[0.62rem] font-bold text-[#1A1510] px-1">
                          {compareCount}
                        </span>
                      )}
                      {isActive && (
                        <motion.div
                          layoutId="nav-active"
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                          className="absolute -bottom-px left-0 right-0 h-0.5 bg-champagne rounded-full"
                        />
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
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line/60 bg-background-card/80 hover:bg-background-elevated text-foreground-muted hover:text-foreground transition-all shadow-xs hover:border-champagne/50"
                title="Search products and ingredients"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </button>

              {/* Wishlist Button with Badge */}
              {user ? (
                <Link
                  href="/wishlist"
                  className="relative hidden lg:flex h-9 w-9 items-center justify-center rounded-full border border-line/60 bg-background-card/80 hover:bg-background-elevated text-foreground-muted hover:text-foreground transition-all shadow-xs hover:border-champagne/50"
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
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-line/60 bg-background-card/80 text-foreground-muted transition-all shadow-xs hover:border-champagne/50 hover:bg-background-elevated hover:text-foreground"
                    aria-label="User Account Menu"
                    aria-expanded={accountMenuOpen}
                  >
                    <User className="h-4 w-4" />
                  </button>

                  {/* Account Dropdown Menu */}
                  <AnimatePresence>
                    {accountMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.97 }}
                        transition={{ duration: 0.16, ease: "easeOut" }}
                        className="absolute right-0 mt-2 w-56 rounded-2xl border border-line/70 bg-background-card p-1.5 shadow-elevated z-50 text-xs"
                      >
                        <div className="px-3 py-2.5 border-b border-line/60">
                          <p className="font-semibold text-foreground truncate">{user.name}</p>
                          <p className="text-[0.7rem] text-foreground-faint truncate">{user.email}</p>
                        </div>
                        <div className="py-1 space-y-0.5">
                          {role === "admin" ? (
                            <Link
                              href="/admin/dashboard"
                              onClick={() => setAccountMenuOpen(false)}
                              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-champagne-tint/60 text-foreground hover:bg-champagne-tint transition-colors"
                            >
                              <ShieldCheck className="h-3.5 w-3.5 text-champagne-deep" />
                              <span>Catalog Control Room</span>
                            </Link>
                          ) : null}
                          <Link
                            href="/account"
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-foreground hover:bg-background-elevated transition-colors"
                          >
                            <User className="h-3.5 w-3.5 text-champagne-deep" />
                            <span>My Account</span>
                          </Link>
                        </div>
                        <div className="pt-1 border-t border-line/60">
                          <button
                            type="button"
                            onClick={() => {
                              setAccountMenuOpen(false);
                              logout();
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 rounded-xl text-status-error hover:bg-status-error-bg/60 transition-colors"
                          >
                            <LogOut className="h-3.5 w-3.5" />
                            <span>Log out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button size="sm" variant="outline" className="font-medium text-xs rounded-full px-4">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/signup" className="hidden sm:inline-block">
                    <Button size="sm" variant="accent" className="text-xs rounded-full px-4">
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
      <AnimatePresence>
        {searchModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setSearchModalOpen(false)}
            className="fixed inset-0 z-[60] flex items-start justify-center pt-20 px-4 bg-black/45 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-xl rounded-2xl border border-line/70 bg-background-card p-6 shadow-elevated space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-line/60">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Sparkles className="h-4 w-4 text-champagne-deep" />
                  <span className="font-display text-lg">Search BeautyIQ Database</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSearchModalOpen(false)}
                  className="rounded-full p-1.5 text-foreground-muted hover:text-foreground hover:bg-background-elevated transition-colors"
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
                  className="w-full rounded-xl border border-line/60 bg-background px-4 py-3 pl-11 pr-24 text-sm text-foreground placeholder:text-foreground-faint transition-all duration-200 focus:border-champagne focus:outline-none focus:ring-2 focus:ring-champagne/20"
                />
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-foreground-faint" />
                <Button
                  type="submit"
                  size="sm"
                  variant="accent"
                  className="absolute right-2 top-1.5 h-8 rounded-lg px-3.5 text-xs"
                >
                  Search
                </Button>
              </form>

              <div className="pt-1 text-xs text-foreground-muted space-y-2">
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
                      className="rounded-full border border-line/70 bg-background-elevated/70 px-3 py-1 text-xs text-foreground hover:border-champagne/60 hover:bg-champagne-tint/40 transition-colors flex items-center gap-1"
                    >
                      <span>{term}</span>
                      <ArrowRight className="h-2.5 w-2.5 text-foreground-faint" />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
