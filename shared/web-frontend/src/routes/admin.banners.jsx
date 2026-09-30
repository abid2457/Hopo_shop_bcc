import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AdminShell, Panel } from "@/components/app/AdminShell";
import { adminApi } from "@/services/api/index";
import { ImageUploader } from "@/components/app/ImageUploader";
import { Plus, Image as ImageIcon, Pencil, Trash2, RefreshCw, X, Eye } from "lucide-react";
const DEFAULT_FORM = {
  title: "",
  subtitle: "",
  slot: "home_hero_1",
  placement: "Home",
  image_url: "",
  link_url: "/category/bridal-blouses",
  cta_text: "Explore Collection",
  display_order: 1,
  is_active: 1,
  schedule_text: "Active All Season",
};
export function BannersAdmin() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const loadBanners = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getBanners();
      if (res.success && res.data) {
        setBanners(res.data);
      }
    } catch (err) {
      setError(err.message || "Failed to load banners.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadBanners();
  }, []);
  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData({
      ...DEFAULT_FORM,
      display_order: banners.length + 1,
    });
    setFormError(null);
    setIsModalOpen(true);
  };
  const handleOpenEdit = (b) => {
    setIsEditing(true);
    setFormData({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle || "",
      slot: b.slot || "home_hero_1",
      placement: b.placement || "Home",
      image_url: b.image_url || "",
      link_url: b.link_url || "",
      cta_text: b.cta_text || "Explore",
      display_order: Number(b.display_order) || 1,
      is_active: b.is_active ? 1 : 0,
      schedule_text: b.schedule_text || "Active",
    });
    setFormError(null);
    setIsModalOpen(true);
  };
  const handleDelete = async (b) => {
    if (!window.confirm(`Are you sure you wish to remove banner "${b.title}"?`)) return;
    try {
      const res = await adminApi.deleteBanner(b.id);
      if (res.success) {
        await loadBanners();
      } else {
        alert(res.message || "Failed to delete banner.");
      }
    } catch (err) {
      alert(err.message || "Error deleting banner.");
    }
  };
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (!formData.title.trim()) {
      setFormError("Banner title is required.");
      return;
    }
    if (!formData.image_url) {
      setFormError("Banner high-resolution image is required.");
      return;
    }
    setSubmitting(true);
    try {
      if (isEditing && formData.id) {
        const res = await adminApi.updateBanner(formData.id, formData);
        if (res.success) {
          setIsModalOpen(false);
          await loadBanners();
        } else {
          setFormError(res.message || "Failed to update banner.");
        }
      } else {
        const res = await adminApi.createBanner(formData);
        if (res.success) {
          setIsModalOpen(false);
          await loadBanners();
        } else {
          setFormError(res.message || "Failed to create banner.");
        }
      }
    } catch (err) {
      setFormError(err.message || "Error saving banner.");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <AdminShell
      title="Banners Management"
      subtitle={`${banners.length} Live Hero & Promotional Banners • Direct MySQL Synced`}
      actions={
        <div className="flex items-center gap-3">
          <Link
            to="/home"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#E5DCCD] bg-white px-4 py-2 text-xs font-bold text-[#0D1B2A] hover:bg-[#FAF6EE] transition shadow-xs"
          >
            <Eye className="w-3.5 h-3.5 text-[#8B1E3F]" />
            <span>Preview Storefront</span>
          </Link>
          <button
            onClick={loadBanners}
            disabled={loading}
            className="p-2 rounded-full border border-[#E5DCCD] bg-white text-[#8B1E3F] hover:bg-[#FAF6EE] transition shadow-xs"
            title="Refresh Banners"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 rounded-full bg-[#8B1E3F] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#780C28] transition shadow-md"
          >
            <Plus className="h-4 w-4" />
            <span>Create Banner</span>
          </button>
        </div>
      }
    >
      {error && (
        <div className="mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((b) => (
          <Panel
            key={b.id}
            title={b.title}
            action={
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${b.is_active ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-600"}`}
              >
                {b.is_active ? "Active & Live" : "Inactive"}
              </span>
            }
          >
            <div className="aspect-[16/9] rounded-xl overflow-hidden bg-stone-100 border border-[#E5DCCD] relative shadow-xs">
              {b.image_url ? (
                <img
                  src={b.image_url}
                  alt={b.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <div className="w-full h-full grid place-items-center text-stone-300">
                  <ImageIcon className="w-8 h-8" />
                </div>
              )}
              {b.cta_text && (
                <span className="absolute bottom-2 left-2 px-3 py-1 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold rounded-lg">
                  {b.cta_text} →
                </span>
              )}
            </div>

            {b.subtitle && <p className="mt-2 text-xs text-stone-600 line-clamp-2">{b.subtitle}</p>}

            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs border-t border-stone-100 pt-3">
              <div>
                <dt className="text-stone-400 font-semibold text-[10px] uppercase">Slot ID</dt>
                <dd className="font-mono font-bold text-[#8B1E3F] text-[11px]">{b.slot}</dd>
              </div>
              <div>
                <dt className="text-stone-400 font-semibold text-[10px] uppercase">Placement</dt>
                <dd className="font-bold text-stone-800">{b.placement}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-stone-400 font-semibold text-[10px] uppercase">Target Link</dt>
                <dd className="font-mono text-[11px] text-stone-600 truncate">
                  {b.link_url || "—"}
                </dd>
              </div>
            </dl>

            <div className="mt-4 flex items-center justify-between pt-3 border-t border-stone-100">
              <span className="text-[11px] text-stone-500 font-medium">
                Order: #{b.display_order}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(b)}
                  className="p-1.5 rounded-lg hover:bg-stone-100 text-[#8B1E3F] font-bold text-xs inline-flex items-center gap-1"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(b)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 font-bold text-xs inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </Panel>
        ))}
      </div>

      {/* CREATE / EDIT BANNER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-[#E5DCCD] shadow-2xl p-6 md:p-8 my-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5DCCD] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B1E3F]">
                  BANNER CAMPAIGNS
                </span>
                <h2 className="font-display text-lg font-bold text-[#0D1B2A]">
                  {isEditing ? "Edit Banner" : "Create Banner"}
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
              {/* Image Uploader */}
              <div className="p-4 bg-[#FFFDF9] border border-[#E8DCC4] rounded-2xl">
                <ImageUploader
                  images={formData.image_url ? [formData.image_url] : []}
                  onChange={(imgs) => setFormData({ ...formData, image_url: imgs[0] || "" })}
                  multiple={false}
                  label="Banner Visual Asset *"
                  helperText="High-res horizontal photography (recommended 1920x800 or 16:9)."
                />
              </div>

              <div>
                <label className="block font-bold text-[#0D1B2A] mb-1">Banner Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Handcrafted Bridal Blouse Atelier"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DCCD] bg-[#FAF8F5]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0D1B2A] mb-1">
                  Subtitle / Banner Copy
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="e.g. Zardozi Gold Bullion, Banarasi Brocades & Velvet Embellishments"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DCCD] bg-[#FAF8F5]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#0D1B2A] mb-1">Slot Identifier</label>
                  <select
                    value={formData.slot}
                    onChange={(e) => setFormData({ ...formData, slot: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DCCD] bg-[#FAF8F5] font-mono font-bold"
                  >
                    <option value="home_hero_1">home_hero_1 (Primary Hero)</option>
                    <option value="home_hero_2">home_hero_2 (Secondary Slide)</option>
                    <option value="home_hero_3">home_hero_3 (Tertiary Slide)</option>
                    <option value="promo_strip">promo_strip (Cart / Announcement)</option>
                    <option value="category_showcase">category_showcase (Featured Spot)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#0D1B2A] mb-1">Placement Page</label>
                  <input
                    type="text"
                    value={formData.placement}
                    onChange={(e) => setFormData({ ...formData, placement: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DCCD] bg-[#FAF8F5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#0D1B2A] mb-1">Destination Link</label>
                  <input
                    type="text"
                    value={formData.link_url}
                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                    placeholder="/category/bridal-blouses"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DCCD] bg-[#FAF8F5]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#0D1B2A] mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    value={formData.cta_text}
                    onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                    placeholder="Explore Bridal Blouses"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DCCD] bg-[#FAF8F5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#0D1B2A] mb-1">Display Order</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.display_order}
                    onChange={(e) =>
                      setFormData({ ...formData, display_order: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DCCD] bg-[#FAF8F5] font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#0D1B2A] mb-1">Status</label>
                  <select
                    value={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DCCD] bg-[#FAF8F5] font-bold"
                  >
                    <option value={1}>Active & Live on Storefront</option>
                    <option value={0}>Draft / Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E5DCCD]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#E5DCCD] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-full bg-[#8B1E3F] text-white font-bold uppercase tracking-wider hover:bg-[#780C28] disabled:opacity-50 shadow-md"
                >
                  {submitting ? "Saving..." : isEditing ? "Update Banner" : "Publish Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
export default BannersAdmin;
