import { Link, useParams, useLocation, Navigate } from "react-router-dom";
import { AppHeader, MobileFrame } from "@/components/app/MobileShell";
import { getOrders, getAuthUser, useStoreSync } from "@/lib/store";
import { HopoImage } from "@/components/app/HopoImage";
import { formatINR } from "@/lib/business-config";
import {
  CheckCircle2,
  MapPin,
  FileText,
  MessageSquare,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
export function OrderDetailsPage() {
  useStoreSync();
  const { id } = useParams();
  const location = useLocation();
  const user = getAuthUser();
  // 1. Unauthenticated Guard
  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }
  // 2. Filter orders strictly belonging to the currently logged-in customer
  const allStoreOrders = getOrders();
  const customerOrders =
    user.role === "ADMIN" ? allStoreOrders : allStoreOrders.filter((o) => o.userId === user.id);
  const foundStoreOrder = customerOrders.find((o) => o.id === id);
  // 3. Access Restricted / Not Found Guard
  if (!foundStoreOrder) {
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
  const order = {
    id: foundStoreOrder.id,
    date: new Date(foundStoreOrder.createdAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    status:
      foundStoreOrder.orderStatus === "CONFIRMED"
        ? "Confirmed"
        : foundStoreOrder.orderStatus.replace(/_/g, " "),
    total: foundStoreOrder.totalAmount,
    payment: foundStoreOrder.paymentMethod,
    deliveredOn: foundStoreOrder.estimatedDeliveryDate,
    address: `${foundStoreOrder.deliveryAddress?.addressLine1 || ""}, ${foundStoreOrder.deliveryAddress?.city || "Mumbai"} ${foundStoreOrder.deliveryAddress?.pincode || ""}`,
    name: foundStoreOrder.deliveryAddress?.fullName || user.name || "Customer",
    items: foundStoreOrder.items.map((it) => ({
      id: it.id,
      title: it.title,
      qty: it.qty,
      price: it.price * it.qty,
      image: it.image,
      category: it.category,
      brand: it.brand,
    })),
  };
  const steps = [
    { label: "Order placed", time: order.date, done: true },
    { label: "Packed", time: "Same day", done: true },
    { label: "Shipped", time: "+1 day", done: order.status !== "Cancelled" },
    {
      label: "Out for delivery",
      time: order.deliveredOn ?? "Today",
      done: ["Delivered", "Returned", "Out for delivery", "SHIPPED"].includes(order.status),
    },
    {
      label: "Delivered",
      time: order.deliveredOn ?? "—",
      done: order.status === "Delivered" || order.status === "Returned",
    },
  ];
  return (
    <MobileFrame>
      <AppHeader title={order.id} back showSearch={false} showBell={false} />

      <section className="px-4 pt-2">
        <div className="rounded-xl border bg-card p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Placed on {order.date}</span>
            <span className="text-[10px] uppercase tracking-wider bg-[#C8A96E]/20 text-[#8B1E3F] px-2 py-0.5 rounded font-bold">
              {order.status}
            </span>
          </div>

          <p className="font-display text-2xl mt-3">{formatINR(order.total)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {order.items.length} item(s) • Paid via {order.payment}
          </p>

          <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-2 text-xs">
            <Link
              to="/gst-invoice"
              className="flex flex-col items-center gap-1 p-2 rounded-lg bg-secondary text-center hover:bg-muted"
            >
              <FileText className="h-4 w-4 text-[#8B1E3F]" /> Invoice
            </Link>
            <Link
              to="/support-chat"
              className="flex flex-col items-center gap-1 p-2 rounded-lg bg-secondary text-center hover:bg-muted"
            >
              <MessageSquare className="h-4 w-4 text-[#8B1E3F]" /> Help
            </Link>
            <Link
              to="/returns"
              className="flex flex-col items-center gap-1 p-2 rounded-lg bg-secondary text-center hover:bg-muted"
            >
              <RotateCcw className="h-4 w-4 text-[#8B1E3F]" /> Return
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 mt-5">
        <h2 className="font-display text-base mb-3">Timeline</h2>
        <div className="rounded-xl border bg-card p-4">
          <ol className="relative pl-6 space-y-4">
            {steps.map((s, i) => (
              <li key={s.label} className="relative">
                <span
                  className={`absolute -left-6 top-0.5 grid place-items-center h-4 w-4 rounded-full ${s.done ? "bg-[#8B1E3F] text-white" : "bg-muted text-muted-foreground"}`}
                >
                  <CheckCircle2 className="h-3 w-3" />
                </span>
                {i < steps.length - 1 && (
                  <span
                    className={`absolute -left-[18px] top-4 bottom-0 w-px ${s.done ? "bg-[#8B1E3F]" : "bg-border"}`}
                  />
                )}
                <p className={`text-sm font-medium ${s.done ? "" : "text-muted-foreground"}`}>
                  {s.label}
                </p>
                <p className="text-[11px] text-muted-foreground">{s.time}</p>
              </li>
            ))}
          </ol>

          <Link
            to={`/order-tracking?orderId=${order.id}`}
            className="mt-4 block text-center text-xs text-[#8B1E3F] font-bold uppercase tracking-wider hover:underline"
          >
            Open live tracking
          </Link>
        </div>
      </section>

      <section className="px-4 space-y-3">
        <h2 className="font-display text-base">Items ({order.items.length})</h2>
        {order.items.map((it, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border bg-card p-3">
            <div className="h-16 w-16 rounded-md overflow-hidden bg-muted shrink-0 border border-[#E5DCCD]">
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
              <p className="text-[11px] text-muted-foreground">
                {it.size ? `Size: ${it.size} • ` : ""}
                {it.selectedColor ? `Color: ${it.selectedColor} • ` : ""}
                Qty {it.qty}
              </p>
            </div>
            <p className="text-sm font-medium">{formatINR(it.price)}</p>
          </div>
        ))}
      </section>

      <section className="px-4 mt-5 space-y-3">
        <h2 className="font-display text-base">Delivery & payment</h2>
        <div className="rounded-xl border bg-card p-4 text-sm space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-[#8B1E3F] mt-0.5" />
            <div>
              <p className="font-medium">{order.name || "Priya Sharma"} • Home</p>
              <p className="text-muted-foreground text-xs">
                {order.address || "Flat 402, Royal Palms Residency, Bandra West, Mumbai 400050"}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Paid via {order.payment}</p>
        </div>

        <div className="rounded-xl border bg-card p-4 text-sm space-y-1.5">
          <Row label="Subtotal" value={formatINR(order.total)} />
          <Row label="Delivery" value="FREE" tone="success" />
          <div className="border-t my-2" />
          <Row label="Total paid" value={formatINR(order.total)} bold />
        </div>
      </section>

      <section className="px-4 mt-5 grid grid-cols-3 gap-2 pb-8">
        <Link
          to="/returns"
          className="flex flex-col items-center gap-1 rounded-xl border bg-card p-3 text-[11px]"
        >
          <RotateCcw className="h-4 w-4 text-[#8B1E3F]" /> Return
        </Link>
        <Link
          to="/gst-invoice"
          className="flex flex-col items-center gap-1 rounded-xl border bg-card p-3 text-[11px]"
        >
          <FileText className="h-4 w-4 text-[#8B1E3F]" /> Invoice
        </Link>
        <Link
          to="/support-chat"
          className="flex flex-col items-center gap-1 rounded-xl border bg-card p-3 text-[11px]"
        >
          <MessageSquare className="h-4 w-4 text-[#8B1E3F]" /> Get help
        </Link>
      </section>
    </MobileFrame>
  );
}
function Row({ label, value, tone, bold }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={`${bold ? "font-semibold" : ""} ${tone === "success" ? "text-emerald-700" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
export default OrderDetailsPage;
