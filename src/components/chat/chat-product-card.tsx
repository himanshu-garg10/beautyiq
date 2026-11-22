"use client";

import * as React from "react";
import Link from "next/link";
import { ExternalLink, Star, ShieldCheck, AlertTriangle, Sparkles } from "lucide-react";
import type { ProductRecommendation } from "@/lib/skincare-chat/types";
import { cn } from "@/lib/utils";

const VIA_LABEL: Record<string, string> = {
  product_listing: "listed on the product",
  ingredient: "via an ingredient on its label",
  related_concern: "related listed concern",
};

/**
 * Recommendation card used inside the chat. It follows the catalog ProductCard styling and routing
 * (/products/:id) and renders only fields that came from the catalog record.
 */
export function ChatProductCard({ rec, rank }: { rec: ProductRecommendation; rank?: number }) {
  const [imageFailed, setImageFailed] = React.useState(false);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-line bg-background-card transition-all hover:border-line-strong hover:shadow-md">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-background-elevated">
        {!imageFailed && rec.image ? (
          // eslint-disable-next-line @next/next/no-img-element -- catalog images come from several hosts
          <img
            src={rec.image}
            alt={`${rec.brand} ${rec.name}`}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-foreground-faint">Image unavailable</div>
        )}
        {rank ? (
          <span className="absolute left-3 top-3 rounded-full bg-foreground px-2.5 py-0.5 text-[0.7rem] font-bold text-background">#{rank}</span>
        ) : null}
        <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-line bg-background-card/95 px-2.5 py-0.5 text-[0.7rem] font-bold text-foreground">
          <Sparkles className="h-3 w-3 text-champagne-deep" aria-hidden />
          {Math.round(rec.score.total)}/100 match
        </span>
        <span className="absolute bottom-2.5 left-3 rounded-full bg-black/60 px-2 py-0.5 text-[0.65rem] font-medium text-white">{rec.category}</span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[0.72rem] font-bold uppercase tracking-wider text-sage-deep">{rec.brand}</span>
          {rec.rating ? (
            <span className="flex shrink-0 items-center gap-1 text-xs">
              <Star className="h-3.5 w-3.5 fill-clay text-clay" aria-hidden />
              <span className="font-semibold text-foreground">{rec.rating.value}</span>
              <span className="text-[0.7rem] text-foreground-faint">({rec.rating.count.toLocaleString("en-IN")})</span>
            </span>
          ) : null}
        </div>

        <h3 className="font-display text-[0.98rem] font-bold leading-snug text-foreground">{rec.name}</h3>

        <div className="flex items-baseline gap-2">
          {rec.price ? (
            <>
              <span className="font-display text-lg font-bold text-foreground">₹{rec.price.amount.toLocaleString("en-IN")}</span>
              <span className="text-[0.68rem] text-foreground-faint">
                {rec.quantity} {rec.unit} · via {rec.price.platform}
              </span>
            </>
          ) : (
            <span className="text-xs font-semibold text-foreground-muted">Price not verified</span>
          )}
        </div>

        {rec.matchedConcerns.length > 0 && (
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-wide text-foreground-faint">May help address</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {rec.matchedConcerns.map((c) => (
                <span
                  key={c.concern}
                  title={VIA_LABEL[c.via]}
                  className="rounded bg-clay-tint/70 px-2 py-0.5 text-[0.68rem] font-medium text-clay dark:bg-clay-tint/20"
                >
                  {c.concern}
                </span>
              ))}
            </div>
          </div>
        )}

        {rec.relevantIngredients.length > 0 && (
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-wide text-foreground-faint">What the key ingredients do</p>
            <ul className="mt-1.5 space-y-2">
              {rec.relevantIngredients.map((i) => (
                <li key={i.name} className="rounded-lg bg-sage-tint/40 px-2.5 py-2 text-[0.78rem] leading-snug text-foreground-muted dark:bg-sage-deep/10">
                  <span className="font-semibold text-foreground">{i.name}</span>
                  <span> is {i.role}.</span>
                  {i.helpsWith.length > 0 && (
                    <span className="mt-1 block font-medium text-sage-deep">
                      Relevant to your {i.helpsWith.map((c) => c.toLowerCase()).join(", ")}
                    </span>
                  )}
                  {i.usage && <span className="mt-1 block text-foreground-faint">{i.usage}</span>}
                </li>
              ))}
            </ul>
            <p className="mt-1.5 text-[0.65rem] text-foreground-faint">Ingredient names come from the product&apos;s label; what they do is general skincare guidance.</p>
          </div>
        )}

        <p className="text-[0.82rem] leading-relaxed text-foreground-muted">
          <span className="font-semibold text-foreground">Why: </span>
          {rec.why}
        </p>

        {rec.cautions.length > 0 && (
          <ul className="space-y-1">
            {rec.cautions.slice(0, 2).map((c) => (
              <li key={c} className="flex items-start gap-1.5 text-[0.75rem] leading-snug text-amber-800 dark:text-amber-300">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                {c}
              </li>
            ))}
          </ul>
        )}

        <div className={cn("mt-auto flex items-center justify-between gap-2 border-t border-line/60 pt-3")}>
          <span className="flex items-center gap-1 text-[0.68rem] text-foreground-faint">
            <ShieldCheck className="h-3.5 w-3.5 text-sage-deep" aria-hidden /> Catalog data
          </span>
          <Link
            href={rec.link}
            className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3.5 py-2 text-xs font-semibold text-background transition-opacity hover:opacity-85"
          >
            View Product <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}
