"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Database, Download, Link2, PlusCircle, Trash2 } from "lucide-react";

const categoryOptions = ["Cleanser", "Serum", "Moisturizer", "Sunscreen", "Toner", "Exfoliator", "Face Masks", "Lip Care", "Eye Care", "Treatment Products"].map((value) => ({ value, label: value }));
const emptyProduct = { name: "", brand: "", category: "Serum", sourceUrl: "", image: "", quantity: "30", unit: "ml", ingredients: "", platform: "Official Store", seller: "", price: "", offerUrl: "" };

export default function CatalogImportPage() {
  const [query, setQuery] = React.useState("skincare");
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [product, setProduct] = React.useState(emptyProduct);

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

  async function addVerifiedProduct(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const response = await fetch("/api/admin/verified-products", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(product),
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
    <main className="mx-auto max-w-2xl space-y-6 p-8">
      <Badge variant="sage"><Database className="mr-1 h-3.5 w-3.5" /> Real catalog import</Badge>
      <div className="space-y-2"><h1 className="font-display text-3xl font-bold">Import cosmetic product data</h1><p className="text-sm text-foreground-muted">Import up to 50 product-label records from Open Beauty Facts. Prices and ratings stay unavailable until a verified retailer source is connected.</p></div>
      <Input label="Search term" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="For example: niacinamide" />
      <div className="flex flex-wrap gap-3">
        <Button variant="accent" onClick={importCatalog} disabled={loading || !query.trim()} isLoading={loading} leftIcon={<Download className="h-4 w-4" />}>Import products</Button>
        <Button variant="outline" onClick={removeDemoProducts} disabled={loading} leftIcon={<Trash2 className="h-4 w-4 text-rose-600" />}>Remove seeded demo products</Button>
      </div>
      {message && <p className="rounded border border-line bg-background-card p-4 text-sm">{message}</p>}

      <section className="space-y-5 rounded-2xl border border-line bg-background-card p-5 shadow-subtle md:p-7">
        <div className="space-y-1"><Badge variant="sage"><PlusCircle className="mr-1 h-3.5 w-3.5" /> Source-linked product</Badge><h2 className="font-display text-2xl font-bold">Add a real product manually</h2><p className="text-sm text-foreground-muted">Paste information only from an official brand or retailer page. This form does not scrape the link; it records the source you verify.</p></div>
        <form onSubmit={addVerifiedProduct} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label="Product name" value={product.name} onChange={(e) => setField("name", e.target.value)} required />
          <Input label="Brand" value={product.brand} onChange={(e) => setField("brand", e.target.value)} required />
          <Select label="Category" options={categoryOptions} value={product.category} onChange={(e) => setField("category", e.target.value)} />
          <Input label="Official / retailer product URL" type="url" value={product.sourceUrl} onChange={(e) => setField("sourceUrl", e.target.value)} required leftIcon={<Link2 className="h-4 w-4" />} />
          <Input label="Direct product image URL" type="url" value={product.image} onChange={(e) => setField("image", e.target.value)} helperText="Use the image URL from the official product page." required />
          <div className="grid grid-cols-2 gap-3"><Input label="Quantity" type="number" min="1" value={product.quantity} onChange={(e) => setField("quantity", e.target.value)} required /><Select label="Unit" options={[{ value: "ml", label: "ml" }, { value: "g", label: "g" }, { value: "pcs", label: "pcs" }, { value: "sheets", label: "sheets" }]} value={product.unit} onChange={(e) => setField("unit", e.target.value)} /></div>
          <Textarea className="md:col-span-2 min-h-[90px]" label="Ingredients from the label" value={product.ingredients} onChange={(e) => setField("ingredients", e.target.value)} placeholder="Water, Niacinamide, ..." helperText="Comma-separated. This makes ingredient-based recommendations possible." />
          <Input label="Store / platform (optional)" value={product.platform} onChange={(e) => setField("platform", e.target.value)} placeholder="Amazon, Nykaa, Official Store" />
          <Input label="Price in ₹ (optional)" type="number" min="1" value={product.price} onChange={(e) => setField("price", e.target.value)} />
          <Input className="md:col-span-2" label="Offer URL (optional)" type="url" value={product.offerUrl} onChange={(e) => setField("offerUrl", e.target.value)} helperText="Use this when the price is from a different retailer page." />
          <div className="md:col-span-2"><Button type="submit" variant="accent" disabled={loading} isLoading={loading} leftIcon={<PlusCircle className="h-4 w-4" />}>Save real product</Button></div>
        </form>
      </section>
    </main>
  );
}
