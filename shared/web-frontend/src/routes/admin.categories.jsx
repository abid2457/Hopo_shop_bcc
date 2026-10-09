import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AdminShell, Panel } from "@/components/app/AdminShell";
import { adminApi } from "@/services/api/index";
import { ImageUploader } from "@/components/app/ImageUploader";
import { Plus, Pencil, Trash2, RefreshCw, X, Eye } from "lucide-react";
import { notifyCatalogUpdated } from "@/lib/catalog-service";
const DEFAULT_CAT_FORM = {
  name: "",
  slug: "",
  title: "",
  subtitle: "",
  eyebrow: "ATELIER COUTURE COLLECTION",
  description: "",
  image_url: "",
  status: "active",
  subs: [],
  display_order: 1,
};
export function CategoriesAdmin() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_CAT_FORM);
  const [newSubInput, setNewSubInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getCategories();
      if (res.success && res.data) {
        setCategories(res.data);
      }
    } catch (err) {
      setError(err.message || "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadCategories();
  }, []);
  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData({
      ...DEFAULT_CAT_FORM,
      display_order: categories.length + 1,
    });
    setNewSubInput("");
    setFormError(null);
    setIsModalOpen(true);
  };
  const handleOpenEdit = (c) => {
    setIsEditing(true);
    setFormData({
      id: c.id,
      name: c.name,
      slug: c.slug,
      title: c.title || c.name,
      subtitle: c.subtitle || "",
      eyebrow: c.eyebrow || "ATELIER COLLECTION",
      description: c.description || "",
      image_url: c.image_url || "",
      status: c.status === "inactive" ? "inactive" : "active",
      subs: Array.isArray(c.subs) ? [...c.subs] : [],
      display_order: Number(c.display_order) || 1,
    });
    setNewSubInput("");
    setFormError(null);
    setIsModalOpen(true);
  };
  const handleAddSub = () => {
    const trimmed = newSubInput.trim();
    if (trimmed && !formData.subs.includes(trimmed)) {
      setFormData({
        ...formData,
        subs: [...formData.subs, trimmed],
      });
      setNewSubInput("");
    }
  };
  const handleRemoveSub = (index) => {
    setFormData({
      ...formData,
      subs: formData.subs.filter((_, i) => i !== index),
    });
  };
  const handleDeleteCategory = async (c) => {
    if (
      !window.confirm(
        `Are you certain you want to delete "${c.name}"? This action cannot be undone.`,
      )
    ) {
      return;
    }
    try {
      const res = await adminApi.deleteCategory(c.id);
      if (res.success) {
        notifyCatalogUpdated();
        await loadCategories();
      } else {
        alert(res.message || "Failed to delete category.");
      }
    } catch (err) {
      alert(err.message || "Error deleting category.");
    }
  };
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (!formData.name.trim()) {
      setFormError("Category Name is required.");
      return;
    }
    setSubmitting(true);
    const slug = formData.slug.trim() || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const image_url = formData.image_url.trim() || "/images/bridal_blouse_crimson_peacock.png";
    const payload = {
      ...formData,
      slug,
      image_url,
      title: formData.title.trim() || formData.name.trim(),
      eyebrow: formData.eyebrow.trim() || "ATELIER COUTURE COLLECTION",
      display_order: Number(formData.display_order) || 1,
    };
    try {
      if (isEditing && formData.id) {
        const res = await adminApi.updateCategory(formData.id, payload);
        if (res.success) {
          notifyCatalogUpdated();
          setIsModalOpen(false);
          await loadCategories();
        } else {
          setFormError(res.message || "Failed to update category.");
        }
      } else {
        const res = await adminApi.createCategory(payload);
        if (res.success) {
          notifyCatalogUpdated();
          setIsModalOpen(false);
          await loadCategories();
        } else {
          setFormError(res.message || "Failed to create category.");
        }
      }
    } catch (err) {
      setFormError(err.message || "Error saving category to database.");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <AdminShell
      title="Categories Management"
      subtitle={`${categories.length} Taxonomy Nodes • MySQL Database Connected`}
      actions={
        <div className="flex items-center gap-3">
          <Link
            to="/categories"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#E5DCCD] bg-white px-4 py-2 text-xs font-bold text-[#0D1B2A] hover:bg-[#FAF6EE] transition shadow-xs"
          >
            <Eye className="w-3.5 h-3.5 text-[#8B1E3F]" />
            <span>View Public Storefront</span>
          </Link>
          <button
            onClick={loadCategories}
            disabled={loading}
            className="p-2 rounded-full border border-[#E5DCCD] bg-white text-[#8B1E3F] hover:bg-[#FAF6EE] transition shadow-xs"
            title="Refresh Categories"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 rounded-full bg-[#8B1E3F] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#780C28] transition shadow-md"
          >
            <Plus className="h-4 w-4" />
            <span>Add Category</span>
          </button>
        </div>
      }
    >
      {error && (
        <div className="mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
          {error}
        </div>
      )}

      <Panel title="Active Storefront Collections">
        <ul className="divide-y divide-[#E5DCCD]/60">
          {categories.map((c) => (
            <li
              key={c.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4"
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="h-14 w-14 rounded-2xl overflow-hidden bg-[#FAF6EE] border border-[#E5DCCD] shrink-0 shadow-xs">
                  <img
                    src={c.image_url || "/images/brand_logo.png"}
                    alt={c.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[#0D1B2A]">{c.name}</p>
                    <span className="text-[10px] font-mono text-[#8B1E3F] bg-[#FAF6EE] px-2 py-0.5 rounded border border-[#E5DCCD]">
                      /{c.slug}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${c.status === "active" ? "bg-[#2E7D6B]/10 text-[#2E7D6B]" : "bg-stone-200 text-stone-600"}`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B7280] mt-0.5">
                    {c.product_count} Active Ensembles • {c.subs?.length || 0} Sub-categories •
                    Order: #{c.display_order}
                  </p>
                  {c.subs && c.subs.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {c.subs.map((s, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md border border-stone-200"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <Link
                  to={`/listing?category=${encodeURIComponent(c.name)}`}
                  target="_blank"
                  className="p-2 rounded-xl hover:bg-[#FAF6EE] text-[#6B7280] hover:text-[#8B1E3F]"
                  title="View Category on Storefront"
                >
                  <Eye className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => handleOpenEdit(c)}
                  className="p-2 rounded-xl hover:bg-[#FAF6EE] text-[#8B1E3F]"
                  title="Edit Category Details"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(c)}
                  className="p-2 rounded-xl hover:bg-red-50 text-red-600"
                  title="Delete Category"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      {/* CREATE / EDIT CATEGORY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-[#E5DCCD] shadow-2xl p-6 md:p-8 my-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5DCCD] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B1E3F]">
                  TAXONOMY STUDIO
                </span>
                <h2 className="font-display text-xl font-bold text-[#0D1B2A]">
                  {isEditing ? `Edit Category: ${formData.name}` : "Create New Category"}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-stone-100 text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              {/* Category Cover Image Upload */}
              <div className="p-4 bg-[#FFFDF9] border border-[#E8DCC4] rounded-2xl">
                <ImageUploader
                  images={formData.image_url ? [formData.image_url] : []}
                  onChange={(imgs) => setFormData({ ...formData, image_url: imgs[0] || "" })}
                  multiple={false}
                  label="Category Cover Imagery *"
                  helperText="High-resolution hero imagery showcasing the collection aesthetic."
                />
              </div>

              {/* Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#0D1B2A] mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData({
                        ...formData,
                        name,
                        slug: isEditing
                          ? formData.slug
                          : name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                        title: isEditing ? formData.title : name,
                      });
                    }}
                    placeholder="e.g. Bridal Blouses"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DCCD] bg-[#FAF8F5] focus:outline-none focus:border-[#8B1E3F]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#0D1B2A] mb-1">URL Slug *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. bridal-blouses"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DCCD] bg-[#FAF8F5] focus:outline-none focus:border-[#8B1E3F]"
                  />
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#0D1B2A] mb-1">Display Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Handcrafted Bridal Blouses"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DCCD] bg-[#FAF8F5] focus:outline-none focus:border-[#8B1E3F]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#0D1B2A] mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="e.g. Pure raw silk, zardozi gold bullion"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DCCD] bg-[#FAF8F5] focus:outline-none focus:border-[#8B1E3F]"
                  />
                </div>
              </div>

              {/* Eyebrow & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-[#0D1B2A] mb-1">Eyebrow Badge</label>
                  <input
                    type="text"
                    value={formData.eyebrow}
                    onChange={(e) => setFormData({ ...formData, eyebrow: e.target.value })}
                    placeholder="e.g. COUTURE BLOUSE ATELIER"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DCCD] bg-[#FAF8F5] focus:outline-none focus:border-[#8B1E3F]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#0D1B2A] mb-1">Display Order</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.display_order}
                    onChange={(e) =>
                      setFormData({ ...formData, display_order: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DCCD] bg-[#FAF8F5] focus:outline-none focus:border-[#8B1E3F]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#0D1B2A] mb-1">Editorial Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Exquisite couture bridal blouses tailored to perfection..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DCCD] bg-[#FAF8F5] focus:outline-none focus:border-[#8B1E3F]"
                />
              </div>

              {/* Subcategories Management */}
              <div>
                <label className="block font-bold text-[#0D1B2A] mb-1">Curated Subcategories</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newSubInput}
                    onChange={(e) => setNewSubInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSub();
                      }
                    }}
                    placeholder="Add subcategory tag (e.g. Velvet Bridal Blouses)"
                    className="flex-1 px-3.5 py-2 rounded-xl border border-[#E5DCCD] bg-[#FAF8F5] focus:outline-none focus:border-[#8B1E3F]"
                  />
                  <button
                    type="button"
                    onClick={handleAddSub}
                    className="px-4 py-2 bg-stone-800 text-white rounded-xl font-bold hover:bg-black"
                  >
                    Add Tag
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {formData.subs.map((sub, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF6EE] border border-[#E5DCCD] text-[#0D1B2A] font-bold rounded-full"
                    >
                      <span>{sub}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSub(idx)}
                        className="text-stone-400 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block font-bold text-[#0D1B2A] mb-1">Storefront Visibility</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DCCD] bg-[#FAF8F5] focus:outline-none focus:border-[#8B1E3F]"
                >
                  <option value="active">Active (Visible on Header, Categories & Filters)</option>
                  <option value="inactive">Inactive (Hidden from Customers)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5DCCD]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-[#E5DCCD] text-stone-700 font-bold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-full bg-[#8B1E3F] text-white font-bold uppercase tracking-wider hover:bg-[#780C28] transition shadow-md disabled:opacity-50"
                >
                  {submitting
                    ? "Saving Category..."
                    : isEditing
                      ? "Update Category"
                      : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
export default CategoriesAdmin;
