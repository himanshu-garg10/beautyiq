"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Database, Download, Trash2 } from "lucide-react";

export default function CatalogImportPage() {
  const [query, setQuery] = React.useState("skincare");
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState("");

  async function importCatalog() {
    setLoading(true);
    setMessage("");
    const response = await fetch("/api/admin/catalog-import", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query }),
    });
    const payload = await response.json().catch(() => null);
    setMessage(response.ok ? `Imported or refreshed ${payload.data.imported} of ${payload.data.received} source products.` : payload?.error || "Import failed.");
    setLoading(false);
  }

  async function removeDemoProducts() {
    if (!window.confirm("Remove only the 13 seeded demo products? Imported Open Beauty Facts products will remain.")) return;
    setLoading(true);
    setMessage("");
    const response = await fetch("/api/admin/catalog-import", { method: "DELETE" });
    const payload = await response.json().catch(() => null);
    setMessage(response.ok ? `Removed ${payload.data.removed} seeded demo products. Imported catalog products remain.` : payload?.error || "Demo cleanup failed.");
    setLoading(false);
  }

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-8">
      <Badge variant="sage"><Database className="mr-1 h-3.5 w-3.5" /> Real catalog import</Badge>
      <div className="space-y-2"><h1 className="font-display text-3xl font-bold">Import cosmetic product data</h1><p className="text-sm text-foreground-muted">Import up to 50 product-label records from Open Beauty Facts. Prices and ratings stay unavailable until a verified retailer source is connected.</p></div>
      <Input label="Search term" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="For example: niacinamide" />
      <div className="flex flex-wrap gap-3">
        <Button variant="accent" onClick={importCatalog} disabled={loading || !query.trim()} isLoading={loading} leftIcon={<Download className="h-4 w-4" />}>Import products</Button>
        <Button variant="outline" onClick={removeDemoProducts} disabled={loading} leftIcon={<Trash2 className="h-4 w-4 text-rose-600" />}>Remove seeded demo products</Button>
      </div>
      {message && <p className="rounded border border-line bg-background-card p-4 text-sm">{message}</p>}
    </main>
  );
}
