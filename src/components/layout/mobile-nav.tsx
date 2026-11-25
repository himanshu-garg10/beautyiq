"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  X,
  Sparkles,
  User,
  ShieldCheck,
  Heart,
  Scale,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useAuth } from "@/context/auth-context";
import { useComparison } from "@/context/comparison-context";
import { NotificationService } from "@/services/notification.service";
import { cn } from "@/lib/utils";

interface NavLink {
  label: string;
  href: string;
  isHighlight?: boolean;
  isAi?: boolean;
  isScan?: boolean;
  showBadge?: boolean;
}

export function MobileNav({ links }: { links: NavLink[] }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const { user, role, logout, openAuthModal } = useAuth();
  const { selectedIds } = useComparison();
  const [unreadNotifs, setUnreadNotifs] = React.useState(0);

  React.useEffect(() => {
    setMounted(true);
  }, []);

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
    <div className="lg:hidden flex items-center gap-1.5">
      {/* Quick Compare badge on mobile if active */}
      {compareCount > 0 && (
        <Link
          href="/compare"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-sage-deep/30 bg-sage-tint/50 text-sage-deep"
          aria-label={`Comparing ${compareCount} items`}
        >
          <Scale className="h-4 w-4" />
        </Link>
      )}

      {/* Quick Wishlist on mobile */}
      {user ? (
        <Link
          href="/wishlist"
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-line/60 bg-background-card/80 text-foreground-muted"
          aria-label="Wishlist"
        >
          <Heart className="h-4 w-4" />
          {wishlistCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-clay text-[0.6rem] font-bold text-white px-1">
              {wishlistCount}
            </span>
          )}
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => openAuthModal("login")}
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-line/60 bg-background-card/80 text-foreground-muted"
          aria-label="Wishlist (Sign in required)"
        >
          <Heart className="h-4 w-4" />
        </button>
      )}

      <ThemeToggle className="h-10 w-10 rounded-full" />

      <button
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center text-foreground rounded-full border border-line/60 bg-background-card/80 hover:border-champagne/50 transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <>
                {/* Overlay backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setOpen(false)}
                  className="fixed inset-0 z-[60] bg-black/45 backdrop-blur-sm"
                  aria-hidden="true"
                />

                {/* Slide-in Drawer from Right */}
                <motion.div
                  className="fixed inset-y-0 right-0 z-[60] w-full max-w-sm bg-background border-l border-line/60 shadow-elevated flex flex-col justify-between overflow-y-auto"
                  initial={{ opacity: 0, x: "100%", y: -8 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, x: "100%", y: -8 }}
                  transition={{ duration: 0.24, ease: "easeOut" }}
                >
                  <div>
                    {/* Header inside mobile drawer */}
                    <div className="flex h-[68px] items-center justify-between px-6 border-b border-line/60">
                      <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
                        <span className="font-display text-2xl font-semibold tracking-tight text-foreground">
                          <span className="text-gold-gradient">
                            Beauty
                          </span>
                          <span className="italic font-normal text-foreground">IQ</span>
                        </span>
                      </Link>
                      <button
                        onClick={() => setOpen(false)}
                        aria-label="Close menu"
                        className="flex h-10 w-10 items-center justify-center text-foreground rounded-full border border-line/60 bg-background-card hover:bg-background-elevated transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Main Navigation Links */}
                    <nav className="flex flex-col px-6 pt-4" aria-label="Mobile navigation">
                      {links.map((link, i) => {
                        const isActive =
                          link.href === "/"
                            ? pathname === "/"
                            : pathname === link.href || pathname.startsWith(link.href + "/");
                        return (
                          <motion.div
                            key={link.href}
                            initial={{ opacity: 0, x: 12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.03 * i, duration: 0.2 }}
                          >
                            <Link
                              href={link.href}
                              onClick={() => setOpen(false)}
                              className={cn(
                                "flex items-center justify-between border-b border-line/50 py-3.5 min-h-[44px] font-display text-xl transition-colors",
                                isActive || link.isHighlight
                                  ? "text-champagne-deep font-semibold"
                                  : "text-foreground hover:text-champagne-deep"
                              )}
                            >
                              <span>{link.label}</span>
                              <div className="flex items-center gap-2">
                                {link.showBadge && compareCount > 0 && (
                                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-champagne text-xs font-sans font-bold text-[#1A1510] px-1.5">
                                    {compareCount}
                                  </span>
                                )}
                                {link.isHighlight ? (
                                  <Sparkles className="h-4 w-4 text-champagne-deep" aria-hidden="true" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-foreground-faint" />
                                )}
                              </div>
                            </Link>
                          </motion.div>
                        );
                      })}
                    </nav>
                  </div>

                  {/* Bottom Actions Area */}
                  <div className="p-6 border-t border-line/60 space-y-3 bg-background-elevated/40 mt-6">
                    <Link href="/onboarding" onClick={() => setOpen(false)} className="block">
                      <Button variant="accent" size="lg" className="w-full">
                        Get Recommendations
                      </Button>
                    </Link>

                    {role === "admin" ? (
                      <Link href="/admin/dashboard" onClick={() => setOpen(false)} className="block">
                        <Button variant="clay" size="lg" className="w-full" leftIcon={<ShieldCheck className="h-4 w-4" />}>
                          Admin Dashboard
                        </Button>
                      </Link>
                    ) : user ? (
                      <div className="space-y-2.5">
                        <Link href="/dashboard" onClick={() => setOpen(false)} className="block">
                          <Button variant="outline" size="lg" className="w-full" leftIcon={<User className="h-4 w-4 text-sage-deep" />}>
                            My Personal Dashboard
                          </Button>
                        </Link>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <Link href="/wishlist" onClick={() => setOpen(false)}>
                            <Button variant="ghost" size="sm" className="w-full min-h-[44px] border border-line/60 text-xs">
                              Wishlist ({wishlistCount})
                            </Button>
                          </Link>
                          <Link href="/notifications" onClick={() => setOpen(false)}>
                            <Button variant="ghost" size="sm" className="w-full min-h-[44px] border border-line/60 text-xs">
                              Alerts {unreadNotifs > 0 ? `(${unreadNotifs})` : ""}
                            </Button>
                          </Link>
                          <Link href="/account" onClick={() => setOpen(false)}>
                            <Button variant="ghost" size="sm" className="w-full min-h-[44px] border border-line/60 text-xs">
                              Account
                            </Button>
                          </Link>
                        </div>
                        <button
                          onClick={() => {
                            setOpen(false);
                            logout();
                          }}
                          className="w-full min-h-[44px] text-center text-xs text-status-error hover:underline flex items-center justify-center gap-1"
                        >
                          <LogOut className="h-3.5 w-3.5" /> Sign Out
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
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
