"use client";

import * as React from "react";
import Image from "next/image";
import { AdminDataService } from "@/services/admin-data.service";
import type { Category, RoutineStep } from "@/types";
import { AdminTable, Column } from "@/components/admin/admin-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/context/toast-context";
import { FolderTree, Plus, Edit2, ToggleLeft, ToggleRight } from "lucide-react";

export default function AdminCategoriesPage() {
  const { addToast } = useToast();
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);
  const [formName, setFormName] = React.useState<string>("");
  const [formDescription, setFormDescription] = React.useState<string>("");
  const [formImage, setFormImage] = React.useState<string>("");
  const [saving, setSaving] = React.useState(false);

  const loadCategories = React.useCallback(() => {
    setLoading(true);
    AdminDataService.getCategories().then((data) => {
      setCategories(data);
      setLoading(false);
    });
  }, []);

  React.useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormName("");
    setFormDescription("");
    setFormImage(
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop"
    );
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Category) => {
    setEditingCategory(c);
    setFormName(c.name);
    setFormDescription(c.description || "");
    setFormImage(c.image);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      addToast({ type: "error", title: "Missing Name", description: "Category name is required." });
      return;
    }

    setSaving(true);
    if (editingCategory) {
      await AdminDataService.updateCategory(editingCategory.id, {
        name: formName as RoutineStep,
        description: formDescription,
        image: formImage,
      });
      addToast({ type: "success", title: "Category Updated", description: `${formName} was updated.` });
    } else {
      await AdminDataService.createCategory({
        name: formName as RoutineStep,
        description: formDescription,
        image: formImage,
      });
      addToast({ type: "success", title: "Category Added", description: `${formName} was registered.` });
    }

    setSaving(false);
    setIsModalOpen(false);
    loadCategories();
  };

  const handleToggleStatus = async (id: string) => {
    const updated = await AdminDataService.toggleCategoryStatus(id);
    if (updated) {
      loadCategories();
      addToast({
        type: "info",
        title: "Category Toggled",
        description: `${updated.name} status is now ${updated.status}.`,
      });
    }
  };

  const columns: Column<Category>[] = [
    {
      header: "Category",
      render: (c) => (
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 rounded overflow-hidden border border-line bg-background-elevated">
            <Image src={c.image} alt={c.name} fill className="object-cover" />
          </div>
          <div>
            <span className="font-semibold text-foreground block">{c.name}</span>
            <span className="text-foreground-muted text-[0.7rem] line-clamp-1">
              {c.description || "Skincare routine step"}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Catalog Products",
      render: (c) => (
        <span className="font-mono text-xs font-semibold text-foreground">
          {c.productCount} products
        </span>
      ),
    },
    {
      header: "Status",
      render: (c) => (
        <Badge variant={c.status === "inactive" ? "default" : "sage"}>
          {(c.status || "active").toUpperCase()}
        </Badge>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      render: (c) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => handleToggleStatus(c.id)}
            title="Toggle Status"
          >
            {c.status === "inactive" ? (
              <ToggleLeft className="h-4 w-4 text-foreground-faint" />
            ) : (
              <ToggleRight className="h-4 w-4 text-sage-deep" />
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => handleOpenEdit(c)}
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
        title="Skincare Routine Categories"
        description="Standardized skincare categories across BeautyIQ recommendation algorithms, filters, and catalog listings."
        actions={
          <Button variant="clay" size="sm" onClick={handleOpenCreate} leftIcon={<Plus className="h-4 w-4" />}>
            Add Category
          </Button>
        }
        columns={columns}
        data={categories}
        keyExtractor={(c) => c.id}
        loading={loading}
      />

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingCategory ? "Edit Category" : "Add Routine Category"}
        >
          <form onSubmit={handleSave} className="space-y-4 max-w-md">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Category Name *
              </label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Eye Care, Face Wash"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Description
              </label>
              <Input
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Purpose in skincare routine..."
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Cover Image URL
              </label>
              <Input
                value={formImage}
                onChange={(e) => setFormImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="clay" size="sm" loading={saving}>
                {editingCategory ? "Save Changes" : "Create Category"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
