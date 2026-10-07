import React, { useState, useEffect, useCallback } from "react";
import { AdminShell } from "@/components/app/AdminShell";
import { adminApi } from "@/services/api/index";
import {
  Download,
  Search,
  Eye,
  RefreshCw,
  X,
  CheckCircle2,
  Truck,
  Package,
  Clock,
  Send,
  AlertCircle,
} from "lucide-react";
import { formatINR } from "@/lib/business-config";

export function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State for Order Details & Status Update
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [courierPartner, setCourierPartner] = useState("BlueDart Express Luxe");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusSuccessMsg, setStatusSuccessMsg] = useState("");

  // Custom Timeline Milestone State
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [newMilestoneDesc, setNewMilestoneDesc] = useState("");
  const [milestoneSubmitting, setMilestoneSubmitting] = useState(false);

  const loadOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getOrders(activeFilter !== "ALL" ? activeFilter : undefined);
      if (res.success && Array.isArray(res.data)) {
        setOrders(res.data);
      }
    } catch (err) {
      if (!silent) setError(err.message || "Failed to load orders from database.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    loadOrders(false);
    // Live Auto-Refresh every 4.5 seconds for instant real-time synchronization
    const timer = setInterval(() => {
      loadOrders(true);
    }, 4500);
    return () => clearInterval(timer);
  }, [loadOrders]);

  const handleOpenOrder = async (orderId) => {
    setSelectedOrderId(orderId);
    setModalLoading(true);
    setStatusSuccessMsg("");
    setNewMilestoneTitle("");
    setNewMilestoneDesc("");
    setStatusNote("");
    try {
      const res = await adminApi.getOrderDetails(orderId);
      if (res.success && res.data) {
        setOrderDetails(res.data);
        setNewStatus(res.data.order_status);
        setCourierPartner(res.data.courier_partner || "BlueDart Express Luxe");
        setTrackingNumber(res.data.tracking_number || "");
      }
    } catch (err) {
      alert(err.message || "Failed to load order details.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    if (e) e.preventDefault();
    if (!selectedOrderId || !newStatus) return;
    setStatusUpdating(true);
    setStatusSuccessMsg("");
    try {
      const payload = {
        status: newStatus,
        courierPartner: courierPartner.trim() || "BlueDart Express Luxe",
        trackingNumber: trackingNumber.trim() || (orderDetails?.tracking_number || ""),
        note: statusNote.trim() || undefined,
      };
      const res = await adminApi.updateOrderStatus(selectedOrderId, payload);
      if (res.success) {
        setStatusSuccessMsg(`Order updated to ${newStatus} successfully! Live sync dispatched.`);
        setStatusNote("");
        // Refresh details
        const updated = await adminApi.getOrderDetails(selectedOrderId);
        if (updated.success) {
          setOrderDetails(updated.data);
        }
        await loadOrders(true);
        setTimeout(() => setStatusSuccessMsg(""), 4000);
      } else {
        alert(res.message || "Failed to update order status.");
      }
    } catch (err) {
      alert(err.message || "Error updating status.");
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    if (!selectedOrderId || !newMilestoneTitle.trim()) return;
    setMilestoneSubmitting(true);
    try {
      const res = await adminApi.addOrderTimeline(
        selectedOrderId,
        newMilestoneTitle.trim(),
        newMilestoneDesc.trim(),
      );
      if (res.success) {
        setNewMilestoneTitle("");
        setNewMilestoneDesc("");
        const updated = await adminApi.getOrderDetails(selectedOrderId);
        if (updated.success) setOrderDetails(updated.data);
      }
    } catch (err) {
      alert(err.message || "Error adding timeline milestone.");
    } finally {
      setMilestoneSubmitting(false);
    }
  };

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.customer_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.customer_email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.tracking_number || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleExportCSV = () => {
    const headers =
      "Order ID,Customer,Email,Phone,City,Items Count,Total Amount,Payment Method,Payment Status,Order Status,Tracking Number,Courier Partner,Placed Date\n";
    const rows = filtered
      .map((o) => {
        const city = o.shipping_address?.city || "";
        return `"${o.id}","${o.customer_name || ""}","${o.customer_email || ""}","${o.customer_phone || ""}","${city}",${o.item_count},${o.total_amount},"${o.payment_method}","${o.payment_status}","${o.order_status}","${o.tracking_number || ""}","${o.courier_partner || ""}","${o.created_at}"`;
      })
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `hopo_orders_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminShell
      title="Orders Management"
      subtitle={`${orders.length} Live Verified Orders • MySQL Synced`}
      actions={
        <div className="flex flex-wrap items-center gap-3 w-full justify-between">
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {[
              "ALL",
              "CONFIRMED",
              "PACKED",
              "SHIPPED",
              "OUT_FOR_DELIVERY",
              "DELIVERED",
              "CANCELLED",
            ].map((t) => (
              <button
                key={t}
                onClick={() => setActiveFilter(t)}
                className={`rounded-full border px-3 py-1.5 text-xs font-bold transition uppercase tracking-wider ${
                  activeFilter === t
                    ? "bg-[#8B1E3F] text-white border-[#8B1E3F] shadow-xs"
                    : "bg-white text-[#6B7280] border-[#E5DCCD] hover:text-[#0D1B2A]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full border border-[#E5DCCD] bg-[#FAF6EE] px-3.5 py-1.5 text-xs">
              <Search className="h-3.5 w-3.5 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Search order ID or customer…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent outline-none w-36 sm:w-48 text-[#0D1B2A]"
              />
            </div>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E5DCCD] bg-white px-4 py-2 text-xs font-bold text-[#0D1B2A] hover:bg-[#FAF6EE] transition shadow-xs cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-[#8B1E3F]" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => loadOrders(false)}
              disabled={loading}
              className="p-2 rounded-full border border-[#E5DCCD] bg-white text-[#8B1E3F] hover:bg-[#FAF6EE] transition shadow-xs cursor-pointer"
              title="Refresh Orders"
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
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#6B7280] space-y-2">
            <p className="font-bold text-[#0D1B2A] text-sm">No Orders Found</p>
            <p>No customer orders match the current filter selection.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left min-w-[800px]">
              <thead className="bg-[#FAF6EE] text-[10px] uppercase font-bold text-[#6B7280] border-b border-[#E5DCCD]">
                <tr>
                  <th className="px-5 py-3.5">Order ID</th>
                  <th className="py-3.5">Customer</th>
                  <th className="py-3.5">Destination</th>
                  <th className="py-3.5 text-center">Items</th>
                  <th className="py-3.5 text-right">Total Amount</th>
                  <th className="py-3.5">Payment</th>
                  <th className="py-3.5 text-center">Order Status</th>
                  <th className="py-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DCCD]/60 font-medium text-[#0D1B2A]">
                {filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-[#FAF8F5] transition">
                    <td className="px-5 py-3 font-mono font-bold text-[#8B1E3F]">{o.id}</td>
                    <td className="py-3">
                      <p className="font-bold">{o.customer_name || "Customer"}</p>
                      <p className="text-[10px] text-[#6B7280]">
                        {o.customer_email || o.customer_phone}
                      </p>
                    </td>
                    <td className="py-3 text-[#6B7280]">
                      {o.shipping_address?.city || "India"}
                      {o.shipping_address?.state ? `, ${o.shipping_address.state}` : ""}
                    </td>
                    <td className="py-3 text-center font-bold">
                      {o.item_count} {o.item_count === 1 ? "piece" : "pieces"}
                    </td>
                    <td className="py-3 text-right font-bold text-[#0D1B2A]">
                      {formatINR(Number(o.total_amount))}
                    </td>
                    <td className="py-3">
                      <span className="text-[11px] font-bold text-[#0D1B2A] block">
                        {o.payment_method}
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase ${
                          o.payment_status === "PAID" ? "text-emerald-700" : "text-amber-700"
                        }`}
                      >
                        {o.payment_status}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span
                        className={`inline-block text-[10px] font-bold px-3 py-1 rounded-full ${
                          o.order_status === "DELIVERED"
                            ? "bg-emerald-100 text-emerald-800"
                            : o.order_status === "OUT_FOR_DELIVERY"
                              ? "bg-purple-100 text-purple-800"
                              : o.order_status === "SHIPPED"
                                ? "bg-blue-100 text-blue-800"
                                : o.order_status === "PACKED"
                                  ? "bg-amber-100 text-amber-800"
                                  : o.order_status === "CANCELLED"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-[#8B1E3F]/10 text-[#8B1E3F]"
                        }`}
                      >
                        {o.order_status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 pr-5 text-right">
                      <button
                        onClick={() => handleOpenOrder(o.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF6EE] border border-[#E5DCCD] hover:bg-[#8B1E3F] hover:text-white transition font-bold text-[11px] cursor-pointer shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage & Fulfill</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center justify-between px-6 py-4 text-xs text-[#6B7280] border-t border-[#E5DCCD] bg-[#FAF6EE]/50">
          <span>
            Showing {filtered.length} of {orders.length} Verified Orders
          </span>
          <span className="text-[#2E7D6B] font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Real-Time Auto-Refresh Active (4.5s)
          </span>
        </div>
      </div>

      {/* ORDER DETAILS & LIVE FULFILLMENT MODAL */}
      {selectedOrderId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl bg-white rounded-3xl border border-[#E5DCCD] shadow-2xl p-6 md:p-8 my-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5DCCD] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B1E3F]">
                  ORDER FULFILLMENT & LIFECYCLE
                </span>
                <h2 className="font-display text-xl font-bold text-[#0D1B2A]">
                  Order: {selectedOrderId}
                </h2>
              </div>
              <button
                onClick={() => setSelectedOrderId(null)}
                className="p-2 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalLoading || !orderDetails ? (
              <div className="py-16 text-center text-xs text-stone-500 space-y-2">
                <RefreshCw className="h-6 w-6 text-[#8B1E3F] animate-spin mx-auto" />
                <p>Loading live order ledger from MySQL...</p>
              </div>
            ) : (
              <div className="space-y-6 text-xs">
                {/* Status Update Control Panel */}
                <form
                  onSubmit={handleUpdateStatus}
                  className="p-5 bg-gradient-to-br from-[#FFFBF7] to-[#FAF6EE] border border-[#E8DCC4] rounded-3xl space-y-4 shadow-sm"
                >
                  <div className="flex items-center justify-between border-b border-[#E5DCCD] pb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B1E3F] block">
                        Current Lifecycle Status
                      </span>
                      <span className="font-display font-bold text-base text-[#0D1B2A]">
                        {orderDetails.order_status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-[#6B7280]">
                      Updated: {new Date(orderDetails.updated_at || orderDetails.created_at).toLocaleTimeString("en-IN")}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#0D1B2A] mb-1">
                        New Order Status
                      </label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#E5DCCD] bg-white font-bold text-xs focus:outline-none focus:border-[#8B1E3F]"
                      >
                        <option value="CONFIRMED">1. CONFIRMED (Order Placed)</option>
                        <option value="PACKED">2. PACKED (Quality Inspected)</option>
                        <option value="SHIPPED">3. SHIPPED (In Transit)</option>
                        <option value="OUT_FOR_DELIVERY">4. OUT_FOR_DELIVERY (Out with Courier)</option>
                        <option value="DELIVERED">5. DELIVERED (Recipient Received)</option>
                        <option value="CANCELLED">CANCELLED</option>
                        <option value="RETURN_REQUESTED">RETURN_REQUESTED</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#0D1B2A] mb-1">
                        Courier Partner
                      </label>
                      <input
                        type="text"
                        value={courierPartner}
                        onChange={(e) => setCourierPartner(e.target.value)}
                        placeholder="BlueDart Express Luxe"
                        className="w-full px-3 py-2 rounded-xl border border-[#E5DCCD] bg-white text-xs focus:outline-none focus:border-[#8B1E3F]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#0D1B2A] mb-1">
                        Tracking / AWB #
                      </label>
                      <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="BD9485C6IN"
                        className="w-full px-3 py-2 rounded-xl border border-[#E5DCCD] bg-white text-xs font-mono focus:outline-none focus:border-[#8B1E3F]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#0D1B2A] mb-1">
                      Internal Dispatch / Customer Note (Optional)
                    </label>
                    <input
                      type="text"
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      placeholder="e.g. Master artisan custom padding completed; dispatched via Air Priority."
                      className="w-full px-3 py-2 rounded-xl border border-[#E5DCCD] bg-white text-xs focus:outline-none focus:border-[#8B1E3F]"
                    />
                  </div>

                  {statusSuccessMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{statusSuccessMsg}</span>
                    </div>
                  )}

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={statusUpdating}
                      className="px-6 py-2.5 bg-[#8B1E3F] text-white rounded-xl font-bold uppercase tracking-wider hover:bg-[#780C28] disabled:opacity-40 transition shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      {statusUpdating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Updating MySQL...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Commit Status Update & Notify Customer</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Customer & Destination */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DCCD] space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B1E3F]">
                      Customer Profile
                    </span>
                    <p className="font-bold text-sm text-[#0D1B2A]">
                      {orderDetails.customer_name || "Customer"}
                    </p>
                    <p className="text-stone-600">{orderDetails.customer_email}</p>
                    <p className="text-stone-600">{orderDetails.customer_phone}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DCCD] space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B1E3F]">
                      Shipping Destination & Courier
                    </span>
                    <p className="font-bold text-stone-800">
                      {orderDetails.shipping_address?.full_name || orderDetails.customer_name}
                    </p>
                    <p className="text-stone-600">
                      {orderDetails.shipping_address?.address_line1 || orderDetails.shipping_address?.addressLine1 || ""},{" "}
                      {orderDetails.shipping_address?.address_line2 || orderDetails.shipping_address?.addressLine2 || ""}
                    </p>
                    <p className="text-stone-600">
                      {orderDetails.shipping_address?.city}, {orderDetails.shipping_address?.state}{" "}
                      - {orderDetails.shipping_address?.pincode}
                    </p>
                    <p className="text-[11px] font-mono text-[#8B1E3F] font-bold pt-1">
                      Carrier: {orderDetails.courier_partner} ({orderDetails.tracking_number || "Awaiting Manifest"})
                    </p>
                  </div>
                </div>

                {/* Items Breakdown */}
                <div>
                  <h3 className="font-bold text-sm text-[#0D1B2A] mb-3">Ensembles in Order</h3>
                  <div className="border border-[#E5DCCD] rounded-2xl overflow-hidden divide-y divide-[#E5DCCD]">
                    {orderDetails.items?.map((item, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          {item.image_url && (
                            <img
                              src={item.image_url}
                              alt={item.product_title}
                              className="w-12 h-14 object-cover rounded-lg border border-[#E5DCCD]"
                            />
                          )}
                          <div>
                            <p className="font-bold text-[#0D1B2A]">{item.product_title}</p>
                            <p className="text-[11px] text-[#6B7280]">
                              {item.brand} • Size: <span className="font-bold">{item.size}</span> •
                              Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#0D1B2A]">
                            {formatINR(Number(item.total_price))}
                          </p>
                          <p className="text-[10px] text-stone-500">{formatINR(item.unit_price)} each</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Financial Totals */}
                  <div className="mt-3 p-4 bg-[#FAF8F5] rounded-2xl space-y-1.5 text-right font-medium">
                    <div className="flex justify-between text-stone-600">
                      <span>Subtotal</span>
                      <span>{formatINR(Number(orderDetails.subtotal))}</span>
                    </div>
                    {Number(orderDetails.coupon_discount) > 0 && (
                      <div className="flex justify-between text-[#8B1E3F]">
                        <span>Coupon Discount ({orderDetails.coupon_code})</span>
                        <span>- {formatINR(Number(orderDetails.coupon_discount))}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-stone-600">
                      <span>GST & Express Courier</span>
                      <span>
                        {formatINR(
                          Number(orderDetails.gst_amount) + Number(orderDetails.shipping_fee),
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-[#0D1B2A] border-t border-[#E5DCCD] pt-2">
                      <span>Total Paid</span>
                      <span>{formatINR(Number(orderDetails.total_amount))}</span>
                    </div>
                  </div>
                </div>

                {/* Timeline History */}
                <div>
                  <h3 className="font-bold text-sm text-[#0D1B2A] mb-3">Fulfillment Event Milestones</h3>
                  <div className="space-y-3 border-l-2 border-[#8B1E3F] pl-4 ml-2">
                    {orderDetails.timeline?.map((tl, idx) => (
                      <div key={idx} className="relative space-y-0.5">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#8B1E3F]" />
                        <p className="font-bold text-stone-800">{tl.title}</p>
                        <p className="text-stone-600 text-[11px]">{tl.description}</p>
                        <p className="text-[10px] text-stone-400 font-mono">
                          {new Date(tl.event_time || tl.timestamp).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Add Milestone Form */}
                  <form
                    onSubmit={handleAddMilestone}
                    className="mt-4 p-3 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col sm:flex-row gap-2"
                  >
                    <input
                      type="text"
                      required
                      placeholder="Milestone title (e.g. Courier Dispatched)"
                      value={newMilestoneTitle}
                      onChange={(e) => setNewMilestoneTitle(e.target.value)}
                      className="flex-1 px-3 py-2 border border-stone-300 rounded-xl text-xs bg-white focus:outline-none focus:border-[#8B1E3F]"
                    />
                    <input
                      type="text"
                      placeholder="Custom notes or comments..."
                      value={newMilestoneDesc}
                      onChange={(e) => setNewMilestoneDesc(e.target.value)}
                      className="flex-1 px-3 py-2 border border-stone-300 rounded-xl text-xs bg-white focus:outline-none focus:border-[#8B1E3F]"
                    />
                    <button
                      type="submit"
                      disabled={milestoneSubmitting}
                      className="px-5 py-2 bg-stone-800 text-white rounded-xl font-bold hover:bg-black text-xs shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      {milestoneSubmitting ? "Adding..." : "+ Add Milestone"}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminShell>
  );
}

export default OrdersAdmin;
