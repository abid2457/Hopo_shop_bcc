/**
 * HOPO SHOP INDIA — Modular API Service Layer
 * Connects frontend views cleanly to the PHP REST endpoints.
 */
import { apiService, setAuthToken } from "../api";
// --- AUTH API ---
export const authApi = {
  login: async (email, password) => {
    const res = await apiService.post("api/auth/login", { email, password });
    if (res.success && res.data?.token) {
      setAuthToken(res.data.token);
    }
    return res;
  },
  register: async (name, email, password, phone) => {
    const res = await apiService.post("api/auth/register", { name, email, password, phone });
    if (res.success && res.data?.token) {
      setAuthToken(res.data.token);
    }
    return res;
  },
  me: async () => {
    return apiService.get("api/auth/me");
  },
  logout: async () => {
    setAuthToken(null);
    return apiService.post("api/auth/logout");
  },
};
// --- CATALOG & PRODUCTS API ---
export const productApi = {
  getCategories: async () => {
    return apiService.get("api/categories");
  },
  getProducts: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.category) query.set("category", params.category);
    if (params.search) query.set("search", params.search);
    if (params.fabric) query.set("fabric", params.fabric);
    if (params.occasion) query.set("occasion", params.occasion);
    if (params.minPrice) query.set("min_price", params.minPrice.toString());
    if (params.maxPrice) query.set("max_price", params.maxPrice.toString());
    if (params.sort) query.set("sort", params.sort);
    if (params.page) query.set("page", params.page.toString());
    if (params.limit) query.set("limit", params.limit.toString());
    const qs = query.toString();
    return apiService.get(`api/products${qs ? `?${qs}` : ""}`);
  },
  getProductById: async (id) => {
    return apiService.get(`api/products/${id}`);
  },
};
// --- CART API ---
export const cartApi = {
  getCart: async () => {
    return apiService.get("api/cart");
  },
  addItem: async (item) => {
    return apiService.post("api/cart/items", item);
  },
  updateItem: async (cartItemId, quantity) => {
    return apiService.put(`api/cart/items/${cartItemId}`, { quantity });
  },
  removeItem: async (cartItemId) => {
    return apiService.delete(`api/cart/items/${cartItemId}`);
  },
  clearCart: async () => {
    return apiService.delete("api/cart");
  },
  applyCoupon: async (code) => {
    return apiService.post("api/cart/coupon", { code });
  },
  removeCoupon: async () => {
    return apiService.delete("api/cart/coupon");
  },
};
// --- WISHLIST API ---
export const wishlistApi = {
  getWishlist: async () => {
    return apiService.get("api/wishlist");
  },
  toggle: async (productId) => {
    return apiService.post("api/wishlist/toggle", { productId });
  },
  remove: async (productId) => {
    return apiService.delete(`api/wishlist/${productId}`);
  },
};
// --- ORDERS API ---
export const orderApi = {
  checkout: async (payload) => {
    return apiService.post("api/orders/checkout", payload);
  },
  getOrders: async () => {
    return apiService.get("api/orders");
  },
  getOrderById: async (id) => {
    return apiService.get(`api/orders/${id}`);
  },
  cancelOrder: async (id) => {
    return apiService.post(`api/orders/${id}/cancel`);
  },
  returnOrder: async (id, reason) => {
    return apiService.post(`api/orders/${id}/return`, { reason });
  },
};
// --- COUPONS API ---
export const couponApi = {
  getCoupons: async () => {
    return apiService.get("api/coupons");
  },
  validate: async (code, subtotal, items = []) => {
    return apiService.post("api/coupons/validate", { code, subtotal, items });
  },
};
// --- USER & ADDRESSES API ---
export const userApi = {
  getProfile: async () => {
    return apiService.get("api/user/profile");
  },
  updateProfile: async (payload) => {
    return apiService.put("api/user/profile", payload);
  },
  getAddresses: async () => {
    return apiService.get("api/user/addresses");
  },
  addAddress: async (address) => {
    return apiService.post("api/user/addresses", address);
  },
  updateAddress: async (id, address) => {
    return apiService.put(`api/user/addresses/${id}`, address);
  },
  deleteAddress: async (id) => {
    return apiService.delete(`api/user/addresses/${id}`);
  },
  setDefaultAddress: async (id) => {
    return apiService.put(`api/user/addresses/${id}/default`);
  },
};
// --- EDITORIAL BANNERS (PUBLIC) ---
export const bannerApi = {
  getBanners: async (slot) => {
    return apiService.get(`api/banners${slot ? `?slot=${slot}` : ""}`);
  },
};
// --- ANALYTICS (PUBLIC TRACKING) ---
export const analyticsApi = {
  track: async (eventType, metadata, channel) => {
    return apiService.post("api/analytics/track", {
      eventType,
      metadata,
      channel: channel || "Direct VIP Concierge",
      sessionId:
        typeof window !== "undefined"
          ? sessionStorage.getItem("hopo_sess_id") || "sess_" + Math.random().toString(36).slice(2)
          : undefined,
    });
  },
};
// --- ADMIN API (COMPREHENSIVE CMS) ---
export const adminApi = {
  // 0. Image Uploads
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiService.upload("api/admin/upload", formData);
  },
  uploadImages: async (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images[]", file));
    return apiService.upload("api/admin/upload", formData);
  },
  deleteUploadedImage: async (url) => {
    return apiService.post("api/admin/upload/delete", { url });
  },
  // 1. Executive Overview
  getOverview: async () => {
    return apiService.get("api/admin/overview");
  },
  // 2. Couture Products
  getProducts: async () => {
    return apiService.get("api/admin/products");
  },
  createProduct: async (product) => {
    return apiService.post("api/admin/products", product);
  },
  updateProduct: async (id, product) => {
    return apiService.put(`api/admin/products/${id}`, product);
  },
  deleteProduct: async (id) => {
    return apiService.delete(`api/admin/products/${id}`);
  },
  setPriceOverride: async (productId, overridePrice, overrideMrp) => {
    return apiService.post(`api/admin/products/${productId}/price-override`, {
      overridePrice,
      overrideMrp,
    });
  },
  clearPriceOverride: async (productId) => {
    return apiService.delete(`api/admin/products/${productId}/price-override`);
  },
  // 3. Heirloom Categories
  getCategories: async () => {
    return apiService.get("api/admin/categories");
  },
  createCategory: async (category) => {
    return apiService.post("api/admin/categories", category);
  },
  updateCategory: async (id, category) => {
    return apiService.put(`api/admin/categories/${id}`, category);
  },
  deleteCategory: async (id) => {
    return apiService.delete(`api/admin/categories/${id}`);
  },
  // 4. Silk Stock & Inventory
  getInventory: async () => {
    return apiService.get("api/admin/inventory");
  },
  updateInventory: async (variantSizeId, stock) => {
    return apiService.put(`api/admin/inventory/${variantSizeId}`, { stock });
  },
  // 5. Orders
  getOrders: async (status) => {
    return apiService.get(`api/admin/orders${status ? `?status=${status}` : ""}`);
  },
  getOrderDetails: async (orderId) => {
    return apiService.get(`api/admin/orders/${orderId}`);
  },
  updateOrderStatus: async (orderId, status) => {
    return apiService.put(`api/admin/orders/${orderId}/status`, { status });
  },
  addOrderTimeline: async (orderId, title, description, status) => {
    return apiService.post(`api/admin/orders/${orderId}/timeline`, { title, description, status });
  },
  // 6. Customers
  getCustomers: async () => {
    return apiService.get("api/admin/customers");
  },
  updateCustomerTier: async (id, tier, points) => {
    return apiService.put(`api/admin/customers/${id}/tier`, { tier, points });
  },
  // 7. Special Offers
  getOffers: async () => {
    return apiService.get("api/admin/offers");
  },
  createOffer: async (offer) => {
    return apiService.post("api/admin/offers", offer);
  },
  updateOffer: async (id, offer) => {
    return apiService.put(`api/admin/offers/${id}`, offer);
  },
  deleteOffer: async (id) => {
    return apiService.delete(`api/admin/offers/${id}`);
  },
  // 8. Festive Coupons
  getCoupons: async () => {
    return apiService.get("api/admin/coupons");
  },
  createCoupon: async (coupon) => {
    return apiService.post("api/admin/coupons", coupon);
  },
  updateCoupon: async (id, data) => {
    return apiService.put(`api/admin/coupons/${id}`, data);
  },
  deleteCoupon: async (id) => {
    return apiService.delete(`api/admin/coupons/${id}`);
  },
  // 9. Editorial Banners
  getBanners: async () => {
    return apiService.get("api/admin/banners");
  },
  createBanner: async (banner) => {
    return apiService.post("api/admin/banners", banner);
  },
  updateBanner: async (id, banner) => {
    return apiService.put(`api/admin/banners/${id}`, banner);
  },
  deleteBanner: async (id) => {
    return apiService.delete(`api/admin/banners/${id}`);
  },
  // 10. Conversion Analytics
  getAnalytics: async () => {
    return apiService.get("api/admin/analytics");
  },
  // 11. Financial Reports
  getReports: async (from, to) => {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const qs = params.toString();
    return apiService.get(`api/admin/reports${qs ? `?${qs}` : ""}`);
  },
  // 12. Operational Notifications
  getNotifications: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== "ALL") query.set("category", params.category);
    if (params.unread) query.set("unread", "1");
    const qs = query.toString();
    return apiService.get(`api/admin/notifications${qs ? `?${qs}` : ""}`);
  },
  getUnreadCount: async () => {
    return apiService.get("api/admin/notifications/unread-count");
  },
  markNotificationRead: async (id) => {
    return apiService.put(`api/admin/notifications/${id}/read`);
  },
  markAllNotificationsRead: async () => {
    return apiService.put("api/admin/notifications/read-all");
  },
  clearAllNotifications: async () => {
    return apiService.delete("api/admin/notifications/clear-all");
  },
};
// --- CUSTOMER NOTIFICATIONS API ---
export const notificationApi = {
  getNotifications: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", params.page.toString());
    if (params.limit) query.set("limit", params.limit.toString());
    const qs = query.toString();
    return apiService.get(`api/notifications${qs ? `?${qs}` : ""}`);
  },
  getUnreadCount: async () => {
    return apiService.get("api/notifications/unread-count");
  },
  markRead: async (id) => {
    return apiService.put(`api/notifications/${id}/read`);
  },
  markAllRead: async () => {
    return apiService.put("api/notifications/read-all");
  },
  clearAll: async () => {
    return apiService.delete("api/notifications/clear-all");
  },
  deleteNotification: async (id) => {
    return apiService.delete(`api/notifications/${id}`);
  },
};
