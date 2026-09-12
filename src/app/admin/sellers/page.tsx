"use client";

import * as React from "react";
import { AdminDataService } from "@/services/admin-data.service";
import type { Seller, Platform } from "@/types";
import { AdminTable, Column } from "@/components/admin/admin-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/context/toast-context";
import { Store, Plus, Edit2, Star, ToggleLeft, ToggleRight } from "lucide-react";

export default function AdminSellersPage() {
  const { addToast } = useToast();
  const [sellers, setSellers] = React.useState<Seller[]>([]);
  const [platforms, setPlatforms] = React.useState<Platform[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [platformFilter, setPlatformFilter] = React.useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingSeller, setEditingSeller] = React.useState<Seller | null>(null);
  const [formName, setFormName] = React.useState("");
  const [formPlatformId, setFormPlatformId] = React.useState("nykaa");
  const [formRating, setFormRating] = React.useState(4.7);
  const [saving, setSaving] = React.useState(false);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    const [sData, pData] = await Promise.all([
      AdminDataService.getSellers(platformFilter),
      AdminDataService.getPlatforms(),
    ]);
    setSellers(sData);
    setPlatforms(pData);
    setLoading(false);
  }, [platformFilter]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    setEditingSeller(null);
    setFormName("");
    setFormPlatformId(platforms[0]?.id || "nykaa");
    setFormRating(4.8);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Seller) => {
    setEditingSeller(s);
    setFormName(s.name);
    setFormPlatformId(s.platformId);
    setFormRating(s.rating || 4.5);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      addToast({ type: "error", title: "Missing Name", description: "Seller name is required." });
      return;
    }

    setSaving(true);
    if (editingSeller) {
      await AdminDataService.updateSeller(editingSeller.id, {
        name: formName.trim(),
        platformId: formPlatformId,
        rating: Number(formRating),
      });
      addToast({ type: "success", title: "Seller Updated", description: `${formName} saved.` });
    } else {
      await AdminDataService.createSeller({
        name: formName.trim(),
        platformId: formPlatformId,
        rating: Number(formRating),
      });
      addToast({ type: "success", title: "Seller Registered", description: `${formName} created.` });
    }

    setSaving(false);
    setIsModalOpen(false);
    loadData();
  };

  const handleToggleStatus = async (id: string) => {
    const updated = await AdminDataService.toggleSellerStatus(id);
    if (updated) {
      loadData();
      addToast({
        type: "info",
        title: "Seller Status Toggled",
        description: `${updated.name} status is now ${updated.status}.`,
      });
    }
  };

  const columns: Column<Seller>[] = [
    {
      header: "Seller Entity",
      render: (s) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 font-bold text-xs">
            <Store className="h-4 w-4" />
          </div>
          <div>
            <span className="font-semibold text-foreground block">{s.name}</span>
            <span className="text-foreground-muted text-[0.7rem] uppercase font-mono">
              ID: {s.id}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Associated Platform",
      render: (s) => {
        const plat = platforms.find((p) => p.id === s.platformId);
        return <Badge variant="default">{plat ? plat.name : s.platformId}</Badge>;
      },
    },
    {
      header: "Merchant Rating",
      render: (s) => (
        <div className="flex items-center gap-1 text-xs">
          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
          <span className="font-mono font-semibold text-foreground">
            {s.rating ? s.rating.toFixed(1) : "N/A"}
          </span>
        </div>
      ),
    },
    {
      header: "Status",
      render: (s) => (
        <Badge variant={s.status === "inactive" ? "default" : "sage"}>
          {(s.status || "active").toUpperCase()}
        </Badge>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      render: (s) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => handleToggleStatus(s.id)}
            title="Toggle Status"
          >
            {s.status === "inactive" ? (
              <ToggleLeft className="h-4 w-4 text-foreground-faint" />
            ) : (
              <ToggleRight className="h-4 w-4 text-sage-deep" />
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => handleOpenEdit(s)}
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
        title="Marketplace Merchant & Seller Entities"
        description="Administer verified retailers and brand official stores mapped directly to external marketplace platforms."
        filters={[
          {
            key: "platform",
            label: "Platform",
            value: platformFilter,
            onChange: setPlatformFilter,
            options: [
              { label: "All Platforms", value: "all" },
              ...platforms.map((p) => ({ label: p.name, value: p.id })),
            ],
          },
        ]}
        actions={
          <Button variant="clay" size="sm" onClick={handleOpenCreate} leftIcon={<Plus className="h-4 w-4" />}>
            Add Seller
          </Button>
        }
        columns={columns}
        data={sellers}
        keyExtractor={(s) => s.id}
        loading={loading}
      />

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingSeller ? "Edit Seller Entity" : "Register Merchant Seller"}
        >
          <form onSubmit={handleSave} className="space-y-4 max-w-md">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Seller Name *
              </label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Nykaa Retail Pvt Ltd"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Platform Marketplace *
              </label>
              <select
                value={formPlatformId}
                onChange={(e) => setFormPlatformId(e.target.value)}
                className="w-full bg-background rounded px-3 py-2 text-xs border border-line focus:outline-hidden focus:border-sage-deep"
              >
                {platforms.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Merchant Rating (1-5)
              </label>
              <Input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={formRating}
                onChange={(e) => setFormRating(Number(e.target.value))}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="clay" size="sm" loading={saving}>
                {editingSeller ? "Save Changes" : "Register Seller"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
