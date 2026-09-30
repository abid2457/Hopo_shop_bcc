import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AdminShell } from "@/components/app/AdminShell";
import { adminApi } from "@/services/api/index";
import { ImageUploader } from "@/components/app/ImageUploader";
import { Plus, Download, Pencil, Trash2, Search, RefreshCw, X, Check, Eye } from "lucide-react";
import { formatINR } from "@/lib/business-config";
import { notifyCatalogUpdated } from "@/lib/catalog-service";
const DEFAULT_FORM = {
  title: "",
  brand: "Sabyasachi",
  category_id: 1,
  subcategory: "Zardozi Bridal Blouses",
  base_price: 5999,
  mrp: 9999,
  tag: "BRIDAL COUTURE",
  fabric: "Heritage Raw Silk",
  occasion: "Wedding",
  neckline: "Sweetheart",
  sleeve: "Elbow Sleeve",
  work_type: "Handcrafted Zardozi Bullion Embroidery",
  padding: "Built-in Luxury Cups",
  closure: "Back Hook & Tie Latkans",
  margin: "2 inches on both sides",
  primary_image: "",
  images: [],
  status: "active",
  sizes: { XS: 3, S: 5, M: 6, L: 4, XL: 2, XXL: 1 },
};
export function ProductsAdmin() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const loadCatalog = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodRes, catRes] = await Promise.all([
        adminApi.getProducts(),
        adminApi.getCategories(),
      ]);
      if (prodRes.success && prodRes.data) {
        setProducts(prodRes.data);
      }
      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
      }
    } catch (err) {
      setError(err.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadCatalog();
  }, []);
  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData({
      ...DEFAULT_FORM,
      category_id: categories[0]?.id || 1,
      subcategory: categories[0]?.subs?.[0] || "General",
    });
    setFormError(null);
    setIsModalOpen(true);
  };
  const handleOpenEdit = (p) => {
    setIsEditing(true);
    setFormData({
      id: p.id,
      title: p.title,
      brand: p.brand,
      category_id: Number(p.category_id) || 1,
      subcategory: p.subcategory || "General",
      base_price: Number(p.base_price),
      mrp: Number(p.mrp),
      tag: p.tag || "ATELIER COUTURE",
      fabric: p.fabric || "Pure Silk",
      occasion: p.occasion || "Wedding",
      neckline: p.neckline || "Sweetheart",
      sleeve: p.sleeve || "Elbow Sleeve",
      work_type: p.work_type || "Handcrafted Embroidery",
      padding: p.padding || "Built-in Luxury Cups",
      closure: p.closure || "Back Hook",
      margin: p.margin || "2 inches on both sides",
      primary_image: p.image || p.primary_image || "",
      images:
        Array.isArray(p.images) && p.images.length > 0
          ? p.images
          : [p.image || p.primary_image].filter(Boolean),
      status: p.status === "inactive" ? "inactive" : "active",
      sizes: { XS: 3, S: 5, M: 5, L: 4, XL: 2, XXL: 1 },
    });
    setFormError(null);
    setIsModalOpen(true);
  };
  const handleDeleteProduct = async (p) => {
    if (!window.confirm(`Are you certain you wish to remove or archive "${p.title}" (${p.id})?`)) {
      return;
    }
    try {
      const res = await adminApi.deleteProduct(p.id);
      if (res.success) {
        notifyCatalogUpdated();
        await loadCatalog();
      } else {
        alert(res.message || "Failed to delete product.");
      }
    } catch (err) {
      alert(err.message || "Error deleting product.");
    }
  };
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (!formData.title.trim()) {
      setFormError("Product Title is required.");
      return;
    }
    if (formData.images.length === 0) {
      setFormError("At least one product image is required.");
      return;
    }
    setFormSubmitting(true);
    const primaryImg = formData.images[0];
    try {
      if (isEditing && formData.id) {
        const payload = {
          ...formData,
          primary_image: primaryImg,
        };
        const res = await adminApi.updateProduct(formData.id, payload);
        if (res.success) {
          notifyCatalogUpdated();
          setIsModalOpen(false);
          await loadCatalog();
        } else {
          setFormError(res.message || "Failed to update product.");
        }
      } else {
        const payload = {
          ...formData,
          primary_image: primaryImg,
        };
        const res = await adminApi.createProduct(payload);
        if (res.success) {
          notifyCatalogUpdated();
          setIsModalOpen(false);
          await loadCatalog();
        } else {
          setFormError(res.message || "Failed to create product.");
        }
      }
    } catch (err) {
      setFormError(err.message || "Error saving product to atelier database.");
    } finally {
      setFormSubmitting(false);
    }
  };
  const filtered = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat =
      selectedCategory === "All" ||
      (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());
    return matchesSearch && matchesCat;
  });
  const handleExportCSV = () => {
    const headers = "SKU_ID,Title,Brand,Category,Subcategory,BasePrice,MRP,Stock,Status\n";
    const rows = filtered
      .map(
        (p) =>
          `"${p.id}","${p.title.replace(/"/g, '""')}","${p.brand}","${p.category || ""}","${p.subcategory || ""}",${p.effective_price || p.base_price},${p.effective_mrp || p.mrp},${p.total_stock},"${p.status}"`,
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `hopo_catalog_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const selectedCategoryObj = categories.find((c) => c.id === formData.category_id);
  const availableSubcategories = selectedCategoryObj?.subs || [];
  return (
    <AdminShell
      title="Products Catalog"
      subtitle={`${filtered.length} Unique SKUs • MySQL Database Synced`}
      actions={
        <div className="flex flex-wrap items-center gap-3 w-full justify-between">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="flex items-center gap-2 rounded-full border border-[#E5DCCD] bg-[#FAF6EE] px-3.5 py-2 w-full text-xs">
              <Search className="h-3.5 w-3.5 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Search products by title, designer brand, or SKU…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent outline-none w-full text-[#0D1B2A]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-full border border-[#E5DCCD] bg-white px-3.5 py-2 text-xs font-bold text-[#0D1B2A] outline-none shadow-xs"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E5DCCD] bg-white px-4 py-2 text-xs font-bold text-[#0D1B2A] hover:bg-[#FAF6EE] transition shadow-xs"
            >
              <Download className="h-3.5 w-3.5 text-[#8B1E3F]" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={loadCatalog}
              disabled={loading}
              className="p-2 rounded-full border border-[#E5DCCD] bg-white text-[#8B1E3F] hover:bg-[#FAF6EE] transition shadow-xs"
              title="Refresh Catalog"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 rounded-full bg-[#8B1E3F] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#780C28] transition shadow-md"
            >
              <Plus className="h-4 w-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>
      }
    >
      {error && (
        <div className="mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
          {error}
        </div>
      )}

      <div className="rounded-3xl border border-[#E5DCCD] bg-white overflow-hidden shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[850px]">
            <thead className="bg-[#FAF6EE] text-[10px] uppercase font-bold text-[#6B7280] border-b border-[#E5DCCD]">
              <tr>
                <th className="px-4 py-3.5">Image</th>
                <th className="py-3.5">SKU ID</th>
                <th className="py-3.5">Piece Title & Designer</th>
                <th className="py-3.5">Category & Subcategory</th>
                <th className="py-3.5 text-right">Effective Rate</th>
                <th className="py-3.5 text-right">MRP</th>
                <th className="py-3.5 text-center">Stock</th>
                <th className="py-3.5 text-center">Status</th>
                <th className="py-3.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DCCD]/60 font-medium text-[#0D1B2A]">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-[#FAF8F5] transition">
                  <td className="px-4 py-3">
                    <img
                      src={p.image || "/images/brand_logo.png"}
                      alt={p.title}
                      className="h-12 w-10 object-cover rounded-lg border border-[#E5DCCD] shadow-xs"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </td>
                  <td className="py-3 font-mono text-[11px] text-[#8B1E3F] font-bold">{p.id}</td>
                  <td className="py-3 pr-4 max-w-xs">
                    <p className="font-bold text-[#0D1B2A] truncate">{p.title}</p>
                    <p className="text-[10px] text-[#6B7280]">
                      {p.brand} • {p.fabric || "Pure Silk"}
                    </p>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-md bg-[#FAF6EE] border border-[#E5DCCD] text-[10px] font-bold block w-fit mb-0.5">
                      {p.category || "Couture"}
                    </span>
                    <span className="text-[10px] text-stone-500 block truncate max-w-[140px]">
                      {p.subcategory || "General"}
                    </span>
                  </td>
                  <td className="py-3 text-right font-bold whitespace-nowrap">
                    {formatINR(p.effective_price || p.base_price)}
                    {p.has_price_override && (
                      <span className="block text-[9px] text-[#C8A96E] font-semibold">
                        Override Active
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right text-[#6B7280] line-through whitespace-nowrap">
                    {p.effective_mrp || p.mrp ? formatINR(p.effective_mrp || p.mrp) : "-"}
                  </td>
                  <td className="py-3 text-center whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        p.total_stock > 2
                          ? "bg-[#2E7D6B]/10 text-[#2E7D6B]"
                          : p.total_stock > 0
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {p.total_stock} in stock
                    </span>
                  </td>
                  <td className="py-3 text-center whitespace-nowrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.status === "active" && !p.isArchived
                          ? "bg-[#2E7D6B]/10 text-[#2E7D6B]"
                          : "bg-stone-100 text-stone-500"
                      }`}
                    >
                      {p.isArchived ? "Archived" : p.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        to={`/product/${p.id}`}
                        target="_blank"
                        className="p-1.5 rounded-lg hover:bg-[#FAF6EE] text-[#6B7280] hover:text-[#8B1E3F]"
                        title="View on Storefront"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 rounded-lg hover:bg-[#FAF6EE] text-[#8B1E3F]"
                        title="Edit Masterpiece"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(p)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"
                        title="Archive / Remove Product"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-6 py-4 text-xs text-[#6B7280] border-t border-[#E5DCCD] bg-[#FAF6EE]/50">
          <span>
            Showing {filtered.length} of {products.length} Products
          </span>
          <span className="text-[#2E7D6B] font-semibold flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Direct MySQL Production Connected
          </span>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl bg-white rounded-3xl border border-[#E5DCCD] shadow-2xl p-6 md:p-8 my-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5DCCD] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B1E3F]">
                  ATELIER PRODUCT STUDIO
                </span>
                <h2 className="font-display text-xl font-bold text-[#0D1B2A]">
                  {isEditing ? `Edit Product: ${formData.id}` : "Create New Product"}
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

            <form onSubmit={handleFormSubmit} className="space-y-5 text-xs">
              {/* Image Uploader */}
              <div className="p-4 bg-[#FFFDF9] border border-[#E8DCC4] rounded-2xl">
                <ImageUploader
                  images={formData.images}
                  onChange={(imgs) => setFormData({ ...formData, images: imgs })}
                  multiple={true}
                  label="Product Gallery & Primary Image"
                  helperText="Upload 1 to 5 images. The first image with the star badge serves as primary on storefront."
                />
              </div>

              {/* Title & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-[#0D1B2A] mb-1">Piece Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Crimson Peacock Zardozi Bridal Blouse"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DCCD] bg-[#FAF8F5] focus:outline-none focus:border-[#8B1E3F]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#0D1B2A] mb-1">Designer Brand *</label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. Sabyasachi"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DCCD] bg-[#FAF8F5] focus:outline-none focus:border-[#8B1E3F]"
                  />
                </div>
              </div>

              {/* Category & Subcategory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#0D1B2A] mb-1">Primary Category *</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => {
                      const newCatId = Number(e.target.value);
                      const catObj = categories.find((c) => c.id === newCatId);
                      setFormData({
                        ...formData,
                        category_id: newCatId,
                        subcategory: catObj?.subs?.[0] || "General",
                      });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DCCD] bg-[#FAF8F5] focus:outline-none focus:border-[#8B1E3F]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#0D1B2A] mb-1">Subcategory *</label>
                  {availableSubcategories.length > 0 ? (
                    <select
                      value={formData.subcategory}
                      onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DCCD] bg-[#FAF8F5] focus:outline-none focus:border-[#8B1E3F]"
                    >
                      {availableSubcategories.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formData.subcategory}
                      onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                      placeholder="e.g. Zardozi Blouses"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DCCD] bg-[#FAF8F5] focus:outline-none focus:border-[#8B1E3F]"
                    />
                  )}
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-[#0D1B2A] mb-1">Base Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.base_price}
                    onChange={(e) =>
                      setFormData({ ...formData, base_price: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DCCD] bg-[#FAF8F5] focus:outline-none focus:border-[#8B1E3F]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#0D1B2A] mb-1">MRP Reference (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DCCD] bg-[#FAF8F5] focus:outline-none focus:border-[#8B1E3F]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#0D1B2A] mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DCCD] bg-[#FAF8F5] focus:outline-none focus:border-[#8B1E3F]"
                  >
                    <option value="active">Active (Visible on Storefront)</option>
                    <option value="inactive">Inactive / Hidden</option>
                  </select>
                </div>
              </div>

              {/* Luxury Atelier Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-[#0D1B2A] mb-1">Fabric</label>
                  <input
                    type="text"
                    value={formData.fabric}
                    onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DCCD] bg-[#FAF8F5] focus:outline-none focus:border-[#8B1E3F]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#0D1B2A] mb-1">Occasion</label>
                  <input
                    type="text"
                    value={formData.occasion}
                    onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DCCD] bg-[#FAF8F5] focus:outline-none focus:border-[#8B1E3F]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#0D1B2A] mb-1">Neckline</label>
                  <input
                    type="text"
                    value={formData.neckline}
                    onChange={(e) => setFormData({ ...formData, neckline: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DCCD] bg-[#FAF8F5] focus:outline-none focus:border-[#8B1E3F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-[#0D1B2A] mb-1">Sleeve</label>
                  <input
                    type="text"
                    value={formData.sleeve}
                    onChange={(e) => setFormData({ ...formData, sleeve: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DCCD] bg-[#FAF8F5] focus:outline-none focus:border-[#8B1E3F]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#0D1B2A] mb-1">
                    Padding Specification
                  </label>
                  <input
                    type="text"
                    value={formData.padding}
                    onChange={(e) => setFormData({ ...formData, padding: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DCCD] bg-[#FAF8F5] focus:outline-none focus:border-[#8B1E3F]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#0D1B2A] mb-1">Alteration Margin</label>
                  <input
                    type="text"
                    value={formData.margin}
                    onChange={(e) => setFormData({ ...formData, margin: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DCCD] bg-[#FAF8F5] focus:outline-none focus:border-[#8B1E3F]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#0D1B2A] mb-1">
                  Craftsmanship & Embroidery Work
                </label>
                <input
                  type="text"
                  value={formData.work_type}
                  onChange={(e) => setFormData({ ...formData, work_type: e.target.value })}
                  placeholder="e.g. Bullion Zardozi, resham threadwork, antique sequins"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DCCD] bg-[#FAF8F5] focus:outline-none focus:border-[#8B1E3F]"
                />
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
                  disabled={formSubmitting}
                  className="px-6 py-2.5 rounded-full bg-[#8B1E3F] text-white font-bold uppercase tracking-wider hover:bg-[#780C28] transition shadow-md disabled:opacity-50"
                >
                  {formSubmitting
                    ? "Saving to Database..."
                    : isEditing
                      ? "Update Masterpiece"
                      : "Create Masterpiece"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
export default ProductsAdmin;
