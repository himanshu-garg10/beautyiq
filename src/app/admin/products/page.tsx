"use client";

import * as React from "react";
import Image from "next/image";
import { AdminDataService } from "@/services/admin-data.service";
import type { Product, RoutineStep, ProductStatus } from "@/types";
import { AdminTable, Column } from "@/components/admin/admin-table";
import { AdminConfirmModal } from "@/components/admin/admin-confirm-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/context/toast-context";
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Star,
  Image as ImageIcon,
  Layers,
  Sparkles,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

export default function AdminProductsPage() {
  const { addToast } = useToast();
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");

  // Create / Edit modal state
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);

  // Form Fields
  const [formName, setFormName] = React.useState("");
  const [formBrand, setFormBrand] = React.useState("");
  const [formCategory, setFormCategory] = React.useState<RoutineStep>("Serum");
  const [formDescription, setFormDescription] = React.useState("");
  const [formQuantity, setFormQuantity] = React.useState(50);
  const [formUnit, setFormUnit] = React.useState<"ml" | "g">("ml");
  const [formIngredients, setFormIngredients] = React.useState("");
  const [formImages, setFormImages] = React.useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = React.useState("");
  const [primaryImage, setPrimaryImage] = React.useState("");
  const [formRating, setFormRating] = React.useState<string>("4.5");
  const [formReviewCount, setFormReviewCount] = React.useState<number>(10);
  const [formDataConfidence, setFormDataConfidence] = React.useState<number>(90);
  const [formStatus, setFormStatus] = React.useState<ProductStatus>("Complete");
  const [saving, setSaving] = React.useState(false);

  // Delete modal state
  const [productToDelete, setProductToDelete] = React.useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  const loadProducts = React.useCallback(() => {
    setLoading(true);
    AdminDataService.getProducts({
      search,
      category: categoryFilter,
      status: statusFilter,
    }).then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, [search, categoryFilter, statusFilter]);

  React.useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Open Form for Create
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormName("");
    setFormBrand("");
    setFormCategory("Serum");
    setFormDescription("");
    setFormQuantity(50);
    setFormUnit("ml");
    setFormIngredients("");
    setFormImages([
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=700&auto=format&fit=crop",
    ]);
    setPrimaryImage(
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=700&auto=format&fit=crop"
    );
    setFormRating("4.5");
    setFormReviewCount(12);
    setFormDataConfidence(90);
    setFormStatus("Complete");
    setIsFormOpen(true);
  };

  // Open Form for Edit
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormBrand(p.brand);
    setFormCategory(p.category);
    setFormDescription(p.description || "");
    setFormQuantity(p.quantity || 50);
    setFormUnit((p.unit as any) || "ml");
    setFormIngredients((p.keyIngredients || []).join(", "));
    setFormImages(p.images?.length ? p.images : [p.image]);
    setPrimaryImage(p.image || p.images?.[0] || "");
    setFormRating(p.rating !== null ? String(p.rating) : "");
    setFormReviewCount(p.reviewCount || 0);
    setFormDataConfidence(p.dataConfidence || 85);
    setFormStatus(p.productStatus || "Complete");
    setIsFormOpen(true);
  };

  // Add Image URL
  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    const url = newImageUrl.trim();
    const updated = [...formImages, url];
    setFormImages(updated);
    if (!primaryImage) setPrimaryImage(url);
    setNewImageUrl("");
  };

  // Remove Image URL
  const handleRemoveImage = (indexToRemove: number) => {
    const updated = formImages.filter((_, idx) => idx !== indexToRemove);
    setFormImages(updated);
    if (primaryImage === formImages[indexToRemove]) {
      setPrimaryImage(updated[0] || "");
    }
  };

  // Save Product (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formBrand.trim()) {
      addToast({ type: "error", title: "Missing Fields", description: "Product name and brand are required." });
      return;
    }

    setSaving(true);
    const parsedIngredients = formIngredients
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean);

    const parsedRating = formRating.trim() !== "" ? parseFloat(formRating) : null;

    const payload: Partial<Product> = {
      name: formName.trim(),
      brand: formBrand.trim(),
      category: formCategory,
      description: formDescription.trim(),
      quantity: Number(formQuantity),
      unit: formUnit,
      keyIngredients: parsedIngredients,
      allIngredients: parsedIngredients,
      images: formImages.length ? formImages : [primaryImage],
      image: primaryImage || formImages[0] || "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=700&auto=format&fit=crop",
      rating: parsedRating,
      reviewCount: Number(formReviewCount),
      dataConfidence: Number(formDataConfidence),
      productStatus: formStatus,
    };

    if (editingProduct) {
      await AdminDataService.updateProduct(editingProduct.id, payload);
      addToast({ type: "success", title: "Product Updated", description: `${formName} was saved.` });
    } else {
      await AdminDataService.createProduct(payload);
      addToast({ type: "success", title: "Product Created", description: `${formName} was added to catalog.` });
    }

    setSaving(false);
    setIsFormOpen(false);
    loadProducts();
  };

  // Toggle Status
  const handleToggleStatus = async (id: string) => {
    const updated = await AdminDataService.toggleProductStatus(id);
    if (updated) {
      loadProducts();
      addToast({
        type: "info",
        title: "Status Toggled",
        description: `${updated.name} marked as ${updated.productStatus}.`,
      });
    }
  };

  // Delete Product
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    setDeleteLoading(true);
    await AdminDataService.deleteProduct(productToDelete.id);
    setDeleteLoading(false);
    setProductToDelete(null);
    loadProducts();
    addToast({ type: "success", title: "Product Removed", description: "Product deleted from catalog." });
  };

  const columns: Column<Product>[] = [
    {
      header: "Product",
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 rounded overflow-hidden border border-line bg-background-elevated">
            <Image
              src={p.image || "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=200&auto=format&fit=crop"}
              alt={p.name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <span className="font-semibold text-foreground block line-clamp-1">{p.name}</span>
            <span className="text-foreground-muted text-[0.75rem]">{p.brand}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Category",
      render: (p) => <Badge variant="default">{p.category}</Badge>,
    },
    {
      header: "Volume",
      render: (p) => (
        <span className="font-mono text-foreground-muted text-xs">
          {p.quantity} {p.unit}
        </span>
      ),
    },
    {
      header: "Status",
      render: (p) => (
        <Badge variant={p.productStatus === "Complete" ? "sage" : "clay"}>
          {p.productStatus}
        </Badge>
      ),
    },
    {
      header: "Rating",
      render: (p) => (
        <div className="flex items-center gap-1 text-xs">
          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
          <span className="font-mono font-semibold text-foreground">
            {p.rating !== null ? p.rating.toFixed(1) : "N/A"}
          </span>
          <span className="text-foreground-faint text-[0.7rem]">({p.reviewCount})</span>
        </div>
      ),
    },
    {
      header: "Confidence",
      render: (p) => (
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-12 bg-background-elevated rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${p.dataConfidence >= 85 ? "bg-status-success" : "bg-status-warning"}`}
              style={{ width: `${p.dataConfidence}%` }}
            />
          </div>
          <span className="font-mono text-[0.7rem] text-foreground-muted">
            {p.dataConfidence}%
          </span>
        </div>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      render: (p) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => handleToggleStatus(p.id)}
            title="Toggle Status (Complete / Incomplete)"
          >
            {p.productStatus === "Complete" ? (
              <ToggleRight className="h-4 w-4 text-sage-deep" />
            ) : (
              <ToggleLeft className="h-4 w-4 text-foreground-faint" />
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => handleOpenEdit(p)}
            leftIcon={<Edit2 className="h-3 w-3" />}
          >
            Edit
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs px-2 text-clay hover:text-clay"
            onClick={() => setProductToDelete(p)}
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
        title="Product Catalog Management"
        description="Master skincare product entities separate from marketplace price listings. Manage metadata, formulation ingredients, and image assets."
        searchPlaceholder="Search products by title, brand, or ingredients..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={[
          {
            key: "category",
            label: "Category",
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: [
              { label: "All Categories", value: "all" },
              { label: "Face Wash", value: "Face Wash" },
              { label: "Cleanser", value: "Cleanser" },
              { label: "Serum", value: "Serum" },
              { label: "Moisturizer", value: "Moisturizer" },
              { label: "Sunscreen", value: "Sunscreen" },
              { label: "Toner", value: "Toner" },
              { label: "Exfoliator", value: "Exfoliator" },
            ],
          },
          {
            key: "status",
            label: "Data Status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: "All Statuses", value: "all" },
              { label: "Complete", value: "Complete" },
              { label: "Incomplete", value: "Incomplete" },
            ],
          },
        ]}
        actions={
          <Button variant="clay" size="sm" onClick={handleOpenCreate} leftIcon={<Plus className="h-4 w-4" />}>
            Add New Product
          </Button>
        }
        columns={columns}
        data={products}
        keyExtractor={(p) => p.id}
        loading={loading}
        emptyTitle="No catalog products found"
        emptyDescription="Create a new skincare product or adjust search filters."
      />

      {/* CREATE / EDIT PRODUCT MODAL */}
      {isFormOpen && (
        <Modal
          open={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          title={editingProduct ? "Edit Catalog Product" : "Add New Skincare Product"}
        >
          <form onSubmit={handleSaveProduct} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Product Name *
                </label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. 10% Niacinamide Face Serum"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Brand Name *
                </label>
                <Input
                  value={formBrand}
                  onChange={(e) => setFormBrand(e.target.value)}
                  placeholder="e.g. Minimalist"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Skincare Category *
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as RoutineStep)}
                  className="w-full bg-background rounded px-3 py-2 text-xs border border-line focus:outline-hidden focus:border-sage-deep"
                >
                  <option value="Face Wash">Face Wash</option>
                  <option value="Cleanser">Cleanser</option>
                  <option value="Serum">Serum</option>
                  <option value="Moisturizer">Moisturizer</option>
                  <option value="Sunscreen">Sunscreen</option>
                  <option value="Toner">Toner</option>
                  <option value="Exfoliator">Exfoliator</option>
                  <option value="Acne Focused Products">Acne Focused Products</option>
                  <option value="Face Masks">Face Masks</option>
                  <option value="Lip Care">Lip Care</option>
                  <option value="Eye Care">Eye Care</option>
                  <option value="Treatment Products">Treatment Products</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Volume Quantity
                  </label>
                  <Input
                    type="number"
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(Number(e.target.value))}
                    min={1}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Unit</label>
                  <select
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value as any)}
                    className="w-full bg-background rounded px-3 py-2 text-xs border border-line focus:outline-hidden focus:border-sage-deep"
                  >
                    <option value="ml">ml</option>
                    <option value="g">g</option>
                    <option value="pcs">pcs</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Description & Summary
              </label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Product description and formulation highlights..."
                rows={2}
                className="w-full bg-background rounded p-2 text-xs border border-line focus:outline-hidden focus:border-sage-deep"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Active & Key Ingredients (Comma separated)
              </label>
              <Input
                value={formIngredients}
                onChange={(e) => setFormIngredients(e.target.value)}
                placeholder="e.g. Niacinamide, Zinc PCA, Hyaluronic Acid"
              />
            </div>

            {/* Product Image Asset Manager */}
            <div className="space-y-2 rounded-lg border border-line p-3 bg-background-elevated/30">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5 text-sage-deep" /> Image Gallery & Primary Cover
              </span>

              <div className="flex gap-2">
                <Input
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="text-xs"
                />
                <Button type="button" variant="outline" size="sm" onClick={handleAddImage}>
                  Add Image
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {formImages.map((img, idx) => (
                  <div
                    key={idx}
                    className={`relative group rounded border p-1 ${
                      primaryImage === img ? "border-sage-deep ring-2 ring-sage-deep/30" : "border-line"
                    }`}
                  >
                    <div className="relative h-14 w-14 rounded overflow-hidden bg-background">
                      <Image src={img} alt="Thumb" fill className="object-cover" />
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[0.65rem]">
                      <button
                        type="button"
                        onClick={() => setPrimaryImage(img)}
                        className={`font-semibold ${primaryImage === img ? "text-sage-deep" : "text-foreground-muted hover:underline"}`}
                      >
                        {primaryImage === img ? "Cover ✓" : "Set Cover"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="text-clay hover:underline ml-1"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Customer Rating (or blank for N/A)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={formRating}
                  onChange={(e) => setFormRating(e.target.value)}
                  placeholder="e.g. 4.5"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Data Confidence %
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formDataConfidence}
                  onChange={(e) => setFormDataConfidence(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as ProductStatus)}
                  className="w-full bg-background rounded px-3 py-2 text-xs border border-line focus:outline-hidden focus:border-sage-deep"
                >
                  <option value="Complete">Complete</option>
                  <option value="Incomplete">Incomplete</option>
                  <option value="Outdated">Outdated</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="clay" size="sm" loading={saving}>
                {editingProduct ? "Save Changes" : "Create Product"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <AdminConfirmModal
        open={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleDeleteProduct}
        title="Delete Product from Catalog"
        description={`Are you sure you want to delete "${productToDelete?.name}"? This action removes the master product entity and cannot be undone.`}
        confirmLabel="Delete Product"
        confirmVariant="clay"
        loading={deleteLoading}
      />
    </div>
  );
}
