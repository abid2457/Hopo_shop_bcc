import React, { useState, useEffect } from "react";
import { AdminShell, StatCard, Panel } from "@/components/app/AdminShell";
import { adminApi } from "@/services/api/index";
import {
  Download,
  Wallet,
  TrendingUp,
  RefreshCw,
  IndianRupee,
  CreditCard,
  ShoppingBag,
} from "lucide-react";
import { formatINR } from "@/lib/business-config";
export function ReportsAdmin() {
  const [period, setPeriod] = useState("30d");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const getDateRange = (p) => {
    const to = new Date().toISOString().split("T")[0];
    let from = "";
    if (p === "7d") {
      from = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
    } else if (p === "30d") {
      from = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];
    } else if (p === "90d") {
      from = new Date(Date.now() - 90 * 86400000).toISOString().split("T")[0];
    } else {
      from = "2025-01-01";
    }
    return { from, to };
  };
  const loadReports = async () => {
    setLoading(true);
    setError(null);
    const { from, to } = getDateRange(period);
    try {
      const res = await adminApi.getReports(from, to);
      if (res.success && res.data) {
        setReportData(res.data);
      }
    } catch (err) {
      setError(err.message || "Failed to load financial reports.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadReports();
  }, [period]);
  const financial = reportData?.financialSummary || {
    grossSales: 0,
    catalogSubtotal: 0,
    totalDiscounts: 0,
    totalGst: 0,
    netRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
  };
  const dailySeries = reportData?.dailySeries || [];
  const paymentMethods = reportData?.paymentMethods || [];
  const topProducts = reportData?.topProducts || [];
  const totalPaymentVol = paymentMethods.reduce((sum, p) => sum + Number(p.volume), 0) || 1;
  const handleDownloadCSV = () => {
    const headers = "Date,DailyOrders,DailyRevenue,DailyDiscounts\n";
    const rows = dailySeries
      .map((d) => `"${d.date}",${d.orders_count},${d.daily_revenue},${d.daily_discounts}`)
      .join("\n");
    const summaryRow = `\n"Total Net Revenue",,${financial.netRevenue},\n"Total Orders",,${financial.totalOrders},\n"Total Discounts",,${financial.totalDiscounts},\n`;
    const blob = new Blob([headers + rows + summaryRow], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `hopo_financial_report_${period}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <AdminShell
      title="Financial & Revenue Reports"
      subtitle={`Verified Ledger Transactions • ${reportData?.dateRange?.from || ""} to ${reportData?.dateRange?.to || ""}`}
      actions={
        <div className="flex items-center gap-3">
          <div className="flex bg-[#FAF6EE] rounded-full p-1 border border-[#E5DCCD] text-xs">
            {["7d", "30d", "90d", "all"].map((t) => (
              <button
                key={t}
                onClick={() => setPeriod(t)}
                className={`px-3 py-1 rounded-full font-bold transition uppercase tracking-wider ${period === t ? "bg-[#8B1E3F] text-white shadow-xs" : "text-[#6B7280] hover:text-[#0D1B2A]"}`}
              >
                {t === "all" ? "All Time" : t.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={loadReports}
            disabled={loading}
            className="p-2 rounded-full border border-[#E5DCCD] bg-white text-[#8B1E3F] hover:bg-[#FAF6EE] transition shadow-xs"
            title="Refresh Report"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleDownloadCSV}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#8B1E3F] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#780C28] transition shadow-md"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download CSV Statement</span>
          </button>
        </div>
      }
    >
      {error && (
        <div className="mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
          {error}
        </div>
      )}

      {/* 4 Financial KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Net Settled Revenue"
          value={formatINR(financial.netRevenue)}
          delta={`${financial.totalOrders} Paid Orders`}
          trend="up"
          icon={Wallet}
        />
        <StatCard
          label="Gross Catalog Sales"
          value={formatINR(financial.grossSales || financial.catalogSubtotal)}
          delta="Before Concessions"
          trend="up"
          icon={TrendingUp}
        />
        <StatCard
          label="Promotion Discounts Given"
          value={formatINR(financial.totalDiscounts)}
          delta="Coupons & Privileges"
          trend="down"
          icon={IndianRupee}
        />
        <StatCard
          label="Average Order Value (AOV)"
          value={formatINR(financial.averageOrderValue)}
          delta="Per Verified Customer"
          trend="up"
          icon={ShoppingBag}
        />
      </div>

      {/* Daily Revenue Trend Bar Visualizer */}
      <Panel title="Period Revenue Trajectory (Daily ₹ Volume)">
        {dailySeries.length > 0 ? (
          <div className="flex items-end gap-3 h-56 pt-6">
            {dailySeries.map((d, idx) => {
              const maxRev = Math.max(...dailySeries.map((s) => Number(s.daily_revenue)), 10000);
              const heightPct = Math.max(15, Math.round((Number(d.daily_revenue) / maxRev) * 100));
              const label = new Date(d.date).toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
              });
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-xl bg-gradient-to-t from-[#8B1E3F] to-[#C8A96E] hover:brightness-110 transition shadow-xs cursor-pointer"
                    style={{ height: `${heightPct}%` }}
                    title={`${label}: ${formatINR(Number(d.daily_revenue))} (${d.orders_count} orders)`}
                  />
                  <span className="text-[11px] font-semibold text-[#6B7280]">{label}</span>
                  <span className="text-[10px] font-bold text-[#0D1B2A]">
                    {formatINR(Number(d.daily_revenue))}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-stone-500">
            No orders registered in the selected time window.
          </div>
        )}
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Payment Methods Breakdown */}
        <Panel title="Payment Gateway & Method Distribution">
          {paymentMethods.length > 0 ? (
            <ul className="space-y-4 pt-2">
              {paymentMethods.map((m, idx) => {
                const sharePct = Math.round((Number(m.volume) / totalPaymentVol) * 100);
                return (
                  <li key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-[#8B1E3F]" />
                        <span className="font-bold text-[#0D1B2A]">{m.payment_method}</span>
                        <span className="text-stone-400 font-normal">({m.count} txns)</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[#0D1B2A]">
                          {formatINR(Number(m.volume))}
                        </span>
                        <span className="text-[11px] text-stone-500 ml-1.5 font-medium">
                          ({sharePct}%)
                        </span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-[#FAF6EE] border border-[#E5DCCD] overflow-hidden">
                      <div
                        className="h-full bg-[#8B1E3F] rounded-full"
                        style={{ width: `${sharePct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="py-8 text-center text-xs text-stone-500">No payment records found.</div>
          )}
        </Panel>

        {/* Top Performing Ensembles */}
        <Panel title="Top Grossing Masterpieces">
          {topProducts.length > 0 ? (
            <table className="w-full text-xs text-left">
              <thead className="text-[10px] uppercase font-bold text-[#6B7280] border-b border-[#E5DCCD] pb-2">
                <tr>
                  <th className="py-2">Masterpiece</th>
                  <th className="py-2 text-center">Units Sold</th>
                  <th className="py-2 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DCCD]/60 font-medium">
                {topProducts.map((p, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 pr-2 flex items-center gap-2.5">
                      {p.image_url && (
                        <img
                          src={p.image_url}
                          alt={p.product_title}
                          className="w-8 h-10 object-cover rounded shadow-xs shrink-0"
                        />
                      )}
                      <div className="truncate max-w-[180px]">
                        <p className="font-bold text-[#0D1B2A] truncate">{p.product_title}</p>
                        <p className="text-[10px] text-[#6B7280]">
                          {p.brand} • {p.product_id}
                        </p>
                      </div>
                    </td>
                    <td className="py-2.5 text-center font-bold">{p.units_sold}</td>
                    <td className="py-2.5 text-right font-bold text-[#0D1B2A]">
                      {formatINR(Number(p.revenue))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-8 text-center text-xs text-stone-500">
              No product sales in this period.
            </div>
          )}
        </Panel>
      </div>
    </AdminShell>
  );
}
export default ReportsAdmin;
