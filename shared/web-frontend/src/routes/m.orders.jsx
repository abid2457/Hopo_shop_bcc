import { Link, useLocation, Navigate } from "react-router-dom";
import { useState } from "react";
import { AppHeader, MobileFrame, BottomNav } from "@/components/app/MobileShell";
import { EmptyState } from "@/components/app/EmptyState";
import { Package, Truck } from "lucide-react";
import { useStoreSync, getOrders, getAuthUser } from "@/lib/store";
import { formatINR } from "@/lib/business-config";
import { HopoImage } from "@/components/app/HopoImage";
const TABS = ["All Orders", "On the Way", "Delivered", "Returns & Refund"];
export function OrdersPage() {
  useStoreSync();
  const location = useLocation();
  const user = getAuthUser();
  const [activeTab, setActiveTab] = useState(0);
  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }
  const allOrders = getOrders();
  const orders = user.role === "ADMIN" ? allOrders : allOrders.filter((o) => o.userId === user.id);
  const filteredOrders = orders.filter((o) => {
    if (activeTab === 1)
      return (
        o.orderStatus === "CONFIRMED" ||
        o.orderStatus === "PACKED" ||
        o.orderStatus === "SHIPPED" ||
        o.orderStatus === "OUT_FOR_DELIVERY"
      );
    if (activeTab === 2) return o.orderStatus === "DELIVERED";
    if (activeTab === 3)
      return o.orderStatus === "CANCELLED" || o.orderStatus === "RETURN_REQUESTED";
    return true;
  });
  return (
    <MobileFrame>
      <AppHeader title="My Orders" back />

      <div className="mb-4">
        <div className="flex gap-2 pb-2 overflow-x-auto scrollbar-none border-b border-[#E5DCCD]">
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setActiveTab(i)}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                i === activeTab
                  ? "bg-[#8B1E3F] text-white border-[#8B1E3F] shadow-xs"
                  : "bg-white hover:border-[#8B1E3F]/50 text-[#0D1B2A] border-[#E5DCCD]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No Orders Found"
          description="You don't have any orders under this category yet."
          actionLabel="Explore Haute Couture"
          actionTo="/home"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
          {filteredOrders.map((o) => (
            <div
              key={o.id}
              className="rounded-3xl border border-[#E5DCCD] bg-white p-5 shadow-subtle hover:border-[#8B1E3F]/40 transition space-y-4"
            >
              <header className="flex items-center justify-between border-b border-[#E5DCCD]/60 pb-3">
                <div className="flex items-center gap-3">
                  <span className="grid place-items-center h-10 w-10 rounded-2xl bg-[#8B1E3F]/10 text-[#8B1E3F]">
                    <Package className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-[#0D1B2A] tracking-wider">{o.id}</p>
                    <p className="text-[11px] text-[#6B7280]">
                      Placed on{" "}
                      {new Date(o.createdAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-bold bg-[#2E7D6B]/10 text-[#2E7D6B] border border-[#2E7D6B]/20">
                  {o.orderStatus.replace(/_/g, " ")}
                </span>
              </header>

              <div className="space-y-2.5">
                {o.items.map((it, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <HopoImage
                      src={it.image}
                      alt={it.title}
                      productId={it.id}
                      title={it.title}
                      category={it.category}
                      brand={it.brand}
                      className="h-14 w-11 object-cover rounded-xl border border-[#E5DCCD] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#0D1B2A] truncate">{it.title}</p>
                      <p className="text-[11px] text-[#6B7280]">
                        Size: {it.size} {it.selectedColor ? `• Color: ${it.selectedColor}` : ""} •
                        Qty: {it.qty}
                      </p>
                    </div>
                    <p className="text-xs font-bold text-[#0D1B2A]">
                      {formatINR(it.price * it.qty)}
                    </p>
                  </div>
                ))}
              </div>

              <footer className="pt-3 border-t border-[#E5DCCD]/60 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#6B7280]">Total Amount</p>
                  <p className="text-sm font-bold text-[#0D1B2A]">{formatINR(o.totalAmount)}</p>
                </div>
                <Link
                  to={`/order-tracking?orderId=${o.id}`}
                  className="px-4 py-2 rounded-full bg-[#8B1E3F] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#5E0F27] transition shadow-xs flex items-center gap-1"
                >
                  <Truck className="h-3.5 w-3.5" />
                  <span>Track Order</span>
                </Link>
              </footer>
            </div>
          ))}
        </div>
      )}

      <BottomNav active="profile" />
    </MobileFrame>
  );
}
export default OrdersPage;
