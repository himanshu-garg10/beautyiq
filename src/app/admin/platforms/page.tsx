"use client";

import * as React from "react";
import { AdminDataService } from "@/services/admin-data.service";
import type { Platform } from "@/types";
import { AdminTable, Column } from "@/components/admin/admin-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/context/toast-context";
import { Globe, Plus, Edit2, ExternalLink, ToggleLeft, ToggleRight } from "lucide-react";

export default function AdminPlatformsPage() {
  const { addToast } = useToast();
  const [platforms, setPlatforms] = React.useState<Platform[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingPlatform, setEditingPlatform] = React.useState<Platform | null>(null);
  const [formName, setFormName] = React.useState("");
  const [formBaseUrl, setFormBaseUrl] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const loadPlatforms = React.useCallback(() => {
    setLoading(true);
    AdminDataService.getPlatforms().then((data) => {
      setPlatforms(data);
      setLoading(false);
    });
  }, []);

  React.useEffect(() => {
    loadPlatforms();
  }, [loadPlatforms]);

  const handleOpenCreate = () => {
    setEditingPlatform(null);
    setFormName("");
    setFormBaseUrl("https://");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Platform) => {
    setEditingPlatform(p);
    setFormName(p.name);
    setFormBaseUrl(p.baseUrl);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formBaseUrl.trim()) {
      addToast({ type: "error", title: "Missing Fields", description: "Name and base URL required." });
      return;
    }

    setSaving(true);
    if (editingPlatform) {
      await AdminDataService.updatePlatform(editingPlatform.id, {
        name: formName.trim(),
        baseUrl: formBaseUrl.trim(),
      });
      addToast({ type: "success", title: "Platform Updated", description: `${formName} updated.` });
    } else {
      await AdminDataService.createPlatform({
        name: formName.trim(),
        baseUrl: formBaseUrl.trim(),
      });
      addToast({ type: "success", title: "Platform Created", description: `${formName} added.` });
    }

    setSaving(false);
    setIsModalOpen(false);
    loadPlatforms();
  };

  const handleToggleStatus = async (id: string) => {
    const updated = await AdminDataService.togglePlatformStatus(id);
    if (updated) {
      loadPlatforms();
      addToast({
        type: "info",
        title: "Platform Status Toggled",
        description: `${updated.name} status is now ${updated.status}.`,
      });
    }
  };

  const columns: Column<Platform>[] = [
    {
      header: "Platform",
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-600 font-bold text-xs">
            <Globe className="h-4 w-4" />
          </div>
          <div>
            <span className="font-semibold text-foreground block">{p.name}</span>
            <a
              href={p.baseUrl}
              target="_blank"
              rel="noreferrer"
              className="text-foreground-muted text-[0.7rem] hover:underline flex items-center gap-1"
            >
              {p.baseUrl} <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </div>
      ),
    },
    {
      header: "Tracked Listings",
      render: (p) => (
        <span className="font-mono text-xs font-semibold text-foreground">
          {p.listingCount || 0} listings
        </span>
      ),
    },
    {
      header: "Status",
      render: (p) => (
        <Badge variant={p.status === "inactive" ? "default" : "sage"}>
          {(p.status || "active").toUpperCase()}
        </Badge>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      render: (p) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => handleToggleStatus(p.id)}
            title="Toggle Status"
          >
            {p.status === "inactive" ? (
              <ToggleLeft className="h-4 w-4 text-foreground-faint" />
            ) : (
              <ToggleRight className="h-4 w-4 text-sage-deep" />
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
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <AdminTable
        title="Marketplace Platforms"
        description="External commerce channels and brand web stores providing product listings, verified pricing, and shipping estimates."
        actions={
          <Button variant="clay" size="sm" onClick={handleOpenCreate} leftIcon={<Plus className="h-4 w-4" />}>
            Add Platform
          </Button>
        }
        columns={columns}
        data={platforms}
        keyExtractor={(p) => p.id}
        loading={loading}
      />

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingPlatform ? "Edit Platform" : "Add Commerce Platform"}
        >
          <form onSubmit={handleSave} className="space-y-4 max-w-md">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Platform Name *
              </label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Nykaa, Amazon India"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Base Storefront URL *
              </label>
              <Input
                value={formBaseUrl}
                onChange={(e) => setFormBaseUrl(e.target.value)}
                placeholder="https://..."
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="clay" size="sm" loading={saving}>
                {editingPlatform ? "Save Changes" : "Register Platform"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
