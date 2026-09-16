"use client";

import * as React from "react";
import { AdminDataService } from "@/services/admin-data.service";
import type { Brand } from "@/types";
import { AdminTable, Column } from "@/components/admin/admin-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/context/toast-context";
import { Award, Plus, Edit2, Globe, ToggleLeft, ToggleRight } from "lucide-react";

export default function AdminBrandsPage() {
  const { addToast } = useToast();
  const [brands, setBrands] = React.useState<Brand[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingBrand, setEditingBrand] = React.useState<Brand | null>(null);
  const [formName, setFormName] = React.useState("");
  const [formCountry, setFormCountry] = React.useState("India");
  const [formPhilosophy, setFormPhilosophy] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const loadBrands = React.useCallback(() => {
    setLoading(true);
    AdminDataService.getBrands({ search }).then((data) => {
      setBrands(data);
      setLoading(false);
    });
  }, [search]);

  React.useEffect(() => {
    loadBrands();
  }, [loadBrands]);

  const handleOpenCreate = () => {
    setEditingBrand(null);
    setFormName("");
    setFormCountry("India");
    setFormPhilosophy("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: Brand) => {
    setEditingBrand(b);
    setFormName(b.name);
    setFormCountry(b.country);
    setFormPhilosophy(b.philosophy);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      addToast({ type: "error", title: "Missing Name", description: "Brand name is required." });
      return;
    }

    // Duplicate Check
    if (AdminDataService.checkDuplicateBrand(formName, editingBrand?.id)) {
      addToast({
        type: "error",
        title: "Duplicate Brand",
        description: `A brand named "${formName.trim()}" is already registered.`,
      });
      return;
    }

    setSaving(true);
    if (editingBrand) {
      await AdminDataService.updateBrand(editingBrand.id, {
        name: formName.trim(),
        country: formCountry.trim(),
        philosophy: formPhilosophy.trim(),
      });
      addToast({ type: "success", title: "Brand Updated", description: `${formName} was updated.` });
    } else {
      await AdminDataService.createBrand({
        name: formName.trim(),
        country: formCountry.trim(),
        philosophy: formPhilosophy.trim(),
      });
      addToast({ type: "success", title: "Brand Created", description: `${formName} registered.` });
    }

    setSaving(false);
    setIsModalOpen(false);
    loadBrands();
  };

  const handleToggleStatus = async (id: string) => {
    const updated = await AdminDataService.toggleBrandStatus(id);
    if (updated) {
      loadBrands();
      addToast({
        type: "info",
        title: "Brand Status Changed",
        description: `${updated.name} is now ${updated.status}.`,
      });
    }
  };

  const columns: Column<Brand>[] = [
    {
      header: "Brand Name",
      render: (b) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-clay-tint text-clay font-bold text-xs">
            <Award className="h-4 w-4" />
          </div>
          <div>
            <span className="font-semibold text-foreground block">{b.name}</span>
            <span className="text-foreground-muted text-[0.7rem] line-clamp-1">
              {b.philosophy}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Origin",
      render: (b) => (
        <div className="flex items-center gap-1.5 text-xs text-foreground-muted">
          <Globe className="h-3.5 w-3.5 text-foreground-faint" />
          <span>{b.country}</span>
        </div>
      ),
    },
    {
      header: "Catalog Products",
      render: (b) => (
        <span className="font-mono text-xs font-semibold text-foreground">
          {b.productCount} items
        </span>
      ),
    },
    {
      header: "Status",
      render: (b) => (
        <Badge variant={b.status === "inactive" ? "default" : "sage"}>
          {(b.status || "active").toUpperCase()}
        </Badge>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      render: (b) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => handleToggleStatus(b.id)}
            title="Toggle Status"
          >
            {b.status === "inactive" ? (
              <ToggleLeft className="h-4 w-4 text-foreground-faint" />
            ) : (
              <ToggleRight className="h-4 w-4 text-sage-deep" />
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => handleOpenEdit(b)}
            leftIcon={<Edit2 className="h-3 w-3" />}
          >
            Edit
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <AdminTable
        title="Partner Skincare Brands"
        description="Administer registered skincare brands, formulation philosophies, origin countries, and duplicate safeguards."
        searchPlaceholder="Search brand by name, country, or philosophy..."
        searchValue={search}
        onSearchChange={setSearch}
        actions={
          <Button variant="clay" size="sm" onClick={handleOpenCreate} leftIcon={<Plus className="h-4 w-4" />}>
            Add Brand
          </Button>
        }
        columns={columns}
        data={brands}
        keyExtractor={(b) => b.id}
        loading={loading}
      />

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingBrand ? "Edit Brand Profile" : "Register New Brand"}
        >
          <form onSubmit={handleSave} className="space-y-4 max-w-md">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Brand Name *
              </label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Minimalist, Dot & Key"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Country of Origin
              </label>
              <Input
                value={formCountry}
                onChange={(e) => setFormCountry(e.target.value)}
                placeholder="e.g. India, South Korea, USA"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Brand Philosophy & Ethos
              </label>
              <textarea
                value={formPhilosophy}
                onChange={(e) => setFormPhilosophy(e.target.value)}
                placeholder="Short description of brand approach..."
                rows={3}
                className="w-full bg-background rounded p-2 text-xs border border-line focus:outline-hidden focus:border-sage-deep"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="clay" size="sm" loading={saving}>
                {editingBrand ? "Save Changes" : "Register Brand"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
