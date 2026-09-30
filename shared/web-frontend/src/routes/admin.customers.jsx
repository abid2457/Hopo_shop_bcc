import React, { useState, useEffect } from "react";
import { AdminShell } from "@/components/app/AdminShell";
import { adminApi } from "@/services/api/index";
import { Search, Crown, Users, RefreshCw, Download, Pencil, Check, X } from "lucide-react";
import { formatINR } from "@/lib/business-config";
export function CustomersAdmin() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  // Tier Edit Modal
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [newTier, setNewTier] = useState("Silver");
  const [newPoints, setNewPoints] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const loadCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getCustomers();
      if (res.success && res.data) {
        setCustomers(res.data);
      }
    } catch (err) {
      setError(err.message || "Failed to load customers.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadCustomers();
  }, []);
  const handleOpenEditTier = (c) => {
    setEditingCustomer(c);
    setNewTier(c.tier || "Silver");
    setNewPoints(Number(c.points) || 0);
  };
  const handleSaveTier = async (e) => {
    e.preventDefault();
    if (!editingCustomer) return;
    setSubmitting(true);
    try {
      const res = await adminApi.updateCustomerTier(editingCustomer.id, newTier, newPoints);
      if (res.success) {
        setEditingCustomer(null);
        await loadCustomers();
      } else {
        alert(res.message || "Failed to update customer tier.");
      }
    } catch (err) {
      alert(err.message || "Error updating tier.");
    } finally {
      setSubmitting(false);
    }
  };
  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm)),
  );
  const handleExportCSV = () => {
    const headers =
      "Customer ID,Name,Email,Phone,Membership Tier,Points,Total Orders,Total Spend (LTV),Joined Date\n";
    const rows = filtered
      .map(
        (c) =>
          `"${c.id}","${c.name}","${c.email}","${c.phone || ""}","${c.tier}",${c.points},${c.total_orders},${c.total_spent},"${c.created_at}"`,
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `hopo_vips_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <AdminShell
      title="Customers Management"
      subtitle={`${customers.length} Registered Customers • Direct MySQL Database Connected`}
      actions={
        <div className="flex flex-wrap items-center gap-3 w-full justify-between">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="flex items-center gap-2 rounded-full border border-[#E5DCCD] bg-[#FAF6EE] px-3.5 py-2 w-full text-xs">
              <Search className="h-3.5 w-3.5 text-[#6B7280]" />
              <input
                placeholder="Search customers by name, email, or phone…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent outline-none w-full text-[#0D1B2A]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E5DCCD] bg-white px-4 py-2 text-xs font-bold text-[#0D1B2A] hover:bg-[#FAF6EE] transition shadow-xs"
            >
              <Download className="h-3.5 w-3.5 text-[#8B1E3F]" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={loadCustomers}
              disabled={loading}
              className="p-2 rounded-full border border-[#E5DCCD] bg-white text-[#8B1E3F] hover:bg-[#FAF6EE] transition shadow-xs"
              title="Refresh Customers"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
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
          <table className="w-full text-xs text-left min-w-[750px]">
            <thead className="bg-[#FAF6EE] text-[10px] uppercase font-bold text-[#6B7280] border-b border-[#E5DCCD]">
              <tr>
                <th className="px-5 py-3.5">Customer ID</th>
                <th className="py-3.5">Name & Verified Contact</th>
                <th className="py-3.5 text-center">Membership Tier</th>
                <th className="py-3.5 text-center">Reward Points</th>
                <th className="py-3.5 text-center">Orders Placed</th>
                <th className="py-3.5 text-right">Lifetime Value (LTV)</th>
                <th className="py-3.5 text-right">Member Since</th>
                <th className="py-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DCCD]/60 font-medium text-[#0D1B2A]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-[#6B7280]">
                    <Users className="h-8 w-8 mx-auto mb-2 text-[#C8A96E]/80" />
                    <p className="font-semibold text-sm text-[#0D1B2A]">
                      {searchTerm
                        ? "No matching customers found"
                        : "No Customer Accounts Registered Yet"}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FAF8F5] transition">
                    <td className="px-5 py-3.5 font-mono text-[#8B1E3F] font-bold">{c.id}</td>
                    <td className="py-3.5">
                      <p className="font-bold text-[#0D1B2A]">{c.name}</p>
                      <p className="text-[10px] text-[#6B7280]">
                        {c.email} {c.phone ? `• ${c.phone}` : ""}
                      </p>
                    </td>
                    <td className="py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#C8A96E]/20 text-[#0D1B2A] border border-[#C8A96E]/40 px-2.5 py-0.5 text-[10px] font-bold">
                        <Crown className="h-3 w-3 text-[#C8A96E]" /> {c.tier}
                      </span>
                    </td>
                    <td className="py-3.5 text-center font-bold text-stone-700">{c.points} pts</td>
                    <td className="py-3.5 text-center font-bold">{c.total_orders}</td>
                    <td className="py-3.5 text-right font-bold text-[#0D1B2A]">
                      {formatINR(Number(c.total_spent))}
                    </td>
                    <td className="py-3.5 text-right text-[#6B7280]">
                      {new Date(c.created_at).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 pr-5 text-right">
                      <button
                        onClick={() => handleOpenEditTier(c)}
                        className="p-1.5 rounded-lg hover:bg-[#FAF6EE] text-[#8B1E3F]"
                        title="Edit Customer Loyalty Tier & Points"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-6 py-4 text-xs text-[#6B7280] border-t border-[#E5DCCD] bg-[#FAF6EE]/50">
          <span>
            Showing {filtered.length} of {customers.length} Registered Accounts
          </span>
          <span className="text-[#2E7D6B] font-semibold flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Customer Identity & Points Engine Active
          </span>
        </div>
      </div>

      {/* EDIT TIER MODAL */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border border-[#E5DCCD] shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E5DCCD] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B1E3F]">
                  LOYALTY CONCIERGE
                </span>
                <h2 className="font-display text-lg font-bold text-[#0D1B2A]">
                  Manage Customer Tier: {editingCustomer.name}
                </h2>
              </div>
              <button
                onClick={() => setEditingCustomer(null)}
                className="p-2 rounded-full hover:bg-stone-100 text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTier} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#0D1B2A] mb-1">VIP Membership Tier</label>
                <select
                  value={newTier}
                  onChange={(e) => setNewTier(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DCCD] bg-[#FAF8F5] font-bold"
                >
                  <option value="Silver">Silver Tier</option>
                  <option value="Gold">Gold Tier (High Priority)</option>
                  <option value="Platinum">Platinum Haute Couture</option>
                  <option value="Diamond">Diamond VIP Concierge</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#0D1B2A] mb-1">
                  Loyalty Points Balance
                </label>
                <input
                  type="number"
                  min="0"
                  value={newPoints}
                  onChange={(e) => setNewPoints(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DCCD] bg-[#FAF8F5] font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E5DCCD]">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-4 py-2 rounded-full border border-[#E5DCCD] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-full bg-[#8B1E3F] text-white font-bold uppercase tracking-wider hover:bg-[#780C28] disabled:opacity-50 shadow-md"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
export default CustomersAdmin;
