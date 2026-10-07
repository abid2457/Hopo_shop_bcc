import { Link, useParams, useLocation, Navigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { AppHeader, MobileFrame } from "@/components/app/MobileShell";
import { getOrders, getAuthUser, useStoreSync } from "@/lib/store";
import { orderApi } from "@/services/api/index";
import { HopoImage } from "@/components/app/HopoImage";
import { formatINR } from "@/lib/business-config";
import {
  CheckCircle2,
  MapPin,
  FileText,
  MessageSquare,
  RotateCcw,
  ShieldAlert,
  Truck,
  RefreshCw,
} from "lucide-react";

export function OrderDetailsPage() {
  useStoreSync();
  const { id } = useParams();
  const location = useLocation();
  const user = getAuthUser();

  const [liveOrder, setLiveOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Unauthenticated Guard
  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  const allStoreOrders = getOrders();
  const customerOrders =
    user.role === "ADMIN" ? allStoreOrders : allStoreOrders.filter((o) => o.userId === user.id);
  const cachedOrder = customerOrders.find((o) => o.id.toLowerCase() === (id || "").toLowerCase());

  const fetchLive = useCallback(async (silent = false) => {
    if (!id) return;
    if (!silent) setLoading(true);
    try {
      const res = await orderApi.getOrderById(id);
      if (res && res.success && res.data) {
        setLiveOrder(res.data);
      }
    } catch {
      // Fallback
    } finally {
      if (!silent) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLive(false);
    const interval = setInterval(() => {
      fetchLive(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchLive]);

  const rawOrder = liveOrder || cachedOrder;

  // 3. Access Restricted / Not Found Guard
  if (!loading && !rawOrder) {
    return (
      <MobileFrame>
        <AppHeader title="Order Details" back showSearch={false} showBell={false} />
        <div className="py-14 px-4 max-w-lg mx-auto text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F] grid place-items-center mx-auto shadow-inner">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="font-display font-bold text-xl sm:text-2xl text-[#0D1B2A]">
            Order Access Restricted
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
            Order <strong className="text-[#0D1B2A]">#{id}</strong> was not found under your account
            (<span className="font-semibold text-[#8B1E3F]">{user.email || user.phone}</span>). For
            your security, order records are restricted to the purchasing customer.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Link
              to="/orders"
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#8B1E3F] text-white font-bold text-xs uppercase tracking-widest hover:bg-[#5E0F27] transition shadow-md"
            >
              View Your Orders
            </Link>
            <Link
              to="/order-tracking"
              className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-[#E5DCCD] bg-white text-[#0D1B2A] font-bold text-xs uppercase tracking-widest hover:bg-[#F7F2E9] transition"
            >
              Track Recent Order
            </Link>
          </div>
        </div>
      </MobileFrame>
    );
  }

  if (loading && !rawOrder) {
    return (
      <MobileFrame>
        <AppHeader title="Order Details" back showSearch={false} showBell={false} />
        <div className="py-24 text-center space-y-3">
          <RefreshCw className="h-7 w-7 text-[#8B1E3F] animate-spin mx-auto" />
          <p className="text-xs text-[#6B7280] font-semibold">Loading Verified Order Data...</p>
        </div>
      </MobileFrame>
    );
  }

  const statusNorm = (rawOrder.orderStatus || rawOrder.order_status || "CONFIRMED").toUpperCase();
  const isConfirmed = statusNorm === "CONFIRMED";
  const isPacked = ["PACKED", "PROCESSING", "TAILORING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(statusNorm);
  const isShipped = ["SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(statusNorm);
  const isOut = ["OUT_FOR_DELIVERY", "DELIVERED"].includes(statusNorm);
  const isDelivered = statusNorm === "DELIVERED";

  const order = {
    id: rawOrder.id,
    date: new Date(rawOrder.createdAt || rawOrder.created_at || Date.now()).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    status: statusNorm === "CONFIRMED" ? "Confirmed" : statusNorm.replace(/_/g, " "),
    total: rawOrder.totalAmount || rawOrder.total_amount,
    payment: rawOrder.paymentMethod || rawOrder.payment_method || "COD",
    deliveredOn: rawOrder.estimatedDeliveryDate || rawOrder.estimated_delivery || "Few Days",
    address: `${rawOrder.deliveryAddress?.addressLine1 || rawOrder.shipping_address?.address_line1 || ""}, ${rawOrder.deliveryAddress?.city || rawOrder.shipping_address?.city || "India"} ${rawOrder.deliveryAddress?.pincode || rawOrder.shipping_address?.pincode || ""}`,
    name: rawOrder.deliveryAddress?.fullName || rawOrder.shipping_address?.full_name || rawOrder.customer_name || user.name || "Customer",
    items: (rawOrder.items || []).map((it) => ({
      id: it.id || it.product_id,
      title: it.title || it.product_title,
      qty: it.qty || it.quantity || 1,
      price: (it.price || it.unit_price || 0) * (it.qty || it.quantity || 1),
      image: it.image || it.image_url,
      size: it.size,
      selectedColor: it.selectedColor || it.color,
      category: it.category,
      brand: it.brand,
    })),
  };

  const steps = [
    { label: "Order placed", time: order.date, done: true },
    { label: "Quality Inspection & Packed", time: isPacked ? "Completed" : "In Queue", done: isPacked },
    { label: "Shipped via BlueDart Luxe", time: isShipped ? "Dispatched" : "Pending Handover", done: isShipped },
    {
      label: "Out for Delivery",
      time: isOut ? "En Route Today" : "Upcoming",
      done: isOut,
    },
    {
      label: "Delivered to Doorstep",
      time: isDelivered ? "Delivered" : `Est. ${order.deliveredOn}`,
      done: isDelivered,
    },
  ];

  return (
    <MobileFrame>
      <AppHeader title={order.id} back showSearch={false} showBell={false} />

      <section className="px-4 pt-2">
        <div className="rounded-2xl border border-[#E5DCCD] bg-white p-4 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#6B7280]">Placed on {order.date}</span>
            <span className="text-[10px] uppercase tracking-wider bg-[#8B1E3F]/10 text-[#8B1E3F] px-2.5 py-1 rounded-full font-bold border border-[#8B1E3F]/20">
              {order.status}
            </span>
          </div>

          <p className="font-display text-2xl font-bold text-[#0D1B2A] mt-3">{formatINR(order.total)}</p>
          <p className="text-xs text-[#6B7280] mt-0.5">
            {order.items.length} ensemble(s) • Paid via {order.payment}
          </p>

          <div className="mt-4 pt-4 border-t border-[#E5DCCD] grid grid-cols-3 gap-2 text-xs">
            <Link
              to="/gst-invoice"
              className="flex flex-col items-center gap-1 p-2 rounded-xl bg-[#FAF8F5] text-center hover:bg-[#F7F2E9] border border-[#E5DCCD] font-semibold"
            >
              <FileText className="h-4 w-4 text-[#8B1E3F]" /> Invoice
            </Link>
            <Link
              to="/support-chat"
              className="flex flex-col items-center gap-1 p-2 rounded-xl bg-[#FAF8F5] text-center hover:bg-[#F7F2E9] border border-[#E5DCCD] font-semibold"
            >
              <MessageSquare className="h-4 w-4 text-[#8B1E3F]" /> Concierge
            </Link>
            <Link
              to="/returns"
              className="flex flex-col items-center gap-1 p-2 rounded-xl bg-[#FAF8F5] text-center hover:bg-[#F7F2E9] border border-[#E5DCCD] font-semibold"
            >
              <RotateCcw className="h-4 w-4 text-[#8B1E3F]" /> Return
            </Link>
          </div>
        </div>
      </section>

      {/* Live Stepper */}
      <section className="px-4 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-base text-[#0D1B2A]">Fulfillment Status</h2>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span> Live Synced
          </span>
        </div>
        <div className="rounded-2xl border border-[#E5DCCD] bg-white p-4 shadow-subtle">
          <ol className="relative pl-6 space-y-4">
            {steps.map((s, i) => (
              <li key={s.label} className="relative">
                <span
                  className={`absolute -left-6 top-0.5 grid place-items-center h-4 w-4 rounded-full ${s.done ? "bg-[#8B1E3F] text-white" : "bg-[#FAF8F5] text-[#9CA3AF] border border-[#E5DCCD]"}`}
                >
                  <CheckCircle2 className="h-3 w-3" />
                </span>
                {i < steps.length - 1 && (
                  <span
                    className={`absolute -left-[18px] top-4 bottom-0 w-px ${s.done ? "bg-[#8B1E3F]" : "bg-[#E5DCCD]"}`}
                  />
                )}
                <p className={`text-xs sm:text-sm font-bold ${s.done ? "text-[#0D1B2A]" : "text-[#9CA3AF]"}`}>
                  {s.label}
                </p>
                <p className="text-[11px] text-[#6B7280]">{s.time}</p>
              </li>
            ))}
          </ol>

          <Link
            to={`/order-tracking?orderId=${order.id}`}
            className="mt-4 block text-center text-xs text-[#8B1E3F] font-bold uppercase tracking-wider hover:underline pt-2 border-t border-[#E5DCCD]"
          >
            Open Full Courier Radar & Waybill →
          </Link>
        </div>
      </section>

      {/* Items in Order */}
      <section className="px-4 mt-5 space-y-3">
        <h2 className="font-display font-bold text-base text-[#0D1B2A]">Ensembles ({order.items.length})</h2>
        {order.items.map((it, i) => (
          <div key={i} className="flex items-center gap-3 rounded-2xl border border-[#E5DCCD] bg-white p-3 shadow-xs">
            <div className="h-16 w-16 rounded-xl overflow-hidden bg-[#FAF8F5] shrink-0 border border-[#E5DCCD]">
              <HopoImage
                src={it.image}
                alt={it.title}
                title={it.title}
                productId={it.id}
                category={it.category}
                brand={it.brand}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#0D1B2A] line-clamp-2">{it.title}</p>
              <p className="text-[11px] text-[#6B7280]">
                {it.size ? `Size: ${it.size} • ` : ""}
                {it.selectedColor ? `Color: ${it.selectedColor} • ` : ""}
                Qty {it.qty}
              </p>
            </div>
            <p className="text-sm font-bold text-[#0D1B2A]">{formatINR(it.price)}</p>
          </div>
        ))}
      </section>

      {/* Destination & Payment Details */}
      <section className="px-4 mt-5 space-y-3">
        <h2 className="font-display font-bold text-base text-[#0D1B2A]">Delivery & Payment</h2>
        <div className="rounded-2xl border border-[#E5DCCD] bg-white p-4 text-xs sm:text-sm space-y-2 shadow-xs">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-[#8B1E3F] mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-[#0D1B2A]">{order.name} • Destination</p>
              <p className="text-[#6B7280] text-xs leading-relaxed mt-0.5">
                {order.address}
              </p>
            </div>
          </div>
          <p className="text-xs text-[#6B7280] pt-1 border-t border-[#E5DCCD]">Paid via <strong className="text-[#0D1B2A]">{order.payment}</strong></p>
        </div>

        <div className="rounded-2xl border border-[#E5DCCD] bg-white p-4 text-xs sm:text-sm space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-[#6B7280]">
            <span>Subtotal</span>
            <span>{formatINR(order.total)}</span>
          </div>
          <div className="flex items-center justify-between text-emerald-700 font-bold">
            <span>Express Courier</span>
            <span>FREE (Complimentary)</span>
          </div>
          <div className="border-t border-[#E5DCCD] my-2" />
          <div className="flex items-center justify-between font-bold text-sm text-[#0D1B2A]">
            <span>Total Paid</span>
            <span>{formatINR(order.total)}</span>
          </div>
        </div>
      </section>

      <section className="px-4 mt-5 grid grid-cols-3 gap-2 pb-8">
        <Link
          to="/returns"
          className="flex flex-col items-center gap-1 rounded-2xl border border-[#E5DCCD] bg-white p-3 text-[11px] font-bold text-[#0D1B2A] hover:bg-[#FAF8F5]"
        >
          <RotateCcw className="h-4 w-4 text-[#8B1E3F]" /> Return
        </Link>
        <Link
          to="/gst-invoice"
          className="flex flex-col items-center gap-1 rounded-2xl border border-[#E5DCCD] bg-white p-3 text-[11px] font-bold text-[#0D1B2A] hover:bg-[#FAF8F5]"
        >
          <FileText className="h-4 w-4 text-[#8B1E3F]" /> Invoice
        </Link>
        <Link
          to="/support-chat"
          className="flex flex-col items-center gap-1 rounded-2xl border border-[#E5DCCD] bg-white p-3 text-[11px] font-bold text-[#0D1B2A] hover:bg-[#FAF8F5]"
        >
          <MessageSquare className="h-4 w-4 text-[#8B1E3F]" /> Help Desk
        </Link>
      </section>
    </MobileFrame>
  );
}

export default OrderDetailsPage;
