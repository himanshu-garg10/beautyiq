"use client";

import * as React from "react";
import Link from "next/link";

/** Route-level recovery instead of Next's raw client exception page. */
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[65vh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <span className="rounded-full bg-champagne-tint px-3 py-1 text-xs font-bold uppercase tracking-wider text-champagne-deep">BeautyIQ recovery</span>
      <h1 className="mt-5 font-display text-3xl font-bold text-foreground">This page needs a quick refresh.</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-foreground-muted">Your information is safe. The page did not finish loading correctly, so you can retry without losing your place.</p>
      <div className="mt-7 flex items-center gap-3"><button type="button" onClick={reset} className="rounded-xl bg-sage-deep px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-hover">Try again</button><Link href="/" className="rounded-xl border border-line bg-background-card px-5 py-2.5 text-sm font-bold text-foreground hover:bg-background-elevated">Go home</Link></div>
    </main>
  );
}
