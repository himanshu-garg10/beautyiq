"use client";

import Link from "next/link";
import { ArrowUpRight, LogOut, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";

export function AdminHeader() {
  const { user, logout } = useAuth();
  const initials = user?.name?.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "AD";
  return <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-line bg-background-card/95 px-5 shadow-subtle backdrop-blur sm:px-8 lg:px-10">
    <div className="flex min-w-0 items-center gap-4 sm:gap-6"><Link href="/admin/dashboard" className="shrink-0 font-display text-2xl font-bold tracking-tight text-foreground">Beauty<span className="ml-0.5 italic font-normal text-sage-deep">IQ</span></Link><span className="hidden h-7 w-px bg-line sm:block" /><div className="hidden min-w-0 sm:block"><p className="text-xs font-bold uppercase tracking-[0.16em] text-sage-deep">Administrator workspace</p><p className="mt-0.5 truncate text-sm text-foreground-muted">Catalog Control Room</p></div></div>
    <div className="flex items-center gap-2 sm:gap-4"><Link href="/" className="hidden md:block"><Button variant="outline" size="sm" rightIcon={<ArrowUpRight className="h-3.5 w-3.5" />}>View customer site</Button></Link><ThemeToggle /><div className="hidden h-7 w-px bg-line sm:block" /><div className="flex items-center gap-2.5"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-sage-tint text-xs font-bold text-sage-deep">{initials}</div><div className="hidden text-left sm:block"><p className="max-w-36 truncate text-sm font-bold text-foreground">{user?.name || "Administrator"}</p><p className="flex items-center gap-1 text-[0.68rem] font-bold uppercase tracking-wider text-sage-deep"><ShieldCheck className="h-3 w-3" />Admin</p></div><Button variant="ghost" size="icon" onClick={logout} title="Log out"><LogOut className="h-4 w-4 text-foreground-faint hover:text-status-error" /></Button></div></div>
  </header>;
}
