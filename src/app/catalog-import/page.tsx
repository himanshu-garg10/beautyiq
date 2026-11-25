"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  Download,
  Link2,
  PlusCircle,
  Trash2,
  RefreshCw,
  ExternalLink,
  Store,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

const categoryOptions = [
  "Cleanser",
  "Serum",
  "Moisturizer",
  "Sunscreen",
  "Toner",
  "Exfoliator",
  "Face Masks",
  "Lip Care",
  "Eye Care",
  "Treatment Products",
].map((value) => ({ value, label: value }));

const emptyProduct = {
  name: "",
  brand: "",
  category: "Serum",
  sourceUrl: "",
  image: "",
  quantity: "30",
  unit: "ml",
  ingredients: "",
  platform: "Official Store",
  seller: "",
  price: "",
  offerUrl: "",
};

const BRAND_APIS = [
  { name: "Minimalist", domain: "beminimalist.co", status: "REST API Live" },
  { name: "Dot & Key", domain: "dotandkey.com", status: "REST API Live" },
  { name: "The Derma Co", domain: "thedermaco.com", status: "REST API Live" },
  { name: "Plum Goodness", domain: "plumgoodness.com", status: "REST API Live" },
  { name: "Dr. Sheth's", domain: "drsheths.com", status: "REST API Live" },
];

const MARKETPLACE_CONNECTORS = [
  { name: "Amazon India", domain: "amazon.in", badge: "Affiliate PA-API" },
  { name: "Flipkart", domain: "flipkart.com", badge: "Direct Offers" },
  { name: "Nykaa", domain: "nykaa.com", badge: "Live Catalog" },
  { name: "Myntra", domain: "myntra.com", badge: "Beauty Sync" },
  { name: "Purplle", domain: "purplle.com", badge: "Live Pricing" },
  { name: "Tira Beauty", domain: "tirabeauty.com", badge: "Catalog Match" },
];

export default function CatalogImportPage() {
  const [query, setQuery] = React.useState("skincare");
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [product, setProduct] = React.useState(emptyProduct);

  // Retailer API sync state
  const [syncingRetailers, setSyncingRetailers] = React.useState(false);
  const [syncLimit, setSyncLimit] = React.useState(15);
  const [syncStats, setSyncStats] = React.useState<any>(null);

  async function handleSyncRetailerApis() {
    setSyncingRetailers(true);
    try {
      const res = await fetch("/api/retailers/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: syncLimit }),
      });
      const data = await res.json();
      if (data.success) {
        setSyncStats(data.data);
      } else {
        alert(data.error || "Retailer sync failed");
      }
    } catch (e: any) {
      alert("Error triggering sync: " + e.message);
    } finally {
      setSyncingRetailers(false);
    }
  }

  async function importCatalog() {
    setLoading(true);
    setMessage("");
    const response = await fetch("/api/admin/catalog-import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    const payload = await response.json().catch(() => null);
    setMessage(
      response.ok
        ? `Imported or refreshed ${payload.data.imported} of ${payload.data.received} source products.`
        : payload?.error || "Import failed."
    );
    setLoading(false);
  }

  async function removeDemoProducts() {
    if (
      !window.confirm(
        "Remove only the 13 seeded demo products? Imported Open Beauty Facts products will remain."
      )
    )
      return;
    setLoading(true);
    setMessage("");
    const response = await fetch("/api/admin/catalog-import", { method: "DELETE" });
    const payload = await response.json().catch(() => null);
    setMessage(
      response.ok
        ? `Removed ${payload.data.removed} seeded demo products. Imported catalog products remain.`
        : payload?.error || "Demo cleanup failed."
    );
    setLoading(false);
  }

  async function addVerifiedProduct(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const response = await fetch("/api/admin/verified-products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    const payload = await response.json().catch(() => null);
    if (response.ok) {
      setMessage(`Added ${payload.data.name}. It is now available in the BeautyIQ catalog.`);
      setProduct(emptyProduct);
    } else setMessage(payload?.error || "Could not add product.");
    setLoading(false);
  }

  function setField(field: keyof typeof emptyProduct, value: string) {
    setProduct((current) => ({ ...current, [field]: value }));
  }

  return (
    <main className="mx-auto max-w-4xl space-y-8 p-6 md:p-10">
      {/* Header */}
      <div>
        <Badge variant="sage" className="mb-2">
          <Database className="mr-1 h-3.5 w-3.5" /> Retailer API & Catalog Ingestion
        </Badge>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Product & Retailer API Ingestion
        </h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Connect to live official brand APIs and major online marketplace feeds (Minimalist, Dot & Key,
          The Derma Co, Plum, Dr. Sheth&apos;s, Amazon, Flipkart, Nykaa, Myntra, Purplle, Tira).
        </p>
      </div>

      {/* Live Retailer API Integration Section */}
      <section className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background-card to-background-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10">
                Official REST APIs Connected
              </Badge>
            </div>
            <h2 className="mt-2 text-xl font-bold">Multi-Retailer API Sync Engine</h2>
            <p className="text-xs text-foreground-muted">
              Imports authentic live products with images, ingredients, prices, and creates verified buying links across all 7 Indian beauty retailers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={syncLimit}
              onChange={(e) => setSyncLimit(Number(e.target.value))}
              className="rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value={5}>5 items / brand</option>
              <option value={10}>10 items / brand</option>
              <option value={15}>15 items / brand</option>
              <option value={25}>25 items / brand</option>
            </select>

            <Button
              variant="accent"
              onClick={handleSyncRetailerApis}
              disabled={syncingRetailers}
              isLoading={syncingRetailers}
              leftIcon={<RefreshCw className={`h-4 w-4 ${syncingRetailers ? "animate-spin" : ""}`} />}
            >
              {syncingRetailers ? "Syncing APIs..." : "Sync Products from All APIs"}
            </Button>
          </div>
        </div>

        {/* Supported Brand APIs Grid */}
        <div className="mt-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
            Direct Brand Store APIs:
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
            {BRAND_APIS.map((brand) => (
              <div
                key={brand.name}
                className="flex flex-col rounded-lg border border-line bg-background/80 p-2.5 text-xs shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">{brand.name}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </div>
                <span className="mt-1 font-mono text-[10px] text-foreground-muted">{brand.domain}</span>
                <span className="mt-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  {brand.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Supported Marketplace Connectors */}
        <div className="mt-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
            Cross-Website Marketplace Connectors:
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
            {MARKETPLACE_CONNECTORS.map((m) => (
              <div
                key={m.name}
                className="flex flex-col rounded-lg border border-line bg-background/80 p-2 text-xs shadow-2xs"
              >
                <span className="font-semibold text-foreground">{m.name}</span>
                <span className="mt-1 font-mono text-[10px] text-foreground-muted">{m.domain}</span>
                <span className="mt-1 text-[10px] text-primary font-medium">{m.badge}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sync Stats Output */}
        {syncStats && (
          <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" /> Live Sync Complete
              </span>
              <span className="text-[11px] text-foreground-muted">
                {new Date(syncStats.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-md bg-background/70 p-2.5">
                <span className="block text-foreground-muted text-[10px]">Products Synced</span>
                <span className="text-base font-bold text-foreground">{syncStats.totalImported}</span>
              </div>
              <div className="rounded-md bg-background/70 p-2.5">
                <span className="block text-foreground-muted text-[10px]">Cross-Store Listings</span>
                <span className="text-base font-bold text-foreground">{syncStats.totalMarketplaceOffers}</span>
              </div>
              <div className="rounded-md bg-background/70 p-2.5 col-span-2 sm:col-span-1">
                <span className="block text-foreground-muted text-[10px]">Explore Catalog</span>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-1 font-semibold text-primary hover:underline text-xs mt-1"
                >
                  View on Products Page <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Breakdown */}
            <div className="pt-2">
              <p className="font-medium text-foreground text-[11px] mb-1">Sources Synced:</p>
              <div className="flex flex-wrap gap-2">
                {syncStats.sources?.map((s: any) => (
                  <Badge key={s.name} variant="outline" className="text-[10px]">
                    {s.name}: {s.count} products
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Open Beauty Facts Bulk Search Import */}
      <section className="space-y-4 rounded-2xl border border-line bg-background-card p-6 shadow-subtle">
        <div className="space-y-1">
          <Badge variant="sage"><Database className="mr-1 h-3.5 w-3.5" /> Open Beauty Facts</Badge>
          <h2 className="font-display text-xl font-bold">Import public registry data</h2>
          <p className="text-sm text-foreground-muted">
            Import up to 50 product-label records from Open Beauty Facts.
          </p>
        </div>

        <Input
          label="Search term"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="For example: niacinamide"
        />
        <div className="flex flex-wrap gap-3">
          <Button
            variant="accent"
            onClick={importCatalog}
            disabled={loading || !query.trim()}
            isLoading={loading}
            leftIcon={<Download className="h-4 w-4" />}
          >
            Import products
          </Button>
          <Button
            variant="outline"
            onClick={removeDemoProducts}
            disabled={loading}
            leftIcon={<Trash2 className="h-4 w-4 text-rose-600" />}
          >
            Remove seeded demo products
          </Button>
        </div>
        {message && (
          <p className="rounded border border-line bg-background-card p-4 text-sm">{message}</p>
        )}
      </section>

      {/* Manual Product Add */}
      <section className="space-y-5 rounded-2xl border border-line bg-background-card p-6 shadow-subtle">
        <div className="space-y-1">
          <Badge variant="sage"><PlusCircle className="mr-1 h-3.5 w-3.5" /> Source-linked product</Badge>
          <h2 className="font-display text-xl font-bold">Add a real product manually</h2>
          <p className="text-sm text-foreground-muted">
            Paste information from an official brand or retailer page to register it directly.
          </p>
        </div>
        <form onSubmit={addVerifiedProduct} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Product name"
            value={product.name}
            onChange={(e) => setField("name", e.target.value)}
            required
          />
          <Input
            label="Brand"
            value={product.brand}
            onChange={(e) => setField("brand", e.target.value)}
            required
          />
          <Select
            label="Category"
            options={categoryOptions}
            value={product.category}
            onChange={(e) => setField("category", e.target.value)}
          />
          <Input
            label="Official / retailer product URL"
            type="url"
            value={product.sourceUrl}
            onChange={(e) => setField("sourceUrl", e.target.value)}
            required
            leftIcon={<Link2 className="h-4 w-4" />}
          />
          <Input
            label="Direct product image URL"
            type="url"
            value={product.image}
            onChange={(e) => setField("image", e.target.value)}
            helperText="Use the image URL from the official product page."
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Quantity"
              type="number"
              min="1"
              value={product.quantity}
              onChange={(e) => setField("quantity", e.target.value)}
              required
            />
            <Select
              label="Unit"
              options={[
                { value: "ml", label: "ml" },
                { value: "g", label: "g" },
                { value: "pcs", label: "pcs" },
                { value: "sheets", label: "sheets" },
              ]}
              value={product.unit}
              onChange={(e) => setField("unit", e.target.value)}
            />
          </div>
          <Textarea
            className="md:col-span-2 min-h-[90px]"
            label="Ingredients from the label"
            value={product.ingredients}
            onChange={(e) => setField("ingredients", e.target.value)}
            placeholder="Water, Niacinamide, ..."
            helperText="Comma-separated. This makes ingredient-based recommendations possible."
          />
          <Input
            label="Store / platform (optional)"
            value={product.platform}
            onChange={(e) => setField("platform", e.target.value)}
            placeholder="Amazon, Nykaa, Official Store"
          />
          <Input
            label="Price in ₹ (optional)"
            type="number"
            min="1"
            value={product.price}
            onChange={(e) => setField("price", e.target.value)}
          />
          <Input
            className="md:col-span-2"
            label="Offer URL (optional)"
            type="url"
            value={product.offerUrl}
            onChange={(e) => setField("offerUrl", e.target.value)}
            helperText="Use this when the price is from a different retailer page."
          />
          <div className="md:col-span-2">
            <Button
              type="submit"
              variant="accent"
              disabled={loading}
              isLoading={loading}
              leftIcon={<PlusCircle className="h-4 w-4" />}
            >
              Save real product
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}

