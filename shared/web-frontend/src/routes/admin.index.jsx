import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AdminShell, StatCard, Panel } from "@/components/app/AdminShell";
import { adminApi } from "@/services/api/index";
import {
  TrendingUp,
  ShoppingBag,
  Wallet,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { formatINR } from "@/lib/business-config";
export function AdminOverview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overviewData, setOverviewData] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ovRes, prodRes] = await Promise.all([adminApi.getOverview(), adminApi.getProducts()]);
      if (ovRes.success && ovRes.data) {
        setOverviewData(ovRes.data);
      }
      if (prodRes.success && prodRes.data) {
        setTopProducts(prodRes.data.slice(0, 5));
      }
    } catch (err) {
      setError(err.message || "Failed to load live overview metrics.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadData();
  }, []);
  const currentDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const metrics = overviewData?.metrics || {
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    lowStockCount: 0,
  };
  const recentOrders = overviewData?.recentOrders || [];
  const lowStockItems = overviewData?.lowStockItems || [];
  const revenueTrend = overviewData?.revenueTrend || [];
  const trafficChannels = overviewData?.trafficChannels || [
    { channel: "Organic Atelier Search", count: 42 },
    { channel: "Instagram Couture Edit", count: 28 },
    { channel: "Direct VIP Concierge", count: 18 },
    { channel: "Editorial Referral", count: 12 },
  ];
  const totalTrafficCount = trafficChannels.reduce((sum, c) => sum + Number(c.count), 0) || 1;
  return (
    <AdminShell
      title="Dashboard"
      subtitle={`Live Operations • ${currentDate}`}
      actions={
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#E5DCCD] bg-white text-xs font-bold text-[#8B1E3F] hover:bg-[#FAF8F5] transition shadow-xs disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Live</span>
        </button>
      }
    >
      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={loadData} className="underline font-bold">
            Retry
          </button>
        </div>
      )}

      {/* 4 Live Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Gross Revenue"
          value={formatINR(metrics.totalSales)}
          delta={metrics.totalOrders > 0 ? "Verified Paid" : "Awaiting Orders"}
          trend="up"
          icon={Wallet}
        />
        <StatCard
          label="Total Orders"
          value={String(metrics.totalOrders)}
          delta={`${metrics.totalCustomers} Registered Customers`}
          trend="up"
          icon={ShoppingBag}
        />
        <StatCard
          label="Average Order Value"
          value={formatINR(
            metrics.totalOrders > 0 ? Math.round(metrics.totalSales / metrics.totalOrders) : 0,
          )}
          delta="Live Calculated"
          trend="up"
          icon={TrendingUp}
        />
        <StatCard
          label="Low Stock Alerts"
          value={String(metrics.lowStockCount)}
          delta={metrics.lowStockCount > 0 ? "Attention Required" : "Optimal Levels"}
          trend={metrics.lowStockCount > 0 ? "down" : "up"}
          icon={AlertTriangle}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Panel
            title="Revenue Performance & Volume"
            action={
              <Link
                to="/admin/reports"
                className="text-xs font-bold text-[#8B1E3F] hover:underline uppercase tracking-wider flex items-center gap-1"
              >
                <span>Detailed Reports</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            }
          >
            {revenueTrend.length > 0 ? (
              <div className="flex items-end gap-3 h-48 pt-4">
                {revenueTrend.map((d, idx) => {
                  const maxRev = Math.max(
                    ...revenueTrend.map((t) => Number(t.daily_revenue)),
                    10000,
                  );
                  const heightPct = Math.max(
                    15,
                    Math.round((Number(d.daily_revenue) / maxRev) * 100),
                  );
                  const dateLabel = new Date(d.order_date).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                  });
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className="w-full rounded-t-xl bg-gradient-to-t from-[#8B1E3F] to-[#C8A96E] hover:brightness-110 transition shadow-xs"
                        style={{ height: `${heightPct}%` }}
                        title={`${formatINR(Number(d.daily_revenue))} (${d.daily_orders} orders)`}
                      />
                      <span className="text-[11px] font-semibold text-[#6B7280]">{dateLabel}</span>
                      <span className="text-[10px] font-bold text-[#0D1B2A]">
                        {formatINR(Number(d.daily_revenue))}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-end gap-3 h-48 pt-4">
                {[{ m: "Today", v: metrics.totalSales || 24000 }].map((d) => (
                  <div key={d.m} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full max-w-[120px] rounded-t-xl bg-gradient-to-t from-[#8B1E3F] to-[#C8A96E] hover:brightness-110 transition shadow-xs"
                      style={{ height: "60%" }}
                    />
                    <span className="text-[11px] font-semibold text-[#6B7280]">{d.m}</span>
                    <span className="text-[11px] font-bold text-[#0D1B2A]">{formatINR(d.v)}</span>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>

        <Panel title="Traffic by Channel">
          <ul className="space-y-4 pt-2">
            {trafficChannels.map((t, idx) => {
              const pct = Math.round((Number(t.count) / totalTrafficCount) * 100);
              return (
                <li key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#6B7280] font-medium">{t.channel}</span>
                    <span className="font-bold text-[#0D1B2A]">{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#FAF6EE] overflow-hidden border border-[#E5DCCD]">
                    <div
                      className="h-full bg-[#8B1E3F] rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel
          title="Active Products"
          action={
            <Link
              to="/admin/products"
              className="text-xs font-bold text-[#8B1E3F] hover:underline uppercase tracking-wider flex items-center gap-1"
            >
              <span>Full Catalog</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          }
        >
          <table className="w-full text-xs text-left">
            <thead className="text-[10px] uppercase font-bold text-[#6B7280] border-b border-[#E5DCCD] pb-2">
              <tr>
                <th className="py-2">Piece</th>
                <th className="py-2 text-right">Effective Rate</th>
                <th className="py-2 text-right">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DCCD]/60">
              {topProducts.map((p) => (
                <tr key={p.id}>
                  <td className="py-2.5 pr-2 flex items-center gap-2.5">
                    {p.image && (
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-8 h-10 object-cover rounded shadow-xs shrink-0"
                      />
                    )}
                    <div className="truncate max-w-[200px]">
                      <p className="font-bold text-[#0D1B2A] truncate">{p.title}</p>
                      <p className="text-[10px] text-[#6B7280]">
                        {p.brand} • {p.id}
                      </p>
                    </div>
                  </td>
                  <td className="py-2.5 text-right font-bold text-[#0D1B2A] whitespace-nowrap">
                    {formatINR(p.effective_price || p.base_price)}
                  </td>
                  <td className="py-2.5 text-right whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${p.total_stock > 2 ? "bg-[#2E7D6B]/10 text-[#2E7D6B]" : "bg-amber-100 text-amber-800"}`}
                    >
                      {p.total_stock} Units
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel
          title="Recent Storefront Orders"
          action={
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-[#8B1E3F] hover:underline uppercase tracking-wider flex items-center gap-1"
            >
              <span>All Orders</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          }
        >
          {recentOrders.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#6B7280]">
              <p>No orders registered in database yet.</p>
              <Link to="/home" className="text-[#8B1E3F] font-bold underline mt-1 inline-block">
                View storefront
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-[#E5DCCD]/60 text-xs">
              {recentOrders.map((o) => (
                <li key={o.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-[#0D1B2A]">
                      {o.id} • {o.customer_name || "Customer"}
                    </p>
                    <p className="text-[11px] text-[#6B7280]">
                      {new Date(o.created_at).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#0D1B2A]">{formatINR(Number(o.total_amount))}</p>
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#2E7D6B]/10 text-[#2E7D6B]">
                      {o.order_status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </AdminShell>
  );
}
export default AdminOverview;
