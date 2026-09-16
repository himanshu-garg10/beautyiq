"use client";

import * as React from "react";
import { AdminDataService } from "@/services/admin-data.service";
import type { Ingredient, IngredientCategory } from "@/types";
import { AdminTable, Column } from "@/components/admin/admin-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/context/toast-context";
import { FlaskConical, Plus, Edit2, ShieldAlert, ToggleLeft, ToggleRight } from "lucide-react";

export default function AdminIngredientsPage() {
  const { addToast } = useToast();
  const [ingredients, setIngredients] = React.useState<Ingredient[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingIng, setEditingIng] = React.useState<Ingredient | null>(null);

  // Form Fields
  const [formName, setFormName] = React.useState("");
  const [formCategory, setFormCategory] = React.useState<IngredientCategory>("Active ingredient");
  const [formFunction, setFormFunction] = React.useState("");
  const [formDescription, setFormDescription] = React.useState("");
  const [formSynonyms, setFormSynonyms] = React.useState("");
  const [formConcentration, setFormConcentration] = React.useState("1–5%");
  const [formComedogenic, setFormComedogenic] = React.useState(0);
  const [formSafety, setFormSafety] = React.useState<"Low Hazard" | "Moderate Hazard" | "High Hazard">("Low Hazard");
  const [saving, setSaving] = React.useState(false);

  const loadIngredients = React.useCallback(() => {
    setLoading(true);
    AdminDataService.getIngredients({
      search,
      category: categoryFilter,
    }).then((data) => {
      setIngredients(data);
      setLoading(false);
    });
  }, [search, categoryFilter]);

  React.useEffect(() => {
    loadIngredients();
  }, [loadIngredients]);

  const handleOpenCreate = () => {
    setEditingIng(null);
    setFormName("");
    setFormCategory("Active ingredient");
    setFormFunction("");
    setFormDescription("");
    setFormSynonyms("");
    setFormConcentration("1–5%");
    setFormComedogenic(0);
    setFormSafety("Low Hazard");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ing: Ingredient) => {
    setEditingIng(ing);
    setFormName(ing.name);
    setFormCategory(ing.category);
    setFormFunction(ing.function);
    setFormDescription(ing.description);
    setFormSynonyms((ing.synonyms || []).concat(ing.commonNames || []).join(", "));
    setFormConcentration(ing.concentration || "1–5%");
    setFormComedogenic(ing.comedogenicRating ?? 0);
    setFormSafety(ing.safetyRating || "Low Hazard");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      addToast({ type: "error", title: "Missing Name", description: "Ingredient name is required." });
      return;
    }

    if (AdminDataService.checkDuplicateIngredient(formName, editingIng?.id)) {
      addToast({
        type: "error",
        title: "Duplicate Ingredient",
        description: `Ingredient "${formName.trim()}" or matching synonym already exists.`,
      });
      return;
    }

    setSaving(true);
    const parsedSynonyms = formSynonyms
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: Partial<Ingredient> = {
      name: formName.trim(),
      category: formCategory,
      function: formFunction.trim(),
      description: formDescription.trim(),
      synonyms: parsedSynonyms,
      commonNames: parsedSynonyms.slice(0, 2),
      concentration: formConcentration.trim(),
      comedogenicRating: Number(formComedogenic),
      safetyRating: formSafety,
    };

    if (editingIng) {
      await AdminDataService.updateIngredient(editingIng.id, payload);
      addToast({ type: "success", title: "Ingredient Updated", description: `${formName} saved.` });
    } else {
      await AdminDataService.createIngredient(payload);
      addToast({ type: "success", title: "Ingredient Registered", description: `${formName} added.` });
    }

    setSaving(false);
    setIsModalOpen(false);
    loadIngredients();
  };

  const handleToggleStatus = async (id: string) => {
    const updated = await AdminDataService.toggleIngredientStatus(id);
    if (updated) {
      loadIngredients();
      addToast({
        type: "info",
        title: "Ingredient Status Toggled",
        description: `${updated.name} marked as ${updated.status}.`,
      });
    }
  };

  const columns: Column<Ingredient>[] = [
    {
      header: "Ingredient",
      render: (i) => (
        <div>
          <span className="font-semibold text-foreground block">{i.name}</span>
          <span className="text-foreground-muted text-[0.7rem] line-clamp-1">
            {i.commonNames?.length ? `AKA: ${i.commonNames.join(", ")}` : i.function}
          </span>
        </div>
      ),
    },
    {
      header: "Category",
      render: (i) => <Badge variant="default">{i.category}</Badge>,
    },
    {
      header: "Concentration",
      render: (i) => <span className="font-mono text-xs">{i.concentration}</span>,
    },
    {
      header: "Safety & Comedogenic",
      render: (i) => (
        <div className="flex items-center gap-2 text-xs">
          <Badge
            variant={
              i.safetyRating === "Low Hazard"
                ? "sage"
                : i.safetyRating === "Moderate Hazard"
                ? "default"
                : "clay"
            }
          >
            {i.safetyRating}
          </Badge>
          <span className="font-mono text-[0.75rem] text-foreground-muted">
            Acne: {i.comedogenicRating}/5
          </span>
        </div>
      ),
    },
    {
      header: "Status",
      render: (i) => (
        <Badge variant={i.status === "inactive" ? "default" : "sage"}>
          {(i.status || "active").toUpperCase()}
        </Badge>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      render: (i) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => handleToggleStatus(i.id)}
            title="Toggle Status"
          >
            {i.status === "inactive" ? (
              <ToggleLeft className="h-4 w-4 text-foreground-faint" />
            ) : (
              <ToggleRight className="h-4 w-4 text-sage-deep" />
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => handleOpenEdit(i)}
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
        title="Active Ingredients & Scientific Nomenclature"
        description="Comprehensive dictionary of skincare compounds, biological functions, INCI synonyms, and comedogenic ratings used by recommendation algorithms."
        searchPlaceholder="Search by compound name, synonym, or function..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={[
          {
            key: "category",
            label: "Role",
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: [
              { label: "All Roles", value: "all" },
              { label: "Active ingredient", value: "Active ingredient" },
              { label: "Humectant", value: "Humectant" },
              { label: "Antioxidant", value: "Antioxidant" },
              { label: "Exfoliant", value: "Exfoliant" },
              { label: "Skin conditioning", value: "Skin conditioning" },
            ],
          },
        ]}
        actions={
          <Button variant="clay" size="sm" onClick={handleOpenCreate} leftIcon={<Plus className="h-4 w-4" />}>
            Add Ingredient
          </Button>
        }
        columns={columns}
        data={ingredients}
        keyExtractor={(i) => i.id}
        loading={loading}
      />

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingIng ? "Edit Ingredient Compound" : "Register Active Compound"}
        >
          <form onSubmit={handleSave} className="space-y-4 max-w-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Compound Name *
                </label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Niacinamide"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Ingredient Category *
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as IngredientCategory)}
                  className="w-full bg-background rounded px-3 py-2 text-xs border border-line focus:outline-hidden focus:border-sage-deep"
                >
                  <option value="Active ingredient">Active ingredient</option>
                  <option value="Humectant">Humectant</option>
                  <option value="Emollient">Emollient</option>
                  <option value="Occlusive">Occlusive</option>
                  <option value="Antioxidant">Antioxidant</option>
                  <option value="Exfoliant">Exfoliant</option>
                  <option value="Skin conditioning">Skin conditioning</option>
                  <option value="Soothing agent">Soothing agent</option>
                  <option value="Surfactant">Surfactant</option>
                  <option value="Preservative">Preservative</option>
                  <option value="Solvent">Solvent</option>
                  <option value="UV filter">UV filter</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Biological Function
              </label>
              <Input
                value={formFunction}
                onChange={(e) => setFormFunction(e.target.value)}
                placeholder="e.g. Deep pore exfoliation, anti-inflammatory"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Synonyms & Common Names (Comma separated)
              </label>
              <Input
                value={formSynonyms}
                onChange={(e) => setFormSynonyms(e.target.value)}
                placeholder="e.g. Vitamin B3, Nicotinamide"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Concentration
                </label>
                <Input
                  value={formConcentration}
                  onChange={(e) => setFormConcentration(e.target.value)}
                  placeholder="0.5–2%"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Comedogenic (0-5)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="5"
                  value={formComedogenic}
                  onChange={(e) => setFormComedogenic(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Safety Rating
                </label>
                <select
                  value={formSafety}
                  onChange={(e) => setFormSafety(e.target.value as any)}
                  className="w-full bg-background rounded px-3 py-2 text-xs border border-line focus:outline-hidden focus:border-sage-deep"
                >
                  <option value="Low Hazard">Low Hazard</option>
                  <option value="Moderate Hazard">Moderate Hazard</option>
                  <option value="High Hazard">High Hazard</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="clay" size="sm" loading={saving}>
                {editingIng ? "Save Changes" : "Create Compound"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
