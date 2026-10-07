import { Link, useSearchParams, useParams, useLocation, Navigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { MobileFrame, AppHeader, BottomNav } from "@/components/app/MobileShell";
import {
  CheckCircle2,
  Package,
  Truck,
  Mail,
  MessageCircle,
  Clock,
  ShieldAlert,
  Radio,
  Sparkles,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { useStoreSync, getOrders, getAuthUser } from "@/lib/store";
import { orderApi } from "@/services/api/index";
import { formatINR, BUSINESS_CONFIG } from "@/lib/business-config";
import { normalizeCategoryName } from "@/lib/catalog-service";
import { HopoImage } from "@/components/app/HopoImage";

const STAGES = [
  {
    key: "CONFIRMED",
    label: "Order Confirmed",
    desc: "Payment & couture measurements verified",
    icon: CheckCircle2,
  },
  {
    key: "PACKED",
    label: "Quality Checked & Packed",
    desc: "Master artisan 12-point inspection in heirloom crate",
    icon: Package,
  },
  {
    key: "SHIPPED",
    label: "Dispatched / In Transit",
    desc: "Handed over to express air courier partner",
    icon: Truck,
  },
  {
    key: "OUT_FOR_DELIVERY",
    label: "Out for Delivery",
    desc: "Executive delivering to your doorstep today",
    icon: MapPin,
  },
  {
    key: "DELIVERED",
    label: "Delivered",
    desc: "Safely received with signature verification",
    icon: Sparkles,
  },
];

function getStageIndex(status) {
  const norm = (status || "").toUpperCase();
  switch (norm) {
    case "CONFIRMED":
      return 0;
    case "PACKED":
    case "PROCESSING":
    case "TAILORING":
      return 1;
    case "SHIPPED":
    case "DISPATCHED":
      return 2;
    case "OUT_FOR_DELIVERY":
      return 3;
    case "DELIVERED":
      return 4;
    case "CANCELLED":
    case "RETURN_REQUESTED":
      return -1;
    default:
      return 0;
  }
}

export function OrderTracking() {
  useStoreSync();
  const location = useLocation();
  const user = getAuthUser();
  const { id: pathId } = useParams();
  const [searchParams] = useSearchParams();
  const orderIdParam = searchParams.get("orderId") || searchParams.get("id") || pathId;

  const [liveOrder, setLiveOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState(new Date());

  // 1. Unauthenticated Guard
  if (!user) {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${returnUrl}`} replace />;
  }

  const localOrders = getOrders();
  const customerOrders =
    user.role === "ADMIN" ? localOrders : localOrders.filter((o) => o.userId === user.id);

  // Live Fetch & Fast Polling
  const fetchLiveOrder = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      if (orderIdParam) {
        const res = await orderApi.getOrderById(orderIdParam.trim());
        if (res && res.success && res.data) {
          setLiveOrder(res.data);
          setLastSyncTime(new Date());
          return;
        }
      }
      // If no ID or ID not found via API, fetch user's full order list
      const listRes = await orderApi.getOrders();
      if (listRes && listRes.success && Array.isArray(listRes.data) && listRes.data.length > 0) {
        let match = null;
        if (orderIdParam) {
          match = listRes.data.find(
            (o) => o.id.toLowerCase() === orderIdParam.trim().toLowerCase(),
          );
        }
        setLiveOrder(match || listRes.data[0]);
        setLastSyncTime(new Date());
        return;
      }
    } catch {
      // Fallback to local store cache
    } finally {
      if (!silent) setLoading(false);
    }
  }, [orderIdParam]);

  useEffect(() => {
    fetchLiveOrder(false);
    // Live Auto-Polling every 3.5 seconds for instant real-time status changes
    const timer = setInterval(() => {
      fetchLiveOrder(true);
    }, 3500);
    return () => clearInterval(timer);
  }, [fetchLiveOrder]);

  const activeOrder = liveOrder || (orderIdParam ? customerOrders.find((o) => o.id.toLowerCase() === orderIdParam.trim().toLowerCase()) : customerOrders[0]);

  // Handle zero orders
  if (!loading && !activeOrder && customerOrders.length === 0) {
    return (
      <MobileFrame>
        <AppHeader title="Track Your Order" back />
        <div className="py-16 text-center space-y-4 px-4">
          <div className="h-16 w-16 rounded-full bg-[#FAF6EE] text-[#8B1E3F] grid place-items-center mx-auto shadow-inner">
            <Package className="h-8 w-8" />
          </div>
          <h2 className="font-display font-bold text-xl text-[#0D1B2A]">
            No Active Orders to Track
          </h2>
          <p className="text-xs text-[#6B7280]">
            Once you place an order, live atelier progress and courier tracking updates will appear here in real time.
          </p>
          <Link
            to="/listing"
            className="inline-block px-7 py-3 rounded-full bg-[#8B1E3F] text-white font-bold text-xs uppercase tracking-widest hover:bg-[#5E0F27] transition shadow-md"
          >
            Start Shopping
          </Link>
        </div>
        <BottomNav active="profile" />
      </MobileFrame>
    );
  }

  if (loading && !activeOrder) {
    return (
      <MobileFrame>
        <AppHeader title="Track Your Order" back />
        <div className="py-24 text-center space-y-3">
          <RefreshCw className="h-7 w-7 text-[#8B1E3F] animate-spin mx-auto" />
          <p className="text-xs text-[#6B7280] font-semibold">Connecting to Live Courier & Atelier Radar...</p>
        </div>
        <BottomNav active="profile" />
      </MobileFrame>
    );
  }

  const currentStageIndex = getStageIndex(activeOrder.orderStatus);
  const isCancelled = activeOrder.orderStatus === "CANCELLED";
  const isReturn = activeOrder.orderStatus === "RETURN_REQUESTED";

  return (
    <MobileFrame>
      <AppHeader title="Live Order Tracking" back />

      {/* Live Sync Status Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 mb-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-800 font-bold">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Live Atelier & Courier Radar Active</span>
        </div>
        <button
          onClick={() => fetchLiveOrder(false)}
          className="text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1 cursor-pointer"
        >
          <RefreshCw className="h-2.5 w-2.5" />
          <span>Sync Now</span>
        </button>
      </div>

      {/* Multi-order switcher if customer has more than 1 order */}
      {customerOrders.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2 scrollbar-none">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] shrink-0">
            Your Orders:
          </span>
          {customerOrders.map((o) => (
            <Link
              key={o.id}
              to={`/order-tracking?orderId=${o.id}`}
              className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition ${
                o.id === activeOrder.id
                  ? "bg-[#8B1E3F] text-white shadow-xs"
                  : "bg-white border border-[#E5DCCD] text-[#0D1B2A] hover:border-[#8B1E3F]/40"
              }`}
            >
              #{o.id}
            </Link>
          ))}
        </div>
      )}

      {/* Header Banner */}
      <div>
        <div className="rounded-3xl bg-gradient-to-r from-[#3d0d1b] via-[#5e0f27] to-[#8B1E3F] text-white p-6 sm:p-7 shadow-luxury border border-[#C8A96E]/40">
          <div className="flex items-center justify-between text-[#C8A96E] text-[10px] sm:text-xs font-bold uppercase tracking-widest">
            <span>Order ID: #{activeOrder.id}</span>
            <span className="bg-[#C8A96E]/20 px-2.5 py-0.5 rounded text-white font-bold">
              {activeOrder.courierPartner || "BlueDart Express Luxe"}
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-white">
            {activeOrder.orderStatus === "CONFIRMED"
              ? "Order Confirmed"
              : activeOrder.orderStatus === "PACKED"
                ? "Quality Checked & Packed"
                : activeOrder.orderStatus === "SHIPPED"
                  ? "Dispatched / In Transit"
                  : activeOrder.orderStatus === "OUT_FOR_DELIVERY"
                    ? "Out for Delivery"
                    : activeOrder.orderStatus === "DELIVERED"
                      ? "Delivered"
                      : activeOrder.orderStatus.replace(/_/g, " ")}
          </h1>
          <p className="text-xs text-white/85 mt-1 flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-[#C8A96E]" />
            <span>
              {activeOrder.orderStatus === "DELIVERED"
                ? "Successfully delivered to recipient destination"
                : `Estimated arrival by ${activeOrder.estimatedDeliveryDate || "Next Few Days"} to ${
                    activeOrder.deliveryAddress?.city || activeOrder.shipping_address?.city || "Destination"
                  }`}
            </span>
          </p>
        </div>
      </div>

      {/* Live Visual 5-Stage Stepper */}
      {!isCancelled && !isReturn && (
        <div className="mt-5 rounded-3xl border border-[#E5DCCD] bg-white p-5 sm:p-6 shadow-subtle">
          <div className="flex items-center justify-between border-b border-[#E5DCCD] pb-3 mb-5">
            <h2 className="font-display font-bold text-sm text-[#0D1B2A] uppercase tracking-wider">
              Fulfillment Journey
            </h2>
            <span className="text-[11px] font-bold text-[#8B1E3F] bg-[#8B1E3F]/10 px-2.5 py-0.5 rounded-full">
              Stage {Math.min(currentStageIndex + 1, 5)} of 5
            </span>
          </div>

          <div className="relative space-y-6">
            {STAGES.map((st, idx) => {
              const isCompleted = idx <= currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              const isUpcoming = idx > currentStageIndex;
              const IconComp = st.icon;

              return (
                <div key={st.key} className="flex items-start gap-4 relative">
                  {/* Vertical connector line */}
                  {idx < STAGES.length - 1 && (
                    <div
                      className={`absolute left-4 top-8 bottom-0 w-0.5 -ml-px transition-colors duration-500 ${
                        idx < currentStageIndex ? "bg-[#8B1E3F]" : "bg-[#E5DCCD]"
                      }`}
                      style={{ height: "calc(100% + 8px)" }}
                    />
                  )}

                  {/* Stage Icon Pin */}
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-all duration-300 ${
                      isCurrent
                        ? "bg-[#8B1E3F] text-white ring-4 ring-[#8B1E3F]/20 shadow-md scale-110"
                        : isCompleted
                          ? "bg-[#8B1E3F] text-white shadow-xs"
                          : "bg-[#FAF8F5] text-[#9CA3AF] border border-[#E5DCCD]"
                    }`}
                  >
                    <IconComp className="h-4 w-4" />
                  </div>

                  {/* Stage Details */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-xs sm:text-sm font-bold ${
                          isCurrent
                            ? "text-[#8B1E3F]"
                            : isCompleted
                              ? "text-[#0D1B2A]"
                              : "text-[#9CA3AF]"
                        }`}
                      >
                        {st.label}
                      </p>
                      {isCurrent && (
                        <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-[#8B1E3F] text-white animate-pulse">
                          Current Stage
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#6B7280] mt-0.5 leading-relaxed">
                      {st.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actual Database Milestones Log */}
      {activeOrder.timeline && activeOrder.timeline.length > 0 && (
        <div className="mt-5 rounded-3xl border border-[#E5DCCD] bg-white p-5 sm:p-6 shadow-subtle">
          <h2 className="font-display font-bold text-sm text-[#0D1B2A] mb-4 border-b border-[#E5DCCD] pb-3 uppercase tracking-wider">
            Verified Event Ledger
          </h2>
          <div className="space-y-4">
            {activeOrder.timeline.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-[#8B1E3F] mt-1.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-bold text-[#0D1B2A]">{item.title}</p>
                  <p className="text-[#6B7280] text-[11px] mt-0.5">{item.description}</p>
                  <p className="text-[10px] text-[#9CA3AF] font-mono mt-1">
                    {item.event_time || item.timestamp
                      ? new Date(item.event_time || item.timestamp).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "Verified Milestone"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Summary Card */}
      <div className="mt-5 rounded-3xl border border-[#E5DCCD] bg-white p-4 sm:p-5 shadow-subtle space-y-3">
        <p className="text-[10px] font-bold text-[#8B1E3F] uppercase tracking-wider border-b border-[#E5DCCD] pb-2">
          Ensemble In Shipment ({(activeOrder.items || []).length} Item{(activeOrder.items || []).length === 1 ? "" : "s"})
        </p>
        {(activeOrder.items || []).map((item, idx) => (
          <div key={idx} className="flex gap-4 items-center">
            <HopoImage
              src={item.image || item.image_url}
              alt={item.title || item.product_title}
              productId={item.id || item.product_id}
              title={item.title || item.product_title}
              category={item.category}
              brand={item.brand}
              className="h-20 w-16 object-cover rounded-2xl border border-[#E5DCCD] shrink-0 shadow-xs"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-[#8B1E3F] uppercase tracking-wider">
                {normalizeCategoryName(item.category) || item.category || "Couture"}
              </p>
              <p className="text-sm font-semibold text-[#0D1B2A] truncate">
                {item.title || item.product_title}
              </p>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Size: <span className="font-bold">{item.size}</span>{" "}
                {item.selectedColor || item.color ? `• Color: ${item.selectedColor || item.color}` : ""}{" "}
                • Qty: {item.qty || item.quantity || 1}
              </p>
              <p className="text-sm font-bold text-[#0D1B2A] mt-1">
                {formatINR((item.price || item.unit_price || 0) * (item.qty || item.quantity || 1))}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Courier & Waybill Info Card */}
      <div className="mt-5 rounded-3xl border border-[#E5DCCD] bg-white p-5 shadow-subtle">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] tracking-widest uppercase text-[#8B1E3F] font-bold">
              Express Courier Partner
            </p>
            <p className="font-bold text-sm text-[#0D1B2A] mt-0.5">
              {activeOrder.courierPartner || activeOrder.courier_partner || "BlueDart Express Luxe"}
            </p>
            <p className="text-xs font-mono font-bold text-[#8B1E3F] mt-0.5">
              AWB: {activeOrder.trackingNumber || activeOrder.tracking_number || "BD9485C6IN"}
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href={`mailto:${BUSINESS_CONFIG.contact.email}`}
              aria-label="Email concierge"
              className="rounded-full border border-[#E5DCCD] p-2.5 text-[#0D1B2A] hover:bg-[#F7F2E9] transition"
            >
              <Mail className="h-4 w-4 text-[#8B1E3F]" />
            </a>
            <Link
              to="/support-chat"
              aria-label="Message concierge"
              className="rounded-full border border-[#E5DCCD] p-2.5 text-[#0D1B2A] hover:bg-[#F7F2E9] transition"
            >
              <MessageCircle className="h-4 w-4 text-[#8B1E3F]" />
            </Link>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 grid grid-cols-2 gap-3 pb-6">
        <Link
          to="/orders"
          className="rounded-full border-2 border-[#0D1B2A] py-3 text-center text-xs uppercase font-bold tracking-wider text-[#0D1B2A] hover:bg-[#0D1B2A] hover:text-white transition"
        >
          View All Orders
        </Link>
        <Link
          to="/support-chat"
          className="rounded-full bg-[#8B1E3F] text-white py-3 text-center text-xs uppercase font-bold tracking-wider shadow-md hover:bg-[#5E0F27] transition"
        >
          Concierge Desk
        </Link>
      </div>

      <BottomNav active="profile" />
    </MobileFrame>
  );
}

export default OrderTracking;
