import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { MobileFrame, AppHeader, BottomNav } from "@/components/app/MobileShell";
import { EmptyState } from "@/components/app/EmptyState";
import {
  Bell,
  Trash2,
  CheckCheck,
  Package,
  Sparkles,
  ChevronRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  getAuthUser,
  useStoreSync,
  getNotifications,
  setUnreadNotificationCount,
  clearNotifications,
} from "@/lib/store";
import { notificationApi } from "@/services/api/index";
import { formatRelativeTime } from "@/lib/time-utils";
export function Notifications() {
  useStoreSync();
  const user = getAuthUser();
  const location = useLocation();
  const navigate = useNavigate();

  const userId = user?.id;

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("ALL");
  const [actionInProgress, setActionInProgress] = useState(null);

  // Fetch notifications from live database with seamless local store fallback
  const loadNotifications = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await notificationApi.getNotifications({ limit: 50 });
      if (res && res.success && res.data) {
        setNotifications(res.data.notifications || []);
        if (typeof res.data.unreadCount === "number") {
          setUnreadNotificationCount(res.data.unreadCount);
        }
        setLoading(false);
        return;
      }
    } catch {
      // Backend is offline or running in static preview mode (e.g. Vercel)
    } finally {
      setLoading(false);
    }

    // Graceful fallback to client stored notifications
    const local = getNotifications();
    setNotifications(local);
    const unread = local.filter((n) => !n.is_read && !n.isRead && !n.read).length;
    setUnreadNotificationCount(unread);
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadNotifications();
    }
  }, [userId, loadNotifications]);

  // Tab counts
  const counts = useMemo(() => {
    const total = notifications.length;
    const orders = notifications.filter(
      (n) => n.category?.toUpperCase() === "ORDERS" || n.category?.toUpperCase() === "ORDER",
    ).length;
    const offers = notifications.filter(
      (n) => n.category?.toUpperCase() === "OFFERS" || n.category?.toUpperCase() === "OFFER",
    ).length;
    const unread = notifications.filter((n) => !n.is_read && !n.isRead).length;
    return { total, orders, offers, unread };
  }, [notifications]);

  // Filtered list based on active tab
  const filteredNotifications = useMemo(() => {
    if (activeTab === "ORDERS") {
      return notifications.filter(
        (n) => n.category?.toUpperCase() === "ORDERS" || n.category?.toUpperCase() === "ORDER",
      );
    }
    if (activeTab === "OFFERS") {
      return notifications.filter(
        (n) => n.category?.toUpperCase() === "OFFERS" || n.category?.toUpperCase() === "OFFER",
      );
    }
    return notifications;
  }, [notifications, activeTab]);

  // Guard: Protect /notifications against unauthenticated guest access
  if (!user) {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${returnUrl}`} replace />;
  }
  // Mark single notification as read & navigate if action_url exists
  const handleItemClick = async (item) => {
    const actionTarget = item.actionUrl || item.action_url;
    const isUnread = !item.is_read && !item.isRead;
    if (isUnread) {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, is_read: true, isRead: true } : n)),
      );
      setUnreadNotificationCount(Math.max(0, counts.unread - 1));
      try {
        const res = await notificationApi.markRead(item.id);
        if (res.success && typeof res.data?.unreadCount === "number") {
          setUnreadNotificationCount(res.data.unreadCount);
        }
      } catch (e) {
        console.error("Failed to sync read status:", e);
      }
    }
    if (actionTarget) {
      navigate(actionTarget);
    }
  };
  // Mark all as read
  const handleMarkAllRead = async () => {
    setActionInProgress("read-all");
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true, isRead: true })));
    setUnreadNotificationCount(0);
    try {
      await notificationApi.markAllRead();
    } catch (e) {
      console.error("Failed to mark all as read:", e);
    } finally {
      setActionInProgress(null);
    }
  };
  // Clear all notifications
  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you wish to clear all notifications?")) {
      return;
    }
    setActionInProgress("clear-all");
    setNotifications([]);
    clearNotifications();
    try {
      await notificationApi.clearAll();
    } catch (e) {
      console.error("Failed to clear notifications:", e);
      loadNotifications();
    } finally {
      setActionInProgress(null);
    }
  };
  // Delete single notification
  const handleDeleteItem = async (e, id) => {
    e.stopPropagation();
    const itemToDelete = notifications.find((n) => n.id === id);
    const wasUnread = itemToDelete && !itemToDelete.is_read && !itemToDelete.isRead;
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (wasUnread) {
      setUnreadNotificationCount(Math.max(0, counts.unread - 1));
    }
    try {
      await notificationApi.deleteNotification(id);
    } catch (err) {
      console.error("Failed to delete notification:", err);
      loadNotifications();
    }
  };
  // Helper for category badge/icon
  const renderCategoryIcon = (item) => {
    const imgUrl = item.imageUrl || item.image_url;
    if (imgUrl) {
      return (
        <div className="h-11 w-11 shrink-0 rounded-2xl overflow-hidden bg-[#FAF6EE] border border-[#E5DCCD] relative">
          <img
            src={imgUrl}
            alt=""
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      );
    }
    const cat = item.category?.toUpperCase();
    if (cat === "ORDERS" || cat === "ORDER") {
      return (
        <span className="h-11 w-11 shrink-0 rounded-2xl bg-[#F5E8EA] border border-[#EACFD4] text-[#8B1E3F] flex items-center justify-center">
          <Package className="h-5 w-5" />
        </span>
      );
    }
    if (cat === "OFFERS" || cat === "OFFER") {
      return (
        <span className="h-11 w-11 shrink-0 rounded-2xl bg-[#FBF7EE] border border-[#E8DCC2] text-[#B45309] flex items-center justify-center">
          <Sparkles className="h-5 w-5" />
        </span>
      );
    }
    return (
      <span className="h-11 w-11 shrink-0 rounded-2xl bg-[#F7F2E9] border border-[#E5DCCD] text-[#8B1E3F] flex items-center justify-center">
        <Bell className="h-5 w-5" />
      </span>
    );
  };
  return (
    <MobileFrame>
      <AppHeader title="VIP Alerts & Notifications" back showBell={false} />

      <div className="space-y-4 pb-12">
        {/* Top Controls Bar */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <h1 className="font-display text-lg sm:text-xl font-bold text-[#0D1B2A] tracking-tight">
              VIP Notifications
            </h1>
            <p className="text-xs text-[#6B7280]">
              Real-time updates, atelier dispatch milestones & exclusive salon offers
            </p>
          </div>

          <div className="flex items-center gap-2">
            {counts.unread > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={actionInProgress === "read-all"}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF6EE] hover:bg-[#F0EAE1] text-[#8B1E3F] border border-[#E5DCCD] text-xs font-semibold transition"
                title="Mark all as read"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Mark Read</span>
              </button>
            )}

            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                disabled={actionInProgress === "clear-all"}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-[#F5E8EA] text-[#8B1E3F] border border-transparent hover:border-[#EACFD4] text-xs font-semibold transition"
                title="Clear all notifications"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        {notifications.length > 0 && (
          <div className="flex items-center gap-2 border-b border-[#E5DCCD]/80 pb-3 pt-1 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("ALL")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "ALL"
                  ? "bg-[#8B1E3F] text-white shadow-xs"
                  : "bg-[#FAF6EE] text-[#6B7280] hover:text-[#0D1B2A] border border-[#E5DCCD]"
              }`}
            >
              <span>All</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === "ALL" ? "bg-white/20 text-white" : "bg-[#E5DCCD]/60 text-[#6B7280]"}`}
              >
                {counts.total}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("ORDERS")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "ORDERS"
                  ? "bg-[#8B1E3F] text-white shadow-xs"
                  : "bg-[#FAF6EE] text-[#6B7280] hover:text-[#0D1B2A] border border-[#E5DCCD]"
              }`}
            >
              <span>Orders</span>
              {counts.orders > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === "ORDERS" ? "bg-white/20 text-white" : "bg-[#E5DCCD]/60 text-[#6B7280]"}`}
                >
                  {counts.orders}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("OFFERS")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "OFFERS"
                  ? "bg-[#8B1E3F] text-white shadow-xs"
                  : "bg-[#FAF6EE] text-[#6B7280] hover:text-[#0D1B2A] border border-[#E5DCCD]"
              }`}
            >
              <span>Offers</span>
              {counts.offers > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === "OFFERS" ? "bg-white/20 text-white" : "bg-[#E5DCCD]/60 text-[#6B7280]"}`}
                >
                  {counts.offers}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Error Notice with Retry */}
        {error && notifications.length === 0 && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex items-center justify-between text-xs text-red-800 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadNotifications}
              className="inline-flex items-center gap-1 font-bold text-[#8B1E3F] hover:underline shrink-0 ml-2"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Retry
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-3xl border border-[#E5DCCD]/70 bg-white p-4 sm:p-5 flex gap-4 animate-pulse"
              >
                <div className="h-11 w-11 rounded-2xl bg-[#FAF6EE] shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-[#FAF6EE] rounded w-2/3" />
                  <div className="h-3 bg-[#FAF6EE] rounded w-full" />
                  <div className="h-2.5 bg-[#FAF6EE] rounded w-1/4 pt-1" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredNotifications.length === 0 && (
          <EmptyState
            icon={Bell}
            title={
              activeTab === "ALL"
                ? "No Notifications Yet"
                : `No ${activeTab.toLowerCase()} notifications`
            }
            description={
              activeTab === "ALL"
                ? "Your order updates, delivery milestones, and exclusive private salon offers will appear here automatically."
                : `There are currently no active alerts under the ${activeTab.toLowerCase()} category.`
            }
            actionLabel="Explore Haute Couture"
            actionTo="/home"
          />
        )}

        {/* Notifications List */}
        {!loading && filteredNotifications.length > 0 && (
          <div className="rounded-3xl border border-[#E5DCCD] bg-white divide-y divide-[#E5DCCD]/70 shadow-subtle overflow-hidden">
            {filteredNotifications.map((item) => {
              const isUnread = !item.is_read && !item.isRead;
              const timeDisplay = formatRelativeTime(item.createdAt || item.created_at);
              const actionTarget = item.actionUrl || item.action_url;
              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`flex gap-3.5 sm:gap-4 p-4 sm:p-5 transition cursor-pointer relative group ${
                    isUnread ? "bg-[#FAF7F2] hover:bg-[#F6F1E8]" : "bg-white hover:bg-[#FAF8F5]"
                  }`}
                >
                  {/* Category / Entity Thumbnail */}
                  {renderCategoryIcon(item)}

                  {/* Body Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-xs sm:text-sm font-bold truncate ${isUnread ? "text-[#0D1B2A]" : "text-[#2D3748]"}`}
                        >
                          {item.title}
                        </p>
                        {isUnread && (
                          <span
                            className="h-2 w-2 rounded-full bg-[#8B1E3F] shrink-0"
                            title="Unread"
                          />
                        )}
                      </div>

                      <span className="text-[10px] text-[#8B1E3F] font-bold tracking-wider shrink-0 bg-[#F5E8EA] px-2 py-0.5 rounded-full border border-[#EACFD4]">
                        {item.category?.toUpperCase() || "VIP"}
                      </span>
                    </div>

                    <p className="text-xs text-[#6B7280] leading-relaxed line-clamp-2">
                      {item.body}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[10px] text-[#9CA3AF]">
                      <span>{timeDisplay}</span>

                      <div className="flex items-center gap-3">
                        {actionTarget && (
                          <span className="inline-flex items-center gap-0.5 text-[#8B1E3F] font-semibold hover:underline">
                            <span>View</span>
                            <ChevronRight className="h-3 w-3" />
                          </span>
                        )}

                        <button
                          onClick={(e) => handleDeleteItem(e, item.id)}
                          className="opacity-0 group-hover:opacity-100 hover:text-red-600 transition p-0.5"
                          title="Delete notification"
                          aria-label="Delete notification"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav active="profile" />
    </MobileFrame>
  );
}
export default Notifications;
