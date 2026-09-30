import { useState, useEffect } from "react";
import { AdminShell } from "@/components/app/AdminShell";
import { PRODUCTS } from "@/lib/hopo-data";
import {
  getPriceOverrides,
  updateProductPrice,
  deletePriceOverride,
  getEffectiveProductPrice,
  useStoreSync,
} from "@/lib/store";
import {
  Search,
  IndianRupee,
  Edit2,
  RotateCcw,
  AlertCircle,
  Sparkles,
  Tag,
  Filter,
  X,
  TrendingDown,
} from "lucide-react";
import { formatINR } from "@/lib/business-config";
import { adminApi } from "@/services/api/index";
export function AdminPricing() {
  useStoreSync();
  const overrides = getPriceOverrides();
  const [dbProducts, setDbProducts] = useState(null);
  const loadProducts = async () => {
    try {
      const res = await adminApi.getProducts();
      if (res.success && Array.isArray(res.data)) {
        setDbProducts(
          res.data.map((p) => ({
            ...p,
            price: p.effective_price || p.base_price,
            mrp: p.effective_mrp || p.mrp,
            category: p.category || "Couture",
          })),
        );
      }
    } catch {
      // fallback
    }
  };
  useEffect(() => {
    loadProducts();
  }, []);
  const allProducts = dbProducts || PRODUCTS;
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filterOverriddenOnly, setFilterOverriddenOnly] = useState(false);
  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState(null);
  const [editPrice, setEditPrice] = useState("");
  const [editMrp, setEditMrp] = useState("");
  const [editError, setEditError] = useState("");
  // Reset/Delete Modal State
  const [resetTargetProduct, setResetTargetProduct] = useState(null);
  // Categories list
  const categories = ["All", ...Array.from(new Set(allProducts.map((p) => p.category)))];
  // Stats
  const totalProducts = allProducts.length;
  const overriddenCount = Object.keys(overrides).length;
  const onSaleCount = allProducts.filter((p) => {
    const effective = getEffectiveProductPrice(p);
    return effective.mrp > effective.price;
  }).length;
  // Filtered Products
  const filteredProducts = allProducts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    const isOverridden = !!overrides[p.id];
    const matchesOverride = !filterOverriddenOnly || isOverridden;
    return matchesSearch && matchesCategory && matchesOverride;
  });
  const handleOpenEdit = (p) => {
    const effective = getEffectiveProductPrice(p);
    setEditingProduct(p);
    setEditPrice(effective.price);
    setEditMrp(effective.mrp);
    setEditError("");
  };
  const handleSavePrice = (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    const numPrice = Number(editPrice);
    const numMrp = Number(editMrp);
    if (isNaN(numPrice) || numPrice <= 0) {
      setEditError("Selling price must be greater than ₹0.");
      return;
    }
    if (isNaN(numMrp) || numMrp < numPrice) {
      setEditError("MRP cannot be lower than the selling price.");
      return;
    }
    updateProductPrice(editingProduct.id, numPrice, numMrp);
    setEditingProduct(null);
  };
  const handleConfirmReset = () => {
    if (resetTargetProduct) {
      deletePriceOverride(resetTargetProduct.id);
      setResetTargetProduct(null);
    }
  };
  // Quick discount calculation for modal
  const calcDiscount =
    editMrp && editPrice && Number(editMrp) > Number(editPrice)
      ? Math.round(((Number(editMrp) - Number(editPrice)) / Number(editMrp)) * 100)
      : 0;
  return (
    <AdminShell
      title="Product Pricing & Rates"
      subtitle="Directly control selling prices, MRPs, and active markdowns across the catalog with real-time storefront synchronization"
    >
      <div className="space-y-6">
        {/* KPI Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-[#E5DCCD] bg-white p-4 shadow-subtle flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#8B1E3F]/10 text-[#8B1E3F] flex items-center justify-center font-bold">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
                Catalog SKUs
              </p>
              <h3 className="text-xl font-bold text-[#0D1B2A]">{totalProducts}</h3>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E5DCCD] bg-white p-4 shadow-subtle flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#2E7D6B]/10 text-[#2E7D6B] flex items-center justify-center font-bold">
              <IndianRupee className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
                Active Overrides
              </p>
              <h3 className="text-xl font-bold text-[#2E7D6B]">{overriddenCount}</h3>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E5DCCD] bg-white p-4 shadow-subtle flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#C8A96E]/15 text-[#8B1E3F] flex items-center justify-center font-bold">
              <TrendingDown className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
                Discounted SKUs
              </p>
              <h3 className="text-xl font-bold text-[#0D1B2A]">{onSaleCount}</h3>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E5DCCD] bg-white p-4 shadow-subtle flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#0D1B2A]/10 text-[#0D1B2A] flex items-center justify-center font-bold">
              <Sparkles className="h-5 w-5 text-[#8B1E3F]" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
                Sync Mode
              </p>
              <h3 className="text-sm font-bold text-[#2E7D6B]">Real-Time Live</h3>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white p-3 rounded-2xl border border-[#E5DCCD] shadow-subtle">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Search product title, designer, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E5DCCD] bg-[#FAF8F5] focus:outline-none focus:border-[#8B1E3F]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Category Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
              <Filter className="h-3.5 w-3.5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#E5DCCD] bg-[#FAF8F5] text-xs font-medium focus:outline-none focus:border-[#8B1E3F]"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Overridden Toggle Button */}
            <button
              onClick={() => setFilterOverriddenOnly(!filterOverriddenOnly)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                filterOverriddenOnly
                  ? "bg-[#8B1E3F] text-white shadow-xs"
                  : "bg-[#FAF8F5] text-[#6B7280] border border-[#E5DCCD] hover:text-[#0D1B2A]"
              }`}
            >
              <span>Custom Rates Only</span>
              {filterOverriddenOnly && <span className="h-2 w-2 rounded-full bg-white" />}
            </button>
          </div>
        </div>

        {/* Pricing Table */}
        <div className="rounded-3xl border border-[#E5DCCD] bg-white overflow-hidden shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left min-w-[750px]">
              <thead className="bg-[#FAF6EE] text-[10px] uppercase font-bold text-[#6B7280] border-b border-[#E5DCCD]">
                <tr>
                  <th className="px-5 py-3.5">Product SKU</th>
                  <th className="py-3.5">Category & Fabric</th>
                  <th className="py-3.5 text-right">Selling Price</th>
                  <th className="py-3.5 text-right">MRP</th>
                  <th className="py-3.5 text-center">Discount</th>
                  <th className="py-3.5 text-center">Price Status</th>
                  <th className="py-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DCCD]/60 font-medium text-[#0D1B2A]">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-[#6B7280]">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2 text-[#C8A96E]/80" />
                      <p className="font-semibold text-sm text-[#0D1B2A]">No Products Found</p>
                      <p className="text-xs mt-1">Try adjusting your filters or search query.</p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const effective = getEffectiveProductPrice(p);
                    const isCustom = effective.isOverridden;
                    return (
                      <tr key={p.id} className="hover:bg-[#FAF8F5] transition">
                        {/* Product SKU */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.image}
                              alt={p.title}
                              className="h-11 w-9 object-cover rounded-lg border border-[#E5DCCD] shrink-0 bg-[#F7F2E9]"
                            />
                            <div className="min-w-0 max-w-xs">
                              <p className="font-bold text-[#0D1B2A] truncate hover:text-[#8B1E3F]">
                                {p.title}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] text-[#6B7280]">
                                <span className="font-mono text-[#8B1E3F] font-semibold">
                                  {p.id}
                                </span>
                                <span>•</span>
                                <span>{p.brand}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category & Fabric */}
                        <td className="py-3.5">
                          <span className="text-[#0D1B2A] block font-semibold">{p.category}</span>
                          <span className="text-[10px] text-[#6B7280]">
                            {p.fabric || "Handloom"}
                          </span>
                        </td>

                        {/* Selling Price */}
                        <td className="py-3.5 text-right">
                          <span
                            className={`text-sm font-bold ${isCustom ? "text-[#8B1E3F]" : "text-[#0D1B2A]"}`}
                          >
                            {formatINR(effective.price)}
                          </span>
                        </td>

                        {/* MRP */}
                        <td className="py-3.5 text-right text-[#6B7280]">
                          <span className="line-through">{formatINR(effective.mrp)}</span>
                        </td>

                        {/* Discount */}
                        <td className="py-3.5 text-center">
                          {effective.discount > 0 ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#8B1E3F]/10 text-[#8B1E3F]">
                              {effective.discount}% OFF
                            </span>
                          ) : (
                            <span className="text-[#6B7280] text-[10px]">—</span>
                          )}
                        </td>

                        {/* Price Status */}
                        <td className="py-3.5 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isCustom
                                ? "bg-[#2E7D6B]/15 text-[#2E7D6B]"
                                : "bg-[#FAF6EE] text-[#6B7280] border border-[#E5DCCD]"
                            }`}
                          >
                            {isCustom ? "Custom Overridden" : "Catalog Default"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 pr-5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#8B1E3F]/10 text-[#8B1E3F] hover:bg-[#8B1E3F] hover:text-white transition text-xs font-bold cursor-pointer"
                              title="Edit price & MRP"
                            >
                              <Edit2 className="h-3 w-3" />
                              <span>Set Price</span>
                            </button>

                            {isCustom && (
                              <button
                                onClick={() => setResetTargetProduct(p)}
                                className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#8B1E3F] hover:bg-black/5 transition cursor-pointer"
                                title="Reset to Catalog Default"
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* QUICK EDIT PRICE MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-[#E5DCCD]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5DCCD]">
              <div className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5 text-[#8B1E3F]" />
                <h3 className="text-base font-bold text-[#0D1B2A]">Update Product Pricing</h3>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1 rounded-xl text-[#6B7280] hover:text-[#0D1B2A] hover:bg-black/5 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Product snippet */}
            <div className="mt-4 p-3 rounded-2xl bg-[#FAF8F5] border border-[#E5DCCD] flex items-center gap-3">
              <img
                src={editingProduct.image}
                alt={editingProduct.title}
                className="h-12 w-10 object-cover rounded-xl border border-[#E5DCCD]"
              />
              <div className="min-w-0">
                <p className="font-bold text-xs text-[#0D1B2A] truncate">{editingProduct.title}</p>
                <p className="text-[10px] text-[#6B7280]">
                  SKU: <span className="font-mono text-[#8B1E3F]">{editingProduct.id}</span> •
                  Default: {formatINR(editingProduct.price)}
                </p>
              </div>
            </div>

            {editError && (
              <div className="mt-3 p-2.5 rounded-xl bg-[#8B1E3F]/10 text-[#8B1E3F] text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSavePrice} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editPrice}
                    onChange={(e) =>
                      setEditPrice(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-[#E5DCCD] focus:outline-none focus:border-[#8B1E3F]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1">
                    MRP (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editMrp}
                    onChange={(e) =>
                      setEditMrp(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-[#E5DCCD] focus:outline-none focus:border-[#8B1E3F]"
                  />
                </div>
              </div>

              {/* Real-time calculated discount indicator */}
              <div className="p-3 rounded-xl bg-[#FAF6EE] border border-[#E5DCCD] flex items-center justify-between text-xs">
                <span className="text-[#6B7280] font-medium">Calculated Discount:</span>
                <span className="font-bold text-[#8B1E3F]">
                  {calcDiscount > 0 ? `${calcDiscount}% OFF` : "No Discount (Selling at MRP)"}
                </span>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E5DCCD]">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl border border-[#E5DCCD] text-xs font-bold text-[#6B7280] hover:bg-[#FAF8F5] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#8B1E3F] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#5E0F27] transition shadow-xs cursor-pointer"
                >
                  Apply & Sync Live
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET CONFIRMATION MODAL */}
      {resetTargetProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-[#E5DCCD]">
            <div className="flex items-center gap-3 text-[#8B1E3F] mb-3">
              <div className="h-10 w-10 rounded-2xl bg-[#8B1E3F]/10 flex items-center justify-center">
                <RotateCcw className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-[#0D1B2A]">Reset Price to Default?</h3>
            </div>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              This will remove the custom pricing override for{" "}
              <strong className="text-[#0D1B2A]">{resetTargetProduct.title}</strong> and restore the
              original catalog default of{" "}
              <strong className="text-[#0D1B2A]">{formatINR(resetTargetProduct.price)}</strong> (MRP{" "}
              {formatINR(resetTargetProduct.mrp)}).
            </p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setResetTargetProduct(null)}
                className="px-4 py-2 rounded-xl border border-[#E5DCCD] text-xs font-bold text-[#6B7280] hover:bg-[#FAF8F5] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-2 rounded-xl bg-[#8B1E3F] text-white text-xs font-bold hover:bg-[#5E0F27] transition shadow-xs cursor-pointer"
              >
                Yes, Reset Price
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
export default AdminPricing;
