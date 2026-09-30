import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Boxes,
  ShoppingCart,
  Users,
  TicketPercent,
  Image as ImageIcon,
  BarChart3,
  LineChart,
  ChevronLeft,
  Search,
  Bell,
  Menu,
  X,
  ExternalLink,
  Lock,
  LogOut,
  ShieldCheck,
  Tag,
  IndianRupee,
  CheckCheck,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Logo } from "./Logo";
import {
  useStoreSync,
  getAuthUser,
  loginAdmin,
  logoutUser,
  getAdminNotifications,
} from "@/lib/store";
import { authApi, adminApi } from "@/services/api/index";
import { formatRelativeTime } from "@/lib/time-utils";
const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/inventory", label: "Stock & Inventory", icon: Boxes },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/banners", label: "Banners", icon: ImageIcon },
  { to: "/admin/analytics", label: "Conversion Analytics", icon: BarChart3 },
  { to: "/admin/reports", label: "Financial Reports", icon: LineChart },
];
export function AdminShell({ title, subtitle, actions, children }) {
  useStoreSync();
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = getAuthUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const handleAdminAuth = async (e) => {
    if (e) e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await authApi.login(email, password);
      if (res.success && res.data?.user) {
        if (res.data.user.role !== "ADMIN") {
          setAuthError("Authenticated account does not possess administrator privileges.");
          return;
        }
        loginAdmin(res.data.user);
      } else {
        setAuthError(res.message || "Invalid administrator credentials.");
      }
    } catch (err) {
      setAuthError(err.message || "Failed to reach atelier authentication server.");
    } finally {
      setAuthLoading(false);
    }
  };
  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };
  // Operational Notifications Drawer State
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [adminUnreadCount, setAdminUnreadCount] = useState(0);
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState(null);
  const [notifCategory, setNotifCategory] = useState("ALL");
  const userId = user?.id;
  const userRole = user?.role;

  const fetchUnreadCount = useCallback(async () => {
    if (userId && userRole === "ADMIN") {
      try {
        const res = await adminApi.getUnreadCount();
        if (res && res.success && typeof res.data?.count === "number") {
          setAdminUnreadCount(res.data.count);
        }
      } catch {
        // Graceful non-blocking fallback if backend is offline/unreachable
      }
    }
  }, [userId, userRole]);
  const loadNotifications = useCallback(async () => {
    if (!userId || userRole !== "ADMIN") return;
    setNotifLoading(true);
    setNotifError(null);
    try {
      const res = await adminApi.getNotifications({ category: notifCategory });
      if (res && res.success && res.data) {
        setAdminNotifications(res.data.notifications || []);
        if (typeof res.data.unreadCount === "number") {
          setAdminUnreadCount(res.data.unreadCount);
        }
        setNotifLoading(false);
        return;
      }
    } catch {
      // Backend is offline or running in static preview mode
    } finally {
      setNotifLoading(false);
    }

    const local = getAdminNotifications(notifCategory);
    setAdminNotifications(local);
    setAdminUnreadCount(local.filter((n) => !n.is_read && !n.isRead).length);
  }, [userId, userRole, notifCategory]);
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);
  useEffect(() => {
    if (notificationsOpen) {
      loadNotifications();
    }
  }, [notificationsOpen, loadNotifications]);
  const handleMarkItemRead = async (item) => {
    const actionTarget = item.actionUrl || item.action_url;
    const isUnread = !item.is_read && !item.isRead;
    if (isUnread) {
      setAdminNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, is_read: true, isRead: true } : n)),
      );
      setAdminUnreadCount((c) => Math.max(0, c - 1));
      try {
        await adminApi.markNotificationRead(item.id);
      } catch (e) {
        console.error("Failed to mark notification read:", e);
      }
    }
    if (actionTarget) {
      setNotificationsOpen(false);
      navigate(actionTarget);
    }
  };
  const handleMarkAllRead = async () => {
    setAdminNotifications((prev) => prev.map((n) => ({ ...n, is_read: true, isRead: true })));
    setAdminUnreadCount(0);
    try {
      await adminApi.markAllNotificationsRead();
    } catch (e) {
      console.error("Failed to mark all read:", e);
    }
  };
  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear all operational alerts?")) return;
    setAdminNotifications([]);
    setAdminUnreadCount(0);
    try {
      await adminApi.clearAllNotifications();
    } catch (e) {
      console.error("Failed to clear notifications:", e);
      loadNotifications();
    }
  };
  // If user is not authorized as Admin, show authorization guard
  if (!user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen w-full bg-[#FAF8F5] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#E5DCCD] p-8 shadow-luxury text-center space-y-6">
          <div className="h-16 w-16 rounded-3xl bg-[#0D1B2A] text-[#C8A96E] grid place-items-center mx-auto shadow-md">
            <Lock className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8B1E3F]">
              RESTRICTED STORE CONSOLE
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0D1B2A]">
              Admin Authorization Required
            </h1>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              This area is strictly restricted to authorized HOPO SHOP store managers and inventory
              executives.
            </p>
          </div>

          <form onSubmit={handleAdminAuth} className="space-y-4 text-left pt-2">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0D1B2A] mb-1">
                Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5DCCD] text-xs focus:outline-none focus:border-[#8B1E3F] bg-[#FAF8F5]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0D1B2A] mb-1">
                Security Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5DCCD] text-xs focus:outline-none focus:border-[#8B1E3F] bg-[#FAF8F5]"
              />
            </div>

            {authError && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 p-2.5 rounded-xl text-center">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3.5 rounded-full bg-[#0D1B2A] text-[#C8A96E] text-xs font-bold uppercase tracking-widest hover:bg-[#1E293B] transition shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>
                {authLoading ? "Verifying Credentials..." : "Authenticate as Store Admin"}
              </span>
            </button>
          </form>

          <Link
            to="/home"
            className="block w-full py-3 rounded-full border border-[#E5DCCD] text-[#0D1B2A] text-xs font-bold uppercase tracking-wider hover:bg-[#F7F2E9] transition"
          >
            Return to Storefront
          </Link>
        </div>
      </div>
    );
  }
  const initials =
    user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2) || "AD";
  const NavLinks = () => (
    <>
      {NAV.map(({ to, label, icon: Icon, exact }) => {
        const active = exact ? path === to : path.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider transition ${
              active
                ? "bg-[#8B1E3F] text-white shadow-xs"
                : "text-[#6B7280] hover:bg-[#F7F2E9] hover:text-[#0D1B2A]"
            }`}
          >
            <Icon className={`h-4 w-4 ${active ? "text-white" : "text-[#8B1E3F]"}`} />
            <span>{label}</span>
          </Link>
        );
      })}
    </>
  );
  return (
    <div className="min-h-screen w-full bg-[#FAF8F5] flex font-sans">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-[#E5DCCD] bg-white">
        <div className="px-6 py-6 border-b border-[#E5DCCD]">
          <Logo className="w-[125px] lg:w-[138px] max-w-[150px] h-auto" to="/admin" />
          <div className="mt-3 flex items-center gap-1.5">
            <span className="text-[9px] tracking-[0.25em] uppercase text-[#8B1E3F] font-bold">
              OPERATIONS CENTER
            </span>
          </div>
          <p className="mt-1 text-[11px] text-[#6B7280]">Merchant & inventory control</p>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <NavLinks />
        </nav>

        <div className="p-4 border-t border-[#E5DCCD] space-y-2 bg-[#F7F2E9]">
          <Link
            to="/home"
            className="flex items-center justify-between text-xs text-[#8B1E3F] font-bold uppercase tracking-wider hover:underline"
          >
            <span>Live Storefront</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-xs text-[#6B7280] hover:text-[#8B1E3F] font-semibold pt-1"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-left">
            <div className="px-6 py-5 border-b border-[#E5DCCD] flex items-center justify-between">
              <Logo className="w-[115px] max-w-[130px] h-auto" to="/admin" />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-md text-[#6B7280] hover:text-[#0D1B2A]"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
              <NavLinks />
            </nav>
            <div className="p-4 border-t border-[#E5DCCD] text-xs text-[#6B7280]">
              <Link
                to="/home"
                className="text-[#8B1E3F] font-bold uppercase tracking-wider underline"
              >
                View Storefront
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 px-4 lg:px-8 py-3.5 border-b border-[#E5DCCD] bg-white/95 backdrop-blur">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="lg:hidden -ml-1 p-2 rounded-md hover:bg-[#F7F2E9]"
              aria-label="Back"
            >
              <ChevronLeft className="h-5 w-5 text-[#0D1B2A]" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-md hover:bg-[#F7F2E9]"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5 text-[#0D1B2A]" />
            </button>
            <div className="min-w-0">
              <h1 className="font-display text-xl sm:text-2xl font-bold text-[#0D1B2A] truncate">
                {title}
              </h1>
              {subtitle && <p className="text-xs text-[#6B7280] truncate">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 rounded-full border border-[#E5DCCD] px-3.5 py-1.5 bg-[#F7F2E9] w-72 focus-within:ring-2 focus-within:ring-[#8B1E3F]/30">
              <Search className="h-4 w-4 text-[#6B7280]" />
              <input
                placeholder="Search products, orders, customers…"
                aria-label="Search admin products, orders, and customers"
                className="bg-transparent outline-none text-xs text-[#0D1B2A] w-full"
              />
            </div>
            <button
              onClick={() => setNotificationsOpen(true)}
              className="p-2.5 rounded-full border border-[#E5DCCD] hover:bg-[#F7F2E9] relative text-[#0D1B2A] transition"
              aria-label="Operational Notifications"
              title="Operational Notifications"
            >
              <Bell className="h-4 w-4" />
              {adminUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-[#8B1E3F] text-white text-[9px] font-bold grid place-items-center shadow-xs">
                  {adminUnreadCount}
                </span>
              )}
            </button>
            <div className="ml-1 h-9 w-9 rounded-full bg-[#0D1B2A] border border-[#C8A96E] grid place-items-center text-[#C8A96E] text-xs font-bold shadow-xs">
              {initials}
            </div>
          </div>
        </header>

        {actions && (
          <div className="px-4 lg:px-8 py-3 flex flex-wrap items-center gap-2 border-b border-[#E5DCCD] bg-white">
            {actions}
          </div>
        )}

        <main className="flex-1 p-4 lg:p-8 space-y-6">{children}</main>

        {/* Operational Notifications Slide-over Drawer */}
        {notificationsOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
              onClick={() => setNotificationsOpen(false)}
            />
            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
              <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-[#E5DCCD] animate-in slide-in-from-right duration-200">
                {/* Header */}
                <div className="px-6 py-5 border-b border-[#E5DCCD] bg-[#FAF8F5] flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h2 className="font-display text-base font-bold text-[#0D1B2A]">
                        Operational Alerts
                      </h2>
                      {adminUnreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-[#8B1E3F] text-white text-[10px] font-bold">
                          {adminUnreadCount} unread
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#6B7280]">
                      Real-time orders, dispatch & stock alerts
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    {adminUnreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="p-1.5 rounded-lg hover:bg-white text-[#8B1E3F] text-xs font-semibold transition"
                        title="Mark all as read"
                      >
                        <CheckCheck className="h-4 w-4" />
                      </button>
                    )}
                    {adminNotifications.length > 0 && (
                      <button
                        onClick={handleClearAll}
                        className="p-1.5 rounded-lg hover:bg-white text-[#8B1E3F] text-xs font-semibold transition"
                        title="Clear all alerts"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setNotificationsOpen(false)}
                      className="p-1.5 rounded-lg hover:bg-[#EFE7D8] text-[#6B7280] hover:text-[#0D1B2A] transition ml-1"
                      aria-label="Close drawer"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="px-6 py-2.5 border-b border-[#E5DCCD] bg-white flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {["ALL", "ORDERS", "INVENTORY", "OFFERS"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setNotifCategory(tab)}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold transition whitespace-nowrap ${
                        notifCategory === tab
                          ? "bg-[#8B1E3F] text-white"
                          : "bg-[#FAF8F5] text-[#6B7280] hover:text-[#0D1B2A] border border-[#E5DCCD]"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Body / List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {notifLoading && (
                    <div className="space-y-3 p-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="p-4 rounded-2xl border border-[#E5DCCD] bg-[#FAF8F5] animate-pulse flex gap-3"
                        >
                          <div className="h-10 w-10 rounded-xl bg-[#E5DCCD]/60 shrink-0" />
                          <div className="flex-1 space-y-2 py-1">
                            <div className="h-3.5 bg-[#E5DCCD]/60 rounded w-3/4" />
                            <div className="h-2.5 bg-[#E5DCCD]/40 rounded w-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {notifError && (
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between">
                      <span>{notifError}</span>
                      <button onClick={loadNotifications} className="font-bold underline ml-2">
                        Retry
                      </button>
                    </div>
                  )}

                  {!notifLoading && !notifError && adminNotifications.length === 0 && (
                    <div className="py-16 px-6 text-center space-y-3">
                      <div className="h-12 w-12 rounded-2xl bg-[#F7F2E9] border border-[#E5DCCD] text-[#C8A96E] grid place-items-center mx-auto">
                        <Bell className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-bold text-[#0D1B2A]">No Operational Alerts</p>
                      <p className="text-xs text-[#6B7280] max-w-xs mx-auto">
                        There are currently no active alerts under this category. Atelier orders and
                        stock updates will populate here automatically.
                      </p>
                    </div>
                  )}

                  {!notifLoading &&
                    adminNotifications.map((item) => {
                      const isUnread = !item.is_read && !item.isRead;
                      const timeStr = formatRelativeTime(item.createdAt || item.created_at);
                      const img = item.imageUrl || item.image_url;
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleMarkItemRead(item)}
                          className={`p-3.5 rounded-2xl border transition cursor-pointer flex gap-3.5 relative group ${
                            isUnread
                              ? "bg-[#FAF7F2] border-[#C8A96E]/50 hover:bg-[#F6F1E8]"
                              : "bg-white border-[#E5DCCD] hover:bg-[#FAF8F5]"
                          }`}
                        >
                          {img ? (
                            <div className="h-10 w-10 shrink-0 rounded-xl overflow-hidden bg-[#FAF6EE] border border-[#E5DCCD]">
                              <img src={img} alt="" className="h-full w-full object-cover" />
                            </div>
                          ) : (
                            <div className="h-10 w-10 shrink-0 rounded-xl bg-[#F7F2E9] border border-[#E5DCCD] text-[#8B1E3F] grid place-items-center">
                              {item.category === "INVENTORY" ? (
                                <Boxes className="h-5 w-5 text-[#B45309]" />
                              ) : item.category === "OFFERS" ? (
                                <Tag className="h-5 w-5 text-[#047857]" />
                              ) : (
                                <ShoppingCart className="h-5 w-5 text-[#8B1E3F]" />
                              )}
                            </div>
                          )}

                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-start justify-between gap-1">
                              <p
                                className={`text-xs font-bold truncate ${isUnread ? "text-[#0D1B2A]" : "text-[#4A5568]"}`}
                              >
                                {item.title}
                              </p>
                              {isUnread && (
                                <span className="h-2 w-2 rounded-full bg-[#8B1E3F] shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-[11px] text-[#6B7280] leading-relaxed line-clamp-2">
                              {item.body}
                            </p>
                            <div className="flex items-center justify-between pt-1 text-[10px] text-[#9CA3AF]">
                              <span>{timeStr}</span>
                              <span className="text-[#8B1E3F] font-semibold flex items-center gap-0.5 group-hover:underline">
                                <span>Inspect</span>
                                <ChevronRight className="h-3 w-3" />
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export function StatCard({ label, value, delta, trend = "up", icon: Icon }) {
  return (
    <div className="rounded-3xl border border-[#E5DCCD] bg-white p-5 shadow-subtle">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">{label}</p>
        {Icon && <Icon className="h-4 w-4 text-[#C8A96E]" />}
      </div>
      <p className="mt-2 font-display text-2xl sm:text-3xl font-bold text-[#0D1B2A]">{value}</p>
      {delta && (
        <p
          className={`mt-1 text-[11px] font-bold ${trend === "up" ? "text-[#2E7D6B]" : "text-[#8B1E3F]"}`}
        >
          {trend === "up" ? "▲" : "▼"} {delta} vs last period
        </p>
      )}
    </div>
  );
}
export function Panel({ title, action, children }) {
  return (
    <section className="rounded-3xl border border-[#E5DCCD] bg-white shadow-subtle overflow-hidden">
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#E5DCCD]">
        <h3 className="font-display text-base sm:text-lg font-bold text-[#0D1B2A]">{title}</h3>
        {action}
      </header>
      <div className="p-6">{children}</div>
    </section>
  );
}
