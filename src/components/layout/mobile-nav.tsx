"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Sparkles, User, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useAuth } from "@/context/auth-context";

interface NavLink {
  label: string;
  href: string;
}

export function MobileNav({ links }: { links: NavLink[] }) {
  const [open, setOpen] = React.useState(false);
  const { user, role, switchRole } = useAuth();

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden flex items-center gap-2">
      <ThemeToggle />

      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center text-foreground rounded border border-line"
      >
        <Menu className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 bg-background flex flex-col justify-between"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div>
              <div className="flex h-[72px] items-center justify-between px-6 border-b border-line">
                <span className="font-display text-[1.35rem] text-foreground">
                  Beauty<span className="italic text-sage-deep">IQ</span>
                </span>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="flex h-10 w-10 items-center justify-center text-foreground rounded border border-line"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex flex-col gap-1 px-6 pt-4" aria-label="Mobile">
                {links.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 * i, duration: 0.25 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="block border-b border-line py-3.5 font-display text-lg text-foreground hover:text-sage-deep transition-colors"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                <Link
                  href="/search"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 border-b border-line py-3.5 font-display text-lg text-foreground hover:text-sage-deep"
                >
                  <Sparkles className="h-4 w-4 text-sage-deep" aria-hidden="true" />
                  AI Search & Discovery
                </Link>
              </nav>
            </div>

            <div className="p-6 border-t border-line space-y-3 bg-background-elevated/40">
              <Link href="/onboarding" onClick={() => setOpen(false)}>
                <Button variant="accent" size="lg" className="w-full mb-2">
                  Get My Recommendations
                </Button>
              </Link>

              {role === "admin" ? (
                <Link href="/admin/dashboard" onClick={() => setOpen(false)}>
                  <Button variant="clay" size="lg" className="w-full" leftIcon={<ShieldCheck className="h-4 w-4" />}>
                    Admin Dashboard
                  </Button>
                </Link>
              ) : user ? (
                <Link href="/profile" onClick={() => setOpen(false)}>
                  <Button variant="outline" size="lg" className="w-full" leftIcon={<User className="h-4 w-4" />}>
                    My Profile & Routine
                  </Button>
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/login" onClick={() => setOpen(false)}>
                    <Button variant="outline" size="lg" className="w-full">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setOpen(false)}>
                    <Button variant="primary" size="lg" className="w-full">
                      Register
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
