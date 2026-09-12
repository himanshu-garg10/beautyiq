"use client";

import * as React from "react";
import { AdminDataService } from "@/services/admin-data.service";
import type { ProductListing, AvailabilityStatus, Product, Platform } from "@/types";
import { AdminTable, Column } from "@/components/admin/admin-table";
import { AdminConfirmModal } from "@/components/admin/admin-confirm-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/context/toast-context";
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  DollarSign,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
} from "lucide-react";

export default function AdminListingsPage() {
  const { addToast } = useToast();
  const [listings, setListings] = React.useState<ProductListing[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [platforms, setPlatforms] = React.useState<Platform[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [platformFilter, setPlatformFilter] = React.useState("all");
  const [availFilter, setAvailFilter] = React.useState("all");

  // Price & Availability Quick Edit Modal
  const [editingPriceListing, setEditingPriceListing] = React.useState<ProductListing | null>(null);
  const [priceInput, setPriceInput] = React.useState("");
  const [availInput, setAvailInput] = React.useState<AvailabilityStatus>("Available");
  const [savingPrice, setSavingPrice] = React.useState(false);

  // Full Create / Edit Modal
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingListing, setEditingListing] = React.useState<ProductListing | null>(null);
  const [formProductId, setFormProductId] = React.useState("p1");
  const [formPlatform, setFormPlatform] = React.useState("Nykaa");
  const [formSeller, setFormSeller] = React.useState("Nykaa Retail");
  const [formPrice, setFormPrice] = React.useState("549");
  const [formOrigPrice, setFormOrigPrice] = React.useState("599");
  const [formQuantity, setFormQuantity] = React.useState(50);
  const [formUnit, setFormUnit] = React.useState<"ml" | "g">("ml");
  const [formAvail, setFormAvail] = React.useState<AvailabilityStatus>("Available");
  const [formUrl, setFormUrl] = React.useState("https://nykaa.com");
  const [savingForm, setSavingForm] = React.useState(false);

  // Delete modal
  const [listingToDelete, setListingToDelete] = React.useState<ProductListing | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    const [lData, pData, platData] = await Promise.all([
      AdminDataService.getListings({
        search,
        platform: platformFilter,
        availability: availFilter,
      }),
      AdminDataService.getProducts(),
      AdminDataService.getPlatforms(),
    ]);
    setListings(lData);
    setProducts(pData);
    setPlatforms(platData);
    setLoading(false);
  }, [search, platformFilter, availFilter]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Open Quick Price/Availability Editor
  const handleOpenPriceModal = (listing: ProductListing) => {
    setEditingPriceListing(listing);
    setPriceInput(listing.price !== null ? String(listing.price) : "");
    setAvailInput(listing.availability);
  };

  const handleSavePriceModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPriceListing) return;
    setSavingPrice(true);

    const parsedPrice = priceInput.trim() !== "" ? parseFloat(priceInput) : null;
    await AdminDataService.updatePriceAvailability(
      editingPriceListing.id,
      parsedPrice,
      availInput
    );

    setSavingPrice(false);
    setEditingPriceListing(null);
    loadData();
    addToast({
      type: "success",
      title: "Price & Availability Updated",
      description: `Listing updated to ₹${parsedPrice ?? "N/A"} (${availInput}).`,
    });
  };

  // Open Full Create / Edit
  const handleOpenCreate = () => {
    setEditingListing(null);
    setFormProductId(products[0]?.id || "p1");
    setFormPlatform(platforms[0]?.name || "Nykaa");
    setFormSeller("Official Store");
    setFormPrice("499");
    setFormOrigPrice("599");
    setFormQuantity(50);
    setFormUnit("ml");
    setFormAvail("Available");
    setFormUrl("https://nykaa.com");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (l: ProductListing) => {
    setEditingListing(l);
    setFormProductId(l.productId);
    setFormPlatform(l.platform);
    setFormSeller(l.seller);
    setFormPrice(l.price !== null ? String(l.price) : "");
    setFormOrigPrice(l.originalPrice ? String(l.originalPrice) : "");
    setFormQuantity(l.quantity || 50);
    setFormUnit(l.unit as any || "ml");
    setFormAvail(l.availability);
    setFormUrl(l.productUrl || "https://nykaa.com");
    setIsFormOpen(true);
  };

  const handleSaveFullForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingForm(true);

    const price = formPrice.trim() !== "" ? parseFloat(formPrice) : null;
    const origPrice = formOrigPrice.trim() !== "" ? parseFloat(formOrigPrice) : undefined;
    const discount = price && origPrice ? Math.round(((origPrice - price) / origPrice) * 100) : 0;

    const payload: Partial<ProductListing> = {
      productId: formProductId,
      platform: formPlatform,
      seller: formSeller,
      price,
      originalPrice: origPrice,
      discountPercent: discount,
      quantity: Number(formQuantity),
      unit: formUnit,
      availability: formAvail,
      productUrl: formUrl,
    };

    if (editingListing) {
      await AdminDataService.updateListing(editingListing.id, payload);
      addToast({ type: "success", title: "Listing Updated", description: "Changes saved." });
    } else {
      await AdminDataService.createListing(payload);
      addToast({ type: "success", title: "Listing Created", description: "Listing added to product." });
    }

    setSavingForm(false);
    setIsFormOpen(false);
    loadData();
  };

  const handleDeleteListing = async () => {
    if (!listingToDelete) return;
    setDeleteLoading(true);
    await AdminDataService.deleteListing(listingToDelete.id);
    setDeleteLoading(false);
    setListingToDelete(null);
    loadData();
    addToast({ type: "success", title: "Listing Removed", description: "Listing deleted." });
  };

  const columns: Column<ProductListing>[] = [
    {
      header: "Product & Platform",
      render: (l) => {
        const prod = products.find((p) => p.id === l.productId);
        return (
          <div>
            <span className="font-semibold text-foreground block line-clamp-1">
              {prod ? prod.name : `Product #${l.productId}`}
            </span>
            <div className="flex items-center gap-1.5 text-[0.7rem] text-foreground-muted mt-0.5">
              <span className="font-medium text-sage-deep">{l.platform}</span>
              <span>•</span>
              <span className="truncate">{l.seller}</span>
            </div>
          </div>
        );
      },
    },
    {
      header: "Active Price",
      render: (l) => (
        <div>
          {l.price !== null ? (
            <span className="font-mono text-sm font-bold text-foreground">
              ₹{l.price.toLocaleString()}
            </span>
          ) : (
            <span className="text-xs text-status-warning italic font-mono">Unpriced</span>
          )}
          {l.originalPrice && l.price && l.originalPrice > l.price && (
            <span className="text-foreground-faint text-[0.68rem] block line-through">
              ₹{l.originalPrice} ({l.discountPercent}% off)
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Availability",
      render: (l) => {
        const isAvail = l.availability === "Available";
        const isUnavail = l.availability === "Unavailable";
        return (
          <Badge variant={isAvail ? "sage" : isUnavail ? "clay" : "default"}>
            {l.availability}
          </Badge>
        );
      },
    },
    {
      header: "Volume",
      render: (l) => (
        <span className="font-mono text-xs text-foreground-muted">
          {l.quantity} {l.unit}
        </span>
      ),
    },
    {
      header: "Last Verified",
      render: (l) => (
        <span className="font-mono text-[0.75rem] text-foreground-muted flex items-center gap-1">
          <Clock className="h-3 w-3 text-foreground-faint" />
          {l.lastUpdated}
        </span>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      render: (l) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs px-2 text-sage-deep hover:text-sage-deep"
            onClick={() => handleOpenPriceModal(l)}
            title="Quick Price & Availability Update"
          >
            ₹ / Stock
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => handleOpenEdit(l)}
            leftIcon={<Edit2 className="h-3 w-3" />}
          >
            Edit
          </Button>

          {l.productUrl && (
            <a
              href={l.productUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1 rounded text-foreground-muted hover:text-foreground"
              title="Open Source Link"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs px-2 text-clay hover:text-clay"
            onClick={() => setListingToDelete(l)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <AdminTable
        title="Product Listings & Merchant Pricing"
        description="Individual marketplace offerings separate from core product catalog. Track live prices, discounts, stock availability, and source URLs."
        searchPlaceholder="Search listings by platform, seller, or product ID..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={[
          {
            key: "platform",
            label: "Platform",
            value: platformFilter,
            onChange: setPlatformFilter,
            options: [
              { label: "All Platforms", value: "all" },
              { label: "Nykaa", value: "Nykaa" },
              { label: "Amazon", value: "Amazon India" },
              { label: "Flipkart", value: "Flipkart" },
              { label: "Brand Store", value: "Brand Store" },
              { label: "Maccaron", value: "Maccaron" },
            ],
          },
          {
            key: "availability",
            label: "Availability",
            value: availFilter,
            onChange: setAvailFilter,
            options: [
              { label: "All Availability", value: "all" },
              { label: "Available", value: "Available" },
              { label: "Unavailable", value: "Unavailable" },
              { label: "Limited Information", value: "Limited Information" },
            ],
          },
        ]}
        actions={
          <Button variant="clay" size="sm" onClick={handleOpenCreate} leftIcon={<Plus className="h-4 w-4" />}>
            Add Listing
          </Button>
        }
        columns={columns}
        data={listings}
        keyExtractor={(l) => l.id}
        loading={loading}
      />

      {/* QUICK PRICE & AVAILABILITY MODAL */}
      {editingPriceListing && (
        <Modal
          open={!!editingPriceListing}
          onClose={() => setEditingPriceListing(null)}
          title="Quick Price & Stock Update"
        >
          <form onSubmit={handleSavePriceModal} className="space-y-4 max-w-sm">
            <p className="text-xs text-foreground-muted">
              Updating listing for <strong>{editingPriceListing.platform}</strong> ({editingPriceListing.seller}).
            </p>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Current Price (₹) - Leave blank if unpriced
              </label>
              <Input
                type="number"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                placeholder="e.g. 549"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Availability Status
              </label>
              <select
                value={availInput}
                onChange={(e) => setAvailInput(e.target.value as AvailabilityStatus)}
                className="w-full bg-background rounded px-3 py-2 text-xs border border-line focus:outline-hidden focus:border-sage-deep"
              >
                <option value="Available">Available</option>
                <option value="Unavailable">Unavailable</option>
                <option value="Limited Information">Limited Information</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditingPriceListing(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="clay" size="sm" loading={savingPrice}>
                Save Price
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* FULL CREATE / EDIT LISTING MODAL */}
      {isFormOpen && (
        <Modal
          open={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          title={editingListing ? "Edit Product Listing" : "Add Marketplace Listing"}
        >
          <form onSubmit={handleSaveFullForm} className="space-y-4 max-w-md">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Catalog Product *
              </label>
              <select
                value={formProductId}
                onChange={(e) => setFormProductId(e.target.value)}
                className="w-full bg-background rounded px-3 py-2 text-xs border border-line focus:outline-hidden focus:border-sage-deep"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.brand})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Platform *</label>
                <select
                  value={formPlatform}
                  onChange={(e) => setFormPlatform(e.target.value)}
                  className="w-full bg-background rounded px-3 py-2 text-xs border border-line focus:outline-hidden focus:border-sage-deep"
                >
                  {platforms.map((plat) => (
                    <option key={plat.id} value={plat.name}>
                      {plat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Seller Name *</label>
                <Input
                  value={formSeller}
                  onChange={(e) => setFormSeller(e.target.value)}
                  placeholder="e.g. Nykaa Retail"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Active Price (₹)</label>
                <Input
                  type="number"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="e.g. 549"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Original Price (₹)</label>
                <Input
                  type="number"
                  value={formOrigPrice}
                  onChange={(e) => setFormOrigPrice(e.target.value)}
                  placeholder="e.g. 600"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1">
                <label className="text-xs font-semibold text-foreground block mb-1">Quantity</label>
                <Input
                  type="number"
                  value={formQuantity}
                  onChange={(e) => setFormQuantity(Number(e.target.value))}
                />
              </div>
              <div className="col-span-1">
                <label className="text-xs font-semibold text-foreground block mb-1">Unit</label>
                <select
                  value={formUnit}
                  onChange={(e) => setFormUnit(e.target.value as any)}
                  className="w-full bg-background rounded px-3 py-2 text-xs border border-line focus:outline-hidden focus:border-sage-deep"
                >
                  <option value="ml">ml</option>
                  <option value="g">g</option>
                </select>
              </div>
              <div className="col-span-1">
                <label className="text-xs font-semibold text-foreground block mb-1">Stock</label>
                <select
                  value={formAvail}
                  onChange={(e) => setFormAvail(e.target.value as AvailabilityStatus)}
                  className="w-full bg-background rounded px-2 py-2 text-xs border border-line focus:outline-hidden focus:border-sage-deep"
                >
                  <option value="Available">Available</option>
                  <option value="Unavailable">Unavailable</option>
                  <option value="Limited Information">Limited</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Source Store URL</label>
              <Input
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="clay" size="sm" loading={savingForm}>
                {editingListing ? "Save Listing" : "Create Listing"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* DELETE MODAL */}
      <AdminConfirmModal
        open={!!listingToDelete}
        onClose={() => setListingToDelete(null)}
        onConfirm={handleDeleteListing}
        title="Delete Marketplace Listing"
        description="Are you sure you want to remove this listing? Price comparisons will no longer include this platform source."
        confirmLabel="Delete Listing"
        confirmVariant="clay"
        loading={deleteLoading}
      />
    </div>
  );
}
