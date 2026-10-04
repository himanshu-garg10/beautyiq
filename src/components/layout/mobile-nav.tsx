"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  X,
  Sparkles,
  User,
  ShieldCheck,
  Heart,
  Bell,
  Scale,
  LogOut,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useAuth } from "@/context/auth-context";
import { useComparison } from "@/context/comparison-context";
import { NotificationService } from "@/services/notification.service";

interface NavLink {
  label: string;
  href: string;
  isHighlight?: boolean;
}

export function MobileNav({ links }: { links: NavLink[] }) {
  const [open, setOpen] = React.useState(false);
  const { user, role, logout, openAuthModal } = useAuth();
  const { selectedIds } = useComparison();
  const [unreadNotifs, setUnreadNotifs] = React.useState(0);

  React.useEffect(() => {
    if (user) {
      setUnreadNotifs(NotificationService.getUnreadCount(user.id));
    }
    const handleUpdate = () => {
      if (user) {
        setUnreadNotifs(NotificationService.getUnreadCount(user.id));
      }
    };
    window.addEventListener("beautyiq_notification_update", handleUpdate);
    window.addEventListener("beautyiq_wishlist_update", handleUpdate);
    return () => {
      window.removeEventListener("beautyiq_notification_update", handleUpdate);
      window.removeEventListener("beautyiq_wishlist_update", handleUpdate);
    };
  }, [user, open]);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const wishlistCount = user?.wishlistIds?.length ?? 0;
  const compareCount = selectedIds?.length ?? 0;

  return (
    <div className="lg:hidden flex items-center gap-2">
      {/* Quick Compare badge on mobile if active */}
      {compareCount > 0 && (
        <Link
          href="/compare"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-sage-deep/40 bg-sage-tint/40 text-sage-deep"
          aria-label={`Comparing ${compareCount} items`}
        >
          <Scale className="h-4 w-4" />
        </Link>
      )}

      {/* Quick Wishlist on mobile */}
      {user ? (
        <Link
          href="/wishlist"
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-line bg-background-card text-foreground-muted"
          aria-label="Wishlist"
        >
          <Heart className="h-4 w-4" />
          {wishlistCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-clay text-[0.6rem] font-bold text-white px-1">
              {wishlistCount}
            </span>
          )}
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => openAuthModal("login")}
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-line bg-background-card text-foreground-muted"
          aria-label="Wishlist (Sign in required)"
        >
          <Heart className="h-4 w-4" />
        </button>
      )}

      <ThemeToggle />

      <button
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center text-foreground rounded-full border border-line bg-background-card"
      >
        <Menu className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 bg-background flex flex-col justify-between overflow-y-auto"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div>
              {/* Header inside mobile drawer */}
              <div className="flex h-[68px] items-center justify-between px-6 border-b border-line">
                <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
                  <span className="font-display text-[1.35rem] font-bold tracking-tight text-foreground">
                    Beauty<span className="italic text-sage-deep">IQ</span>
                  </span>
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="flex h-9 w-9 items-center justify-center text-foreground rounded-full border border-line bg-background-card"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Main Navigation Links */}
              <nav className="flex flex-col px-6 pt-3" aria-label="Mobile navigation">
                {links.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.03 * i, duration: 0.2 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center justify-between border-b border-line/60 py-3.5 font-display text-lg transition-colors ${
                        link.isHighlight
                          ? "text-sage-deep font-semibold"
                          : "text-foreground hover:text-sage-deep"
                      }`}
                    >
                      <span>{link.label}</span>
                      {link.isHighlight && (
                        <Sparkles className="h-4 w-4 text-sage-deep" aria-hidden="true" />
                      )}
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </div>

            {/* Bottom Actions Area */}
            <div className="p-6 border-t border-line space-y-3 bg-background-elevated/40 mt-6">
              <Link href="/onboarding" onClick={() => setOpen(false)}>
                <Button variant="accent" size="lg" className="w-full font-semibold shadow-subtle">
                  Get Recommendations
                </Button>
              </Link>

              {role === "admin" ? (
                <Link href="/admin/dashboard" onClick={() => setOpen(false)}>
                  <Button variant="clay" size="lg" className="w-full" leftIcon={<ShieldCheck className="h-4 w-4" />}>
                    Admin Dashboard
                  </Button>
                </Link>
              ) : user ? (
                <div className="space-y-2">
                  <Link href="/dashboard" onClick={() => setOpen(false)}>
                    <Button variant="outline" size="lg" className="w-full" leftIcon={<User className="h-4 w-4 text-sage-deep" />}>
                      My Personal Dashboard
                    </Button>
                  </Link>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <Link href="/wishlist" onClick={() => setOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full border border-line text-xs">
                        Wishlist ({wishlistCount})
                      </Button>
                    </Link>
                    <Link href="/notifications" onClick={() => setOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full border border-line text-xs">
                        Alerts {unreadNotifs > 0 ? `(${unreadNotifs})` : ""}
                      </Button>
                    </Link>
                    <Link href="/account" onClick={() => setOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full border border-line text-xs">
                        My Account
                      </Button>
                    </Link>
                  </div>
                  <button
                    onClick={() => {
                      setOpen(false);
                      logout();
                    }}
                    className="w-full text-center text-xs text-status-error hover:underline pt-1 flex items-center justify-center gap-1"
                  >
                    <LogOut className="h-3 w-3" /> Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    id="mobile-login-button"
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => {
                      setOpen(false);
                      openAuthModal("login");
                    }}
                  >
                    Log In
                  </Button>
                  <Button
                    id="mobile-register-button"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={() => {
                      setOpen(false);
                      openAuthModal("register");
                    }}
                  >
                    Register
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
