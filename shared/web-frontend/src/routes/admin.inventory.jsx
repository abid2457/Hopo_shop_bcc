import React, { useState, useEffect } from "react";
import { AdminShell, StatCard } from "@/components/app/AdminShell";
import { adminApi } from "@/services/api/index";
import { Boxes, AlertTriangle, RefreshCw, Check, CheckCircle2, Search } from "lucide-react";
import { formatINR } from "@/lib/business-config";
export function InventoryAdmin() {
  const [inventoryData, setInventoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState("all");
  // Inline editing state: { [variantSizeId]: number }
  const [editingStock, setEditingStock] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [successToast, setSuccessToast] = useState(null);
  const loadInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getInventory();
      if (res.success && res.data) {
        setInventoryData(res.data);
      }
    } catch (err) {
      setError(err.message || "Failed to load live inventory.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadInventory();
  }, []);
  const handleStockChange = (variantSizeId, val) => {
    setEditingStock((prev) => ({
      ...prev,
      [variantSizeId]: Math.max(0, val),
    }));
  };
  const handleSaveStock = async (variantSizeId) => {
    const newStock = editingStock[variantSizeId];
    if (newStock === undefined) return;
    setSavingId(variantSizeId);
    try {
      const res = await adminApi.updateInventory(variantSizeId, newStock);
      if (res.success) {
        setSuccessToast(`Stock updated to ${newStock} units`);
        setTimeout(() => setSuccessToast(null), 3000);
        // Clean up editing map entry
        setEditingStock((prev) => {
          const next = { ...prev };
          delete next[variantSizeId];
          return next;
        });
        await loadInventory();
      } else {
        alert(res.message || "Failed to update stock.");
      }
    } catch (err) {
      alert(err.message || "Error updating stock.");
    } finally {
      setSavingId(null);
    }
  };
  const summary = inventoryData?.summary || {
    totalSKUs: 0,
    totalUnits: 0,
    totalValuation: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  };
  const items = inventoryData?.items || [];
  const filteredItems = items.filter((it) => {
    const matchesSearch =
      it.product_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      it.product_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (it.brand && it.brand.toLowerCase().includes(searchTerm.toLowerCase()));
    if (!matchesSearch) return false;
    if (filterMode === "low") return it.is_low_stock && !it.is_out_of_stock;
    if (filterMode === "out") return it.is_out_of_stock;
    return true;
  });
  return (
    <AdminShell
      title="Stock & Inventory"
      subtitle={`${summary.totalSKUs} Sized SKUs • Direct MySQL Inventory Connected`}
      actions={
        <div className="flex flex-wrap items-center gap-3 w-full justify-between">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="flex items-center gap-2 rounded-full border border-[#E5DCCD] bg-[#FAF6EE] px-3.5 py-2 w-full text-xs">
              <Search className="h-3.5 w-3.5 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Search inventory by title or SKU ID…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent outline-none w-full text-[#0D1B2A]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-[#FAF6EE] rounded-full p-1 border border-[#E5DCCD] text-xs">
              <button
                onClick={() => setFilterMode("all")}
                className={`px-3 py-1 rounded-full font-bold transition ${filterMode === "all" ? "bg-[#8B1E3F] text-white shadow-xs" : "text-[#6B7280]"}`}
              >
                All ({items.length})
              </button>
              <button
                onClick={() => setFilterMode("low")}
                className={`px-3 py-1 rounded-full font-bold transition ${filterMode === "low" ? "bg-[#8B1E3F] text-white shadow-xs" : "text-[#6B7280]"}`}
              >
                Low Stock ({summary.lowStockCount})
              </button>
              <button
                onClick={() => setFilterMode("out")}
                className={`px-3 py-1 rounded-full font-bold transition ${filterMode === "out" ? "bg-[#8B1E3F] text-white shadow-xs" : "text-[#6B7280]"}`}
              >
                Depleted ({summary.outOfStockCount})
              </button>
            </div>

            <button
              onClick={loadInventory}
              disabled={loading}
              className="p-2 rounded-full border border-[#E5DCCD] bg-white text-[#8B1E3F] hover:bg-[#FAF6EE] transition shadow-xs"
              title="Refresh Inventory"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      }
    >
      {/* Toast Notification */}
      {successToast && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successToast}</span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
          {error}
        </div>
      )}

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Variant SKUs"
          value={String(summary.totalSKUs)}
          delta="Catalog Sized"
          trend="up"
          icon={Boxes}
        />
        <StatCard
          label="Total Units in Stock"
          value={String(summary.totalUnits)}
          delta="Live Physical Units"
          trend="up"
          icon={Boxes}
        />
        <StatCard
          label="Low Stock Units (≤2)"
          value={String(summary.lowStockCount)}
          delta={summary.lowStockCount > 0 ? "Replenish Soon" : "Optimal"}
          trend={summary.lowStockCount > 0 ? "down" : "up"}
          icon={AlertTriangle}
        />
        <StatCard
          label="Total Stock Valuation"
          value={formatINR(summary.totalValuation)}
          delta="Live Asset Value"
          trend="up"
        />
      </div>

      <div className="rounded-3xl border border-[#E5DCCD] bg-white overflow-hidden shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[750px]">
            <thead className="bg-[#FAF6EE] text-[10px] uppercase font-bold text-[#6B7280] border-b border-[#E5DCCD]">
              <tr>
                <th className="px-5 py-3.5">Product</th>
                <th className="py-3.5">SKU ID</th>
                <th className="py-3.5 text-center">Size</th>
                <th className="py-3.5 text-right">Unit Rate</th>
                <th className="py-3.5 text-center">Current Stock</th>
                <th className="py-3.5 text-right">Valuation</th>
                <th className="py-3.5 text-center">Status</th>
                <th className="py-3.5 pr-5 text-right">Quick Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DCCD]/60 font-medium text-[#0D1B2A]">
              {filteredItems.map((it) => {
                const currentStock =
                  editingStock[it.variant_size_id] !== undefined
                    ? editingStock[it.variant_size_id]
                    : it.stock;
                const isModified =
                  editingStock[it.variant_size_id] !== undefined &&
                  editingStock[it.variant_size_id] !== it.stock;
                return (
                  <tr key={it.variant_size_id} className="hover:bg-[#FAF8F5] transition">
                    <td className="px-5 py-3 flex items-center gap-3">
                      {it.image && (
                        <img
                          src={it.image}
                          alt={it.product_title}
                          className="w-9 h-11 object-cover rounded-lg border border-[#E5DCCD] shadow-xs shrink-0"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      )}
                      <div className="truncate max-w-xs">
                        <p className="font-bold truncate">{it.product_title}</p>
                        <p className="text-[10px] text-[#6B7280]">
                          {it.brand} • {it.category_name || "Couture"}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 font-mono font-bold text-[#8B1E3F] text-[11px] whitespace-nowrap">
                      {it.product_id}
                    </td>
                    <td className="py-3 text-center whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-md bg-[#FAF6EE] border border-[#E5DCCD] font-bold text-[11px]">
                        {it.size}
                      </span>
                    </td>
                    <td className="py-3 text-right font-bold whitespace-nowrap">
                      {formatINR(it.unit_price)}
                    </td>
                    <td className="py-3 text-center whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        value={currentStock}
                        onChange={(e) =>
                          handleStockChange(it.variant_size_id, Number(e.target.value))
                        }
                        className="w-16 px-2 py-1 text-center font-bold border border-[#E5DCCD] rounded-lg bg-[#FAF8F5] focus:outline-none focus:border-[#8B1E3F]"
                      />
                    </td>
                    <td className="py-3 text-right font-bold whitespace-nowrap text-stone-700">
                      {formatINR(it.valuation)}
                    </td>
                    <td className="py-3 text-center whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          it.stock === 0
                            ? "bg-red-100 text-red-700"
                            : it.stock <= 2
                              ? "bg-amber-100 text-amber-800"
                              : "bg-[#2E7D6B]/10 text-[#2E7D6B]"
                        }`}
                      >
                        {it.stock === 0
                          ? "Depleted"
                          : it.stock <= 2
                            ? "Low Stock"
                            : "Healthy Stock"}
                      </span>
                    </td>
                    <td className="py-3 pr-5 text-right whitespace-nowrap">
                      {isModified && (
                        <button
                          type="button"
                          disabled={savingId === it.variant_size_id}
                          onClick={() => handleSaveStock(it.variant_size_id)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-[#8B1E3F] text-white text-[11px] font-bold rounded-lg hover:bg-[#780C28] transition shadow-xs"
                        >
                          <Check className="w-3 h-3" />
                          <span>{savingId === it.variant_size_id ? "Saving..." : "Save"}</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-6 py-4 text-xs text-[#6B7280] border-t border-[#E5DCCD] bg-[#FAF6EE]/50">
          <span>
            Showing {filteredItems.length} of {items.length} Sized SKUs
          </span>
          <span className="text-[#2E7D6B] font-semibold flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Automatic Ledger Audit Logging Active
          </span>
        </div>
      </div>
    </AdminShell>
  );
}
export default InventoryAdmin;
