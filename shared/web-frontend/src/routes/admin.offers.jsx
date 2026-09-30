import { useState, useEffect } from "react";
import { AdminShell } from "@/components/app/AdminShell";
import { adminApi } from "@/services/api/index";
import {
  getAdminOffers,
  createAdminOffer,
  updateAdminOffer,
  deleteAdminOffer,
  toggleAdminOfferStatus,
  useStoreSync,
} from "@/lib/store";
import {
  Plus,
  Search,
  Tag,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
  Percent,
  Calendar,
} from "lucide-react";
import { formatINR } from "@/lib/business-config";
export function AdminOffers() {
  useStoreSync();
  const [dbOffers, setDbOffers] = useState(null);
  const [loading, setLoading] = useState(false);
  const loadOffers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getOffers();
      if (res.success && Array.isArray(res.data)) {
        const mapped = res.data.map((d) => ({
          id: d.id,
          code: d.code,
          title: d.title,
          description: d.description || "",
          discountType: d.discount_type,
          discountValue: Number(d.discount_value),
          minOrderAmount: Number(d.min_order_amount),
          maxDiscount: d.max_discount ? Number(d.max_discount) : undefined,
          category: d.applicable_category || "All",
          applicableCategory: d.applicable_category || "All",
          startDate: d.valid_from,
          endDate: d.valid_until,
          validFrom: d.valid_from,
          validUntil: d.valid_until,
          status: d.status,
          createdAt: d.created_at,
        }));
        setDbOffers(mapped);
      }
    } catch (err) {
      console.warn("Could not fetch offers from backend:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadOffers();
  }, []);
  const offers = dbOffers !== null ? dbOffers : getAdminOffers();
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  // Form States
  const [formCode, setFormCode] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDiscountType, setFormDiscountType] = useState("PERCENTAGE");
  const [formDiscountValue, setFormDiscountValue] = useState("");
  const [formMinOrder, setFormMinOrder] = useState("");
  const [formMaxDiscount, setFormMaxDiscount] = useState("");
  const [formCategory, setFormCategory] = useState("All");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formStatus, setFormStatus] = useState("ACTIVE");
  const [formError, setFormError] = useState("");
  // Stats
  const totalOffers = offers.length;
  const activeOffers = offers.filter((o) => o.status === "ACTIVE").length;
  const pausedOffers = offers.filter((o) => o.status === "PAUSED").length;
  const avgDiscount =
    totalOffers > 0
      ? Math.round(
          offers.reduce(
            (acc, o) => acc + (o.discountType === "PERCENTAGE" ? o.discountValue : 15),
            0,
          ) / totalOffers,
        )
      : 0;
  // Filtered offers
  const filteredOffers = offers.filter((o) => {
    const matchesSearch =
      o.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.category || o.applicableCategory || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const handleOpenCreateModal = () => {
    setEditingOffer(null);
    setFormCode("");
    setFormTitle("");
    setFormDescription("");
    setFormDiscountType("PERCENTAGE");
    setFormDiscountValue(20);
    setFormMinOrder(1999);
    setFormMaxDiscount(1500);
    setFormCategory("All");
    const today = new Date().toISOString().split("T")[0];
    const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];
    setFormStartDate(today);
    setFormEndDate(nextMonth);
    setFormStatus("ACTIVE");
    setFormError("");
    setIsEditModalOpen(true);
  };
  const handleOpenEditModal = (offer) => {
    setEditingOffer(offer);
    setFormCode(offer.code);
    setFormTitle(offer.title);
    setFormDescription(offer.description);
    setFormDiscountType(offer.discountType);
    setFormDiscountValue(offer.discountValue);
    setFormMinOrder(offer.minOrderAmount);
    setFormMaxDiscount(offer.maxDiscount || "");
    setFormCategory(offer.category || offer.applicableCategory || "All");
    const sDate = offer.startDate || offer.validFrom;
    setFormStartDate(sDate ? sDate.split("T")[0] : "");
    const eDate = offer.endDate || offer.validUntil;
    setFormEndDate(eDate ? eDate.split("T")[0] : "");
    setFormStatus(offer.status);
    setFormError("");
    setIsEditModalOpen(true);
  };
  const handleSaveOffer = (e) => {
    e.preventDefault();
    setFormError("");
    const code = formCode.trim().toUpperCase();
    const title = formTitle.trim();
    const discountVal = Number(formDiscountValue);
    if (!code || !title) {
      setFormError("Coupon Code and Title are required.");
      return;
    }
    if (isNaN(discountVal) || discountVal <= 0) {
      setFormError("Please enter a valid positive discount value.");
      return;
    }
    if (formDiscountType === "PERCENTAGE" && discountVal > 100) {
      setFormError("Percentage discount cannot exceed 100%.");
      return;
    }
    const startIso = formStartDate || new Date().toISOString();
    const endIso = formEndDate || new Date(Date.now() + 30 * 86400000).toISOString();
    const payload = {
      code,
      title,
      description: formDescription.trim(),
      discount_type: formDiscountType,
      discount_value: discountVal,
      min_order_amount: Number(formMinOrder) || 0,
      max_discount: formMaxDiscount ? Number(formMaxDiscount) : null,
      applicable_category: formCategory,
      valid_from: startIso,
      valid_until: endIso,
      status: formStatus,
    };
    if (editingOffer) {
      updateAdminOffer(editingOffer.id, {
        code,
        title,
        description: formDescription.trim(),
        discountType: formDiscountType,
        discountValue: discountVal,
        minOrderAmount: Number(formMinOrder) || 0,
        maxDiscount: formMaxDiscount ? Number(formMaxDiscount) : undefined,
        category: formCategory,
        applicableCategory: formCategory,
        validFrom: startIso,
        validUntil: endIso,
        startDate: startIso,
        endDate: endIso,
        status: formStatus,
      });
      adminApi
        .updateOffer(editingOffer.id, payload)
        .then(() => loadOffers())
        .catch(() => {});
    } else {
      createAdminOffer({
        code,
        title,
        description: formDescription.trim(),
        discountType: formDiscountType,
        discountValue: discountVal,
        minOrderAmount: Number(formMinOrder) || 0,
        maxDiscount: formMaxDiscount ? Number(formMaxDiscount) : undefined,
        category: formCategory,
        applicableCategory: formCategory,
        validFrom: startIso,
        validUntil: endIso,
        startDate: startIso,
        endDate: endIso,
        status: formStatus,
      });
      adminApi
        .createOffer(payload)
        .then(() => loadOffers())
        .catch(() => {});
    }
    setIsEditModalOpen(false);
  };
  const handleConfirmDelete = () => {
    if (deleteTargetId) {
      deleteAdminOffer(deleteTargetId);
      adminApi
        .deleteOffer(deleteTargetId)
        .then(() => loadOffers())
        .catch(() => {});
      setDeleteTargetId(null);
    }
  };
  return (
    <AdminShell
      title="Special Offers Management"
      subtitle="Create, configure, and control storefront promotions and promotional rates"
      actions={
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-[#8B1E3F] text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#5E0F27] transition shadow-xs cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Create Special Offer</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* KPI Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-[#E5DCCD] bg-white p-4 shadow-subtle flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#8B1E3F]/10 text-[#8B1E3F] flex items-center justify-center font-bold">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
                Total Offers
              </p>
              <h3 className="text-xl font-bold text-[#0D1B2A]">{totalOffers}</h3>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E5DCCD] bg-white p-4 shadow-subtle flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#2E7D6B]/10 text-[#2E7D6B] flex items-center justify-center font-bold">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
                Active Live
              </p>
              <h3 className="text-xl font-bold text-[#2E7D6B]">{activeOffers}</h3>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E5DCCD] bg-white p-4 shadow-subtle flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#6B7280]/10 text-[#6B7280] flex items-center justify-center font-bold">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
                Paused Offers
              </p>
              <h3 className="text-xl font-bold text-[#6B7280]">{pausedOffers}</h3>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E5DCCD] bg-white p-4 shadow-subtle flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#C8A96E]/15 text-[#8B1E3F] flex items-center justify-center font-bold">
              <Percent className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
                Avg Discount
              </p>
              <h3 className="text-xl font-bold text-[#0D1B2A]">~{avgDiscount}%</h3>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 rounded-2xl border border-[#E5DCCD] shadow-subtle">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Search code, title, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E5DCCD] bg-[#FAF8F5] focus:outline-none focus:border-[#8B1E3F]"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            {["ALL", "ACTIVE", "PAUSED"].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  statusFilter === tab
                    ? "bg-[#8B1E3F] text-white shadow-xs"
                    : "bg-[#FAF8F5] text-[#6B7280] hover:text-[#0D1B2A]"
                }`}
              >
                {tab === "ALL" ? "All Offers" : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Offers Table */}
        <div className="rounded-3xl border border-[#E5DCCD] bg-white overflow-hidden shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left min-w-[800px]">
              <thead className="bg-[#FAF6EE] text-[10px] uppercase font-bold text-[#6B7280] border-b border-[#E5DCCD]">
                <tr>
                  <th className="px-5 py-3.5">Promo Code & Title</th>
                  <th className="py-3.5">Discount Value</th>
                  <th className="py-3.5">Min Order / Cap</th>
                  <th className="py-3.5">Category Scope</th>
                  <th className="py-3.5">Validity Dates</th>
                  <th className="py-3.5 text-center">Status</th>
                  <th className="py-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DCCD]/60 font-medium text-[#0D1B2A]">
                {filteredOffers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-[#6B7280]">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2 text-[#C8A96E]/80" />
                      <p className="font-semibold text-sm text-[#0D1B2A]">
                        No Special Offers Found
                      </p>
                      <p className="text-xs mt-1">
                        Try adjusting your search query or create a new offer.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredOffers.map((o) => {
                    const isPaused = o.status === "PAUSED";
                    return (
                      <tr key={o.id} className="hover:bg-[#FAF8F5] transition">
                        {/* Promo Code & Title */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-[#8B1E3F] bg-[#8B1E3F]/10 px-2 py-0.5 rounded-md border border-[#8B1E3F]/20">
                              {o.code}
                            </span>
                            <span className="font-bold text-[#0D1B2A]">{o.title}</span>
                          </div>
                          {o.description && (
                            <p className="text-[10px] text-[#6B7280] mt-0.5 max-w-xs truncate">
                              {o.description}
                            </p>
                          )}
                        </td>

                        {/* Discount Value */}
                        <td className="py-3.5">
                          <span className="font-bold text-[#0D1B2A] text-sm">
                            {o.discountType === "PERCENTAGE"
                              ? `${o.discountValue}% OFF`
                              : formatINR(o.discountValue)}
                          </span>
                          <span className="block text-[10px] text-[#6B7280] font-normal uppercase">
                            {o.discountType}
                          </span>
                        </td>

                        {/* Min Order & Cap */}
                        <td className="py-3.5">
                          <span className="text-[#0D1B2A] font-semibold">
                            Min {formatINR(o.minOrderAmount)}
                          </span>
                          {o.maxDiscount && (
                            <span className="block text-[10px] text-[#6B7280]">
                              Cap: {formatINR(o.maxDiscount)}
                            </span>
                          )}
                        </td>

                        {/* Category */}
                        <td className="py-3.5">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-[#FAF6EE] text-[#0D1B2A] text-[10px] font-semibold border border-[#E5DCCD]">
                            {o.category || o.applicableCategory || "All Categories"}
                          </span>
                        </td>

                        {/* Validity Dates */}
                        <td className="py-3.5 text-[#6B7280]">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-[#A88448]" />
                            <span>
                              {o.endDate || o.validUntil
                                ? new Date(o.endDate || o.validUntil).toLocaleDateString("en-IN", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : "Ongoing"}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 text-center">
                          <button
                            onClick={() => toggleAdminOfferStatus(o.id)}
                            className="inline-flex items-center gap-1.5 focus:outline-none cursor-pointer"
                            title="Click to toggle status"
                          >
                            <span
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                                !isPaused
                                  ? "bg-[#2E7D6B]/10 text-[#2E7D6B]"
                                  : "bg-[#6B7280]/10 text-[#6B7280]"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${!isPaused ? "bg-[#2E7D6B]" : "bg-[#6B7280]"}`}
                              />
                              {o.status}
                            </span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 pr-5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditModal(o)}
                              className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#0D1B2A] hover:bg-black/5 transition cursor-pointer"
                              title="Edit offer"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTargetId(o.id)}
                              className="p-1.5 rounded-lg text-[#8B1E3F] hover:bg-[#8B1E3F]/10 transition cursor-pointer"
                              title="Delete offer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
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

      {/* CREATE / EDIT OFFER MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-[#E5DCCD] max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E5DCCD]">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-[#8B1E3F]" />
                <h3 className="text-base font-bold text-[#0D1B2A]">
                  {editingOffer ? "Edit Special Offer" : "Create New Special Offer"}
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-xl text-[#6B7280] hover:text-[#0D1B2A] hover:bg-black/5 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Error banner */}
            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-[#8B1E3F]/10 border border-[#8B1E3F]/20 text-[#8B1E3F] text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveOffer} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1">
                    Offer Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BRIDAL30"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5DCCD] font-mono font-bold uppercase focus:outline-none focus:border-[#8B1E3F]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1">
                    Offer Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bridal Luxury Discount"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5DCCD] focus:outline-none focus:border-[#8B1E3F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Save ₹1,500 on all pure silk bridal blouses"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5DCCD] focus:outline-none focus:border-[#8B1E3F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1">
                    Discount Type
                  </label>
                  <select
                    value={formDiscountType}
                    onChange={(e) => setFormDiscountType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5DCCD] bg-white focus:outline-none focus:border-[#8B1E3F]"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder={formDiscountType === "PERCENTAGE" ? "20" : "500"}
                    value={formDiscountValue}
                    onChange={(e) =>
                      setFormDiscountValue(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5DCCD] font-bold focus:outline-none focus:border-[#8B1E3F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1">
                    Min Order Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formMinOrder}
                    onChange={(e) =>
                      setFormMinOrder(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5DCCD] focus:outline-none focus:border-[#8B1E3F]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Optional cap"
                    value={formMaxDiscount}
                    onChange={(e) =>
                      setFormMaxDiscount(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5DCCD] focus:outline-none focus:border-[#8B1E3F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1">
                    Category Restriction
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5DCCD] bg-white focus:outline-none focus:border-[#8B1E3F]"
                  >
                    <option value="All">All Categories</option>
                    <option value="Bridal Blouses">Bridal Blouses</option>
                    <option value="Wedding Blouses">Wedding Blouses</option>
                    <option value="Banarasi Blouses">Banarasi Blouses</option>
                    <option value="Night Suits">Night Suits</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5DCCD] bg-white focus:outline-none focus:border-[#8B1E3F]"
                  >
                    <option value="ACTIVE">Active (Live in Store)</option>
                    <option value="PAUSED">Paused (Disabled)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5DCCD] focus:outline-none focus:border-[#8B1E3F]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5DCCD] focus:outline-none focus:border-[#8B1E3F]"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 flex items-center justify-end gap-2 border-t border-[#E5DCCD]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E5DCCD] text-xs font-bold text-[#6B7280] hover:bg-[#FAF8F5] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#8B1E3F] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#5E0F27] transition shadow-xs cursor-pointer"
                >
                  {editingOffer ? "Update Offer" : "Create Offer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-[#E5DCCD]">
            <div className="flex items-center gap-3 text-[#8B1E3F] mb-3">
              <div className="h-10 w-10 rounded-2xl bg-[#8B1E3F]/10 flex items-center justify-center">
                <Trash2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-[#0D1B2A]">Delete Special Offer?</h3>
            </div>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              This action cannot be undone. Any customers with this promo code will no longer be
              eligible for the discount.
            </p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="px-4 py-2 rounded-xl border border-[#E5DCCD] text-xs font-bold text-[#6B7280] hover:bg-[#FAF8F5] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-[#8B1E3F] text-white text-xs font-bold hover:bg-[#5E0F27] transition shadow-xs cursor-pointer"
              >
                Yes, Delete Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
export default AdminOffers;
