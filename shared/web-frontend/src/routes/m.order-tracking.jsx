import { Link, useSearchParams, useParams, useLocation, Navigate } from "react-router-dom";
import { MobileFrame, AppHeader, BottomNav } from "@/components/app/MobileShell";
import {
  CheckCircle2,
  Package,
  Truck,
  Mail,
  MessageCircle,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { useStoreSync, getOrders, getAuthUser } from "@/lib/store";
import { formatINR, BUSINESS_CONFIG } from "@/lib/business-config";
import { normalizeCategoryName } from "@/lib/catalog-service";
import { HopoImage } from "@/components/app/HopoImage";
export function OrderTracking() {
  useStoreSync();
  const location = useLocation();
  const user = getAuthUser();
  const { id: pathId } = useParams();
  const [searchParams] = useSearchParams();
  const orderIdParam = searchParams.get("orderId") || searchParams.get("id") || pathId;
  // 1. Unauthenticated Guard: Redirect directly to Login with return redirect
  if (!user) {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${returnUrl}`} replace />;
  }
  // 2. Fetch orders strictly belonging to the currently logged-in customer
  const allOrders = getOrders();
  const customerOrders =
    user.role === "ADMIN" ? allOrders : allOrders.filter((o) => o.userId === user.id);
  // 3. Prevent cross-customer URL tampering:
  let activeOrder = null;
  let unauthorizedOrderId = null;
  if (orderIdParam) {
    activeOrder =
      customerOrders.find((o) => o.id.toLowerCase() === orderIdParam.trim().toLowerCase()) || null;
    if (!activeOrder) {
      unauthorizedOrderId = orderIdParam;
    }
  } else {
    activeOrder = customerOrders[0] || null;
  }
  // 4. Handle cross-customer unauthorized order attempt
  if (unauthorizedOrderId) {
    return (
      <MobileFrame>
        <AppHeader title="Track Your Order" back />
        <div className="py-14 px-4 max-w-lg mx-auto text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F] grid place-items-center mx-auto shadow-inner">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="font-display font-bold text-xl sm:text-2xl text-[#0D1B2A]">
            Order Access Restricted
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
            Order <strong className="text-[#0D1B2A]">#{unauthorizedOrderId}</strong> was not found
            under your account (
            <span className="font-semibold text-[#8B1E3F]">{user.email || user.phone}</span>). For
            customer privacy and security, you can only track orders placed with your authenticated
            account.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            {customerOrders.length > 0 ? (
              <Link
                to={`/order-tracking?orderId=${customerOrders[0].id}`}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#8B1E3F] text-white font-bold text-xs uppercase tracking-widest hover:bg-[#5E0F27] transition shadow-md"
              >
                Track Your Recent Order
              </Link>
            ) : (
              <Link
                to="/listing"
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#8B1E3F] text-white font-bold text-xs uppercase tracking-widest hover:bg-[#5E0F27] transition shadow-md"
              >
                Start Shopping
              </Link>
            )}
            <Link
              to="/orders"
              className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-[#E5DCCD] bg-white text-[#0D1B2A] font-bold text-xs uppercase tracking-widest hover:bg-[#F7F2E9] transition"
            >
              View All Your Orders
            </Link>
          </div>
        </div>
        <BottomNav active="profile" />
      </MobileFrame>
    );
  }
  // 5. Handle customer with zero orders
  if (!activeOrder) {
    return (
      <MobileFrame>
        <AppHeader title="Track Your Order" back />
        <div className="py-16 text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-[#FAF6EE] text-[#8B1E3F] grid place-items-center mx-auto">
            <Package className="h-8 w-8" />
          </div>
          <h2 className="font-display font-bold text-xl text-[#0D1B2A]">
            No Active Orders to Track
          </h2>
          <p className="text-xs text-[#6B7280]">
            Once you place an order, live BlueDart express tracking and milestone timelines will
            appear here.
          </p>
          <Link
            to="/listing"
            className="inline-block px-7 py-3 rounded-full bg-[#8B1E3F] text-white font-bold text-xs uppercase tracking-widest hover:bg-[#5E0F27] transition shadow-md"
          >
            Start Shopping
          </Link>
        </div>
      </MobileFrame>
    );
  }
  return (
    <MobileFrame>
      <AppHeader title="Track Your Order" back />

      {/* Multi-order switcher if customer has more than 1 order */}
      {customerOrders.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-2 scrollbar-none">
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
              Express Air
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-white">
            {activeOrder.orderStatus === "CONFIRMED"
              ? "Order Confirmed"
              : activeOrder.orderStatus.replace(/_/g, " ")}
          </h1>
          <p className="text-xs text-white/80 mt-1 flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-[#C8A96E]" />
            <span>
              Guaranteed delivery by {activeOrder.estimatedDeliveryDate} to{" "}
              {activeOrder.deliveryAddress?.city || "Customer Address"}
            </span>
          </p>
        </div>
      </div>

      {/* Product Summary Card */}
      <div className="mt-5 rounded-3xl border border-[#E5DCCD] bg-white p-4 sm:p-5 shadow-subtle space-y-3">
        <p className="text-[10px] font-bold text-[#8B1E3F] uppercase tracking-wider border-b border-[#E5DCCD] pb-2">
          Ensemble In Shipment ({activeOrder.items.length}{" "}
          {activeOrder.items.length === 1 ? "Item" : "Items"})
        </p>
        {activeOrder.items.map((item, idx) => (
          <div key={idx} className="flex gap-4 items-center">
            <HopoImage
              src={item.image}
              alt={item.title}
              productId={item.id}
              title={item.title}
              category={item.category}
              brand={item.brand}
              className="h-20 w-16 object-cover rounded-2xl border border-[#E5DCCD] shrink-0 shadow-xs"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-[#8B1E3F] uppercase tracking-wider">
                {normalizeCategoryName(item.category) || item.category || "Couture"}
              </p>
              <p className="text-sm font-semibold text-[#0D1B2A] truncate">{item.title}</p>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Size: {item.size} {item.selectedColor ? `• Color: ${item.selectedColor}` : ""} •
                Qty: {item.qty}
              </p>
              <p className="text-sm font-bold text-[#0D1B2A] mt-1">
                {formatINR(item.price * item.qty)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Shipment Status Stepper */}
      <div className="mt-6 rounded-3xl border border-[#E5DCCD] bg-white p-6 shadow-subtle">
        <h2 className="font-display font-bold text-base text-[#0D1B2A] mb-4 border-b border-[#E5DCCD] pb-3">
          Shipment Timeline
        </h2>
        <ol className="relative ml-2">
          {activeOrder.timeline.map((s, i) => (
            <li key={i} className="flex gap-4 pb-6 relative last:pb-0">
              {i < activeOrder.timeline.length - 1 && (
                <span
                  className={`absolute left-[15px] top-8 bottom-0 w-0.5 ${s.completed ? "bg-[#8B1E3F]" : "bg-[#E5DCCD]"}`}
                />
              )}
              <span
                className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 z-10 ${s.completed ? "bg-[#8B1E3F] text-white" : "bg-white text-[#6B7280] border-2 border-[#E5DCCD]"}`}
              >
                {s.completed ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
              </span>
              <div className="flex-1">
                <p
                  className={`text-xs sm:text-sm ${s.completed ? "font-bold text-[#0D1B2A]" : "text-[#6B7280]"}`}
                >
                  {s.title}
                </p>
                <p className="text-[11px] text-[#6B7280] mt-0.5">
                  {s.description} ({s.timestamp})
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Courier Info Card */}
      <div className="mt-5 rounded-3xl border border-[#E5DCCD] bg-white p-5 shadow-subtle">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] tracking-widest uppercase text-[#8B1E3F] font-bold">
              Premium Courier Partner
            </p>
            <p className="font-bold text-sm text-[#0D1B2A] mt-0.5">{activeOrder.courierPartner}</p>
            <p className="text-xs text-[#6B7280] mt-0.5">
              AWB Tracking # · {activeOrder.trackingNumber}
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
      <div className="mt-5 grid grid-cols-2 gap-3 pb-4">
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
          Customer Concierge
        </Link>
      </div>

      <BottomNav active="profile" />
    </MobileFrame>
  );
}
export default OrderTracking;
