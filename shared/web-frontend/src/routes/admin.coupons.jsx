import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AdminShell } from "@/components/app/AdminShell";
import { adminApi } from "@/services/api/index";
import { Plus, RefreshCw, Trash2, X } from "lucide-react";
import { formatINR } from "@/lib/business-config";
const DEFAULT_FORM = {
  code: "",
  title: "",
  description: "",
  discountType: "PERCENTAGE",
  discountValue: 15,
  minOrderAmount: 2499,
  maxDiscountCap: 1500,
  categoryRestriction: "",
  expiryDate: new Date(Date.now() + 60 * 86400000).toISOString().split("T")[0],
};
export function CouponsAdmin() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const loadCoupons = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getCoupons();
      if (res.success && res.data) {
        setCoupons(res.data);
      }
    } catch (err) {
      setError(err.message || "Failed to load coupons.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadCoupons();
  }, []);
  const handleToggleEnabled = async (c) => {
    try {
      const res = await adminApi.updateCoupon(c.id, { enabled: !c.enabled });
      if (res.success) {
        await loadCoupons();
      }
    } catch (err) {
      alert(err.message || "Error toggling coupon status.");
    }
  };
  const handleDelete = async (c) => {
    if (!window.confirm(`Are you sure you want to delete coupon "${c.code}"?`)) return;
    try {
      const res = await adminApi.deleteCoupon(c.id);
      if (res.success) {
        await loadCoupons();
      } else {
        alert(res.message || "Failed to delete coupon.");
      }
    } catch (err) {
      alert(err.message || "Error deleting coupon.");
    }
  };
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setFormError(null);
    const code = formData.code.trim().toUpperCase();
    if (!code) {
      setFormError("Coupon code is required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await adminApi.createCoupon({
        ...formData,
        code,
      });
      if (res.success) {
        setIsModalOpen(false);
        setFormData(DEFAULT_FORM);
        await loadCoupons();
      } else {
        setFormError(res.message || "Failed to create coupon.");
      }
    } catch (err) {
      setFormError(err.message || "Error creating coupon.");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <AdminShell
      title="Coupons Management"
      subtitle={`${coupons.length} Active MySQL Promotional Coupons`}
      actions={
        <div className="flex items-center gap-3">
          <Link
            to="/admin/offers"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#E5DCCD] bg-white px-4 py-2 text-xs font-bold text-[#0D1B2A] hover:bg-[#FAF6EE] transition shadow-xs"
          >
            <span>Manage Special Offers</span>
          </Link>
          <button
            onClick={loadCoupons}
            disabled={loading}
            className="p-2 rounded-full border border-[#E5DCCD] bg-white text-[#8B1E3F] hover:bg-[#FAF6EE] transition shadow-xs"
            title="Refresh Coupons"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => {
              setFormData(DEFAULT_FORM);
              setFormError(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-[#8B1E3F] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#780C28] transition shadow-md"
          >
            <Plus className="h-4 w-4" />
            <span>Create Coupon</span>
          </button>
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
          <table className="w-full text-xs text-left min-w-[750px]">
            <thead className="bg-[#FAF6EE] text-[10px] uppercase font-bold text-[#6B7280] border-b border-[#E5DCCD]">
              <tr>
                <th className="px-5 py-3.5">Promo Code</th>
                <th className="py-3.5">Promotion Title</th>
                <th className="py-3.5">Discount Rate</th>
                <th className="py-3.5 text-right">Min Order</th>
                <th className="py-3.5 text-center">Usage Count</th>
                <th className="py-3.5 text-center">Live Status</th>
                <th className="py-3.5 text-right">Valid Until</th>
                <th className="py-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DCCD]/60 font-medium text-[#0D1B2A]">
              {coupons.map((c) => {
                const isExpired = new Date(c.expiry_date || c.expiryDate) < new Date();
                const isActive = Boolean(c.enabled) && !isExpired;
                return (
                  <tr key={c.id || c.code} className="hover:bg-[#FAF8F5] transition">
                    <td className="px-5 py-3.5 font-mono font-bold text-[#8B1E3F] text-[11px]">
                      {c.code}
                    </td>
                    <td className="py-3.5 font-bold">
                      {c.title}
                      <p className="text-[10px] font-normal text-[#6B7280]">{c.description}</p>
                    </td>
                    <td className="py-3.5 font-bold text-[#0D1B2A]">
                      {c.discount_type === "FLAT"
                        ? formatINR(Number(c.discount_value))
                        : `${c.discount_value}%`}
                      {c.max_discount_cap && (
                        <span className="block text-[9px] text-stone-500 font-normal">
                          Cap: {formatINR(c.max_discount_cap)}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 text-right font-bold">
                      {formatINR(Number(c.min_order_amount))}
                    </td>
                    <td className="py-3.5 text-center font-bold text-stone-700">
                      {c.usage_count || 0}
                    </td>
                    <td className="py-3.5 text-center">
                      <button
                        onClick={() => handleToggleEnabled(c)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full cursor-pointer transition ${isActive ? "bg-[#2E7D6B]/10 text-[#2E7D6B] hover:bg-[#2E7D6B]/20" : "bg-red-100 text-red-700"}`}
                        title="Click to toggle status"
                      >
                        {isActive ? "Active & Enforced" : isExpired ? "Expired" : "Disabled"}
                      </button>
                    </td>
                    <td className="py-3.5 text-right text-[#6B7280]">
                      {new Date(c.expiry_date || c.expiryDate).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 pr-5 text-right">
                      <button
                        onClick={() => handleDelete(c)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"
                        title="Delete Coupon"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE COUPON MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-[#E5DCCD] shadow-2xl p-6 md:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E5DCCD] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B1E3F]">
                  FESTIVE PRIVILEGES
                </span>
                <h2 className="font-display text-lg font-bold text-[#0D1B2A]">
                  Create Promotion Coupon
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

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#0D1B2A] mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    placeholder="e.g. BRIDAL30"
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DCCD] bg-[#FAF8F5] font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#0D1B2A] mb-1">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DCCD] bg-[#FAF8F5] font-bold"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#0D1B2A] mb-1">Promotion Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Royal Wedding Privilege"
                  className="w-full px-3 py-2 rounded-xl border border-[#E5DCCD] bg-[#FAF8F5]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0D1B2A] mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. 20% off on all bridal ensembles above ₹6,000"
                  className="w-full px-3 py-2 rounded-xl border border-[#E5DCCD] bg-[#FAF8F5]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#0D1B2A] mb-1">Discount Value *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData({ ...formData, discountValue: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DCCD] bg-[#FAF8F5] font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#0D1B2A] mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minOrderAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, minOrderAmount: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DCCD] bg-[#FAF8F5] font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#0D1B2A] mb-1">Max Cap (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxDiscountCap || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxDiscountCap: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#E5DCCD] bg-[#FAF8F5] font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#0D1B2A] mb-1">Expiry Date *</label>
                <input
                  type="date"
                  required
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5DCCD] bg-[#FAF8F5] font-bold"
                />
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
                  {submitting ? "Saving..." : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
export default CouponsAdmin;
