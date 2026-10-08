"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useSkinProfile } from "@/context/skin-profile-context";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Heart,
  LogOut,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UserRound,
} from "lucide-react";

type SavedProductRow = {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    brand: string;
    category: string;
  } | null;
};

export default function AccountPage() {
  const router = useRouter();
  const { user, logout, sessionStatus } = useAuth();
  const { profile } = useSkinProfile();
  const [savedProducts, setSavedProducts] = React.useState<SavedProductRow[]>([]);

  React.useEffect(() => {
    if (sessionStatus !== "authenticated") return;
    fetch("/api/saved-products")
      .then((response) => (response.ok ? response.json() : { data: [] }))
      .then((payload) => setSavedProducts(Array.isArray(payload.data) ? payload.data : []))
      .catch(() => setSavedProducts([]));
  }, [sessionStatus, user?.wishlistIds]);

  const initials = (user?.name || "BeautyIQ Member")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const concerns = profile.concerns?.slice(0, 3) || [];

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      <section className="overflow-hidden rounded-[2rem] border border-line bg-[radial-gradient(circle_at_85%_5%,rgba(215,188,141,0.28),transparent_30%),linear-gradient(135deg,rgba(250,244,234,0.96),rgba(255,255,255,0.96),rgba(230,240,229,0.72))] p-6 shadow-subtle dark:bg-[radial-gradient(circle_at_85%_5%,rgba(161,124,68,0.22),transparent_30%),linear-gradient(135deg,rgba(32,35,34,0.98),rgba(29,31,30,0.98),rgba(38,48,41,0.92))] sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-foreground font-display text-xl font-semibold text-background shadow-md">
              {initials || "BI"}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-champagne-deep">BeautyIQ member</p>
              <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground">{user?.name || "My Account"}</h1>
              <p className="mt-1 text-sm text-foreground-muted">{user?.email}</p>
            </div>
          </div>
          <Link href="/settings" className="inline-flex">
            <Button variant="outline" size="sm" leftIcon={<SlidersHorizontal className="h-4 w-4" />}>
              Account settings
            </Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Link href="/profile" className="group rounded-2xl border border-line bg-background-card p-5 shadow-subtle transition-all hover:-translate-y-0.5 hover:border-sage-deep/30 hover:shadow-md">
          <div className="flex items-center justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage-tint text-sage-deep"><UserRound className="h-5 w-5" /></div><ArrowRight className="h-4 w-4 text-foreground-faint transition-transform group-hover:translate-x-0.5 group-hover:text-sage-deep" /></div>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.13em] text-foreground-faint">Skin profile</p>
          <h2 className="mt-1 font-display text-xl font-semibold text-foreground">{profile.skinType || "Complete your profile"} skin</h2>
          <p className="mt-2 text-sm leading-relaxed text-foreground-muted">{concerns.length ? concerns.join(" · ") : "Add your skin type and concerns for better matches."}</p>
        </Link>

        <Link href="/wishlist" className="group rounded-2xl border border-line bg-background-card p-5 shadow-subtle transition-all hover:-translate-y-0.5 hover:border-rose-400/35 hover:shadow-md">
          <div className="flex items-center justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-500 dark:bg-rose-950/30"><Heart className="h-5 w-5" /></div><ArrowRight className="h-4 w-4 text-foreground-faint transition-transform group-hover:translate-x-0.5 group-hover:text-rose-500" /></div>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.13em] text-foreground-faint">Saved products</p>
          <h2 className="mt-1 font-display text-xl font-semibold text-foreground">{savedProducts.length} saved</h2>
          <p className="mt-2 text-sm leading-relaxed text-foreground-muted">Keep products you want to revisit in one personal wishlist.</p>
        </Link>

        <Link href="/ai-search" className="group rounded-2xl border border-line bg-background-card p-5 shadow-subtle transition-all hover:-translate-y-0.5 hover:border-champagne-deep/35 hover:shadow-md">
          <div className="flex items-center justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-champagne-tint text-champagne-deep"><Sparkles className="h-5 w-5" /></div><ArrowRight className="h-4 w-4 text-foreground-faint transition-transform group-hover:translate-x-0.5 group-hover:text-champagne-deep" /></div>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.13em] text-foreground-faint">Need a suggestion?</p>
          <h2 className="mt-1 font-display text-xl font-semibold text-foreground">Ask AI Match</h2>
          <p className="mt-2 text-sm leading-relaxed text-foreground-muted">Describe your concern naturally and get cosmetic guidance with products.</p>
        </Link>
      </section>

      <section className="rounded-2xl border border-line bg-background-card p-5 shadow-subtle sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line/70 pb-4">
          <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-champagne-deep">Your wishlist</p><h2 className="mt-1 font-display text-2xl font-semibold text-foreground">Recently saved products</h2></div>
          <Link href="/wishlist" className="text-sm font-semibold text-sage-deep hover:underline">View all</Link>
        </div>
        {savedProducts.length ? (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {savedProducts.slice(0, 3).map((item) => (
              <li key={item.id} className="rounded-xl border border-line bg-background-elevated/35 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-champagne-deep">{item.product?.brand || "BeautyIQ catalog"}</p>
                <p className="mt-1 line-clamp-2 text-sm font-semibold text-foreground">{item.product?.name || "Saved product"}</p>
                <p className="mt-2 text-xs text-foreground-muted">{item.product?.category || "Product"}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-5 rounded-xl bg-background-elevated/45 px-4 py-5 text-sm text-foreground-muted">
            Nothing saved yet. <Link href="/products" className="font-semibold text-sage-deep hover:underline">Browse products</Link> and use the heart icon to build your wishlist.
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-line bg-background-card p-5 shadow-subtle sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3"><div className="mt-0.5 rounded-xl bg-sage-tint p-2 text-sage-deep"><ShieldCheck className="h-4 w-4" /></div><div><h2 className="font-semibold text-foreground">Your data stays with your account</h2><p className="mt-1 text-sm text-foreground-muted">Your saved products, profile and activity are kept separate from other BeautyIQ accounts.</p></div></div>
        <Button variant="outline" size="sm" leftIcon={<LogOut className="h-4 w-4" />} onClick={() => logout().then(() => router.push("/"))}>Log out</Button>
      </section>
    </div>
  );
}
