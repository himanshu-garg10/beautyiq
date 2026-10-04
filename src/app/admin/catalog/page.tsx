import Link from "next/link";
import { Database, ExternalLink, PackagePlus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminCatalogPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="rounded-2xl border border-sage-deep/25 bg-gradient-to-r from-sage-deep to-sage px-6 py-6 text-white shadow-md">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/75">BeautyIQ Admin</p>
        <h1 className="mt-1 font-display text-3xl font-bold">Catalog Control Room</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/85">This workspace controls the real data customers see: product records, source links, ingredients and retailer offers.</p>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-line bg-background-card p-5 shadow-subtle md:col-span-2"><PackagePlus className="h-6 w-6 text-sage-deep" /><h2 className="mt-3 font-display text-xl font-bold">Manage real products</h2><p className="mt-2 text-sm text-foreground-muted">Import Open Beauty Facts labels, remove seeded demos, or add an official/retailer source-linked product with its ingredients and price.</p><Link className="mt-5 inline-block" href="/catalog-import"><Button variant="accent" leftIcon={<ExternalLink className="h-4 w-4" />}>Open catalog editor</Button></Link></div>
        <div className="rounded-2xl border border-line bg-background-card p-5 shadow-subtle"><ShieldCheck className="h-6 w-6 text-sage-deep" /><h2 className="mt-3 font-display text-xl font-bold">Admin-only actions</h2><p className="mt-2 text-sm text-foreground-muted">Customers cannot import, delete, or edit catalog data. Their pages only display the approved catalog.</p><Database className="mt-5 h-5 w-5 text-foreground-faint" /></div>
      </div>
    </div>
  );
}
