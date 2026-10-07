import { useState, useEffect } from "react";
import { BUSINESS_CONFIG } from "./business-config";
import { resolveProductImage } from "./image-resolver";
import { authApi, orderApi, adminApi, notificationApi } from "../services/api/index";
// --- INITIAL DEFAULT COUPONS (WITH DYNAMIC EXPIRY) ---
const FUTURE_DATE_1 = new Date(Date.now() + 30 * 86400000).toISOString();
const FUTURE_DATE_2 = new Date(Date.now() + 60 * 86400000).toISOString();
export const DEFAULT_COUPONS = [
  {
    code: "FESTIVE40",
    title: "Festive Grand Sale",
    description: "Flat ₹2,400 off on bridal & wedding orders above ₹4,999",
    discountType: "FLAT",
    discountValue: 2400,
    minOrderAmount: 4999,
    expiryDate: FUTURE_DATE_1,
    enabled: true,
  },
  {
    code: "HOPO10",
    title: "Atelier Welcome Offer",
    description: "10% instant discount on your first order up to ₹1,500",
    discountType: "PERCENTAGE",
    discountValue: 10,
    minOrderAmount: 1999,
    maxDiscountCap: 1500,
    expiryDate: FUTURE_DATE_2,
    enabled: true,
  },
  {
    code: "BRIDAL20",
    title: "Bridal Suite Special",
    description: "20% off on all Bridal & Wedding Blouses above ₹6,000",
    discountType: "PERCENTAGE",
    discountValue: 20,
    minOrderAmount: 6000,
    maxDiscountCap: 3000,
    expiryDate: FUTURE_DATE_1,
    enabled: true,
    categoryRestriction: "Bridal Blouses",
  },
];
// --- SIMPLE LOCALSTORAGE HELPER ---
function getStored(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}
function setStored(key, value) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event("hopo-store-update"));
  } catch (err) {
    console.error("Storage error:", err);
  }
}
// --- GLOBAL REACTIVE LISTENER HOOK ---
export function useStoreSync() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const handler = () => setTick((t) => t + 1);
    window.addEventListener("hopo-store-update", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("hopo-store-update", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
}
// ============================================================================
// ============================================================================
// TEMPORARY PURCHASE INTENT STORE (TRANSIENT NAVIGATION INTENT ONLY)
// ============================================================================
const PENDING_PURCHASE_KEY = "hopo_pending_purchase";
export function setPendingPurchaseIntent(intent) {
  if (typeof window === "undefined") return;
  if (!intent) {
    sessionStorage.removeItem(PENDING_PURCHASE_KEY);
  } else {
    sessionStorage.setItem(PENDING_PURCHASE_KEY, JSON.stringify(intent));
  }
}
export function getPendingPurchaseIntent() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PENDING_PURCHASE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
export function clearPendingPurchaseIntent() {
  setPendingPurchaseIntent(null);
}
// 1. AUTH & USER STORE
// ============================================================================
const AUTH_KEY = "hopo_auth_user";
export const ADMIN_USER = null;
let cachedAuthRaw = undefined;
let cachedAuthUser = null;

export function getAuthUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (raw === cachedAuthRaw) {
      return cachedAuthUser;
    }
    cachedAuthRaw = raw;
    cachedAuthUser = raw ? JSON.parse(raw) : null;
    return cachedAuthUser;
  } catch {
    cachedAuthUser = null;
    return null;
  }
}
export function loginCustomer(user) {
  cachedAuthRaw = undefined;
  setStored(AUTH_KEY, user);
}
export function loginAdmin(user) {
  cachedAuthRaw = undefined;
  setStored(AUTH_KEY, user);
}
export function logoutUser() {
  cachedAuthRaw = undefined;
  cachedAuthUser = null;
  if (typeof window !== "undefined") {
    authApi.logout().catch(() => {});
    localStorage.removeItem("hopo_auth_token");
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(NOTIF_KEY);
    window.dispatchEvent(new Event("hopo-store-update"));
  }
}
export function calculateTier(points) {
  if (points >= 5000) return "Diamond";
  if (points >= 1000) return "Gold";
  return "Silver";
}
export function updateUserProfile(payload) {
  const current = getAuthUser();
  if (!current) {
    return { success: false, error: "You must be logged in to update profile." };
  }
  const updated = {
    ...current,
    name: payload.name !== undefined ? payload.name.trim() : current.name,
    displayName: payload.displayName !== undefined ? payload.displayName.trim() : (current.displayName || current.name),
    phone: payload.phone !== undefined ? payload.phone.trim() : current.phone,
    alternatePhone: payload.alternatePhone !== undefined ? payload.alternatePhone.trim() : current.alternatePhone,
    email: payload.email !== undefined ? payload.email.trim().toLowerCase() : current.email,
    avatar: payload.avatar !== undefined ? payload.avatar.trim() : current.avatar,
    jobTitle: payload.jobTitle !== undefined ? payload.jobTitle.trim() : current.jobTitle,
    department: payload.department !== undefined ? payload.department.trim() : current.department,
    tier: calculateTier(current.points),
    lastPasswordChangeAt: payload.lastPasswordChangeAt || current.lastPasswordChangeAt,
    updatedAt: new Date().toISOString(),
  };
  setStored(AUTH_KEY, updated);
  const accounts = getRegisteredAccounts();
  const idx = accounts.findIndex(
    (a) => a.id === current.id || a.email.toLowerCase() === current.email.toLowerCase(),
  );
  if (idx > -1) {
    accounts[idx] = {
      ...accounts[idx],
      name: updated.name,
      displayName: updated.displayName,
      phone: updated.phone,
      alternatePhone: updated.alternatePhone,
      email: updated.email,
      avatar: updated.avatar,
      jobTitle: updated.jobTitle,
      department: updated.department,
    };
    setStored(REGISTERED_USERS_KEY, accounts);
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("hopo-store-update"));
  }
  return { success: true, user: updated };
}
export function updateAuthUser(updated) {
  const current = getAuthUser();
  if (current) {
    setStored(AUTH_KEY, { ...current, ...updated });
  }
}
const REGISTERED_USERS_KEY = "hopo_registered_users";
export function getRegisteredAccounts() {
  return getStored(REGISTERED_USERS_KEY, []);
}
export async function authenticateUserAsync(email, password) {
  try {
    const res = await authApi.login(email, password);
    if (res.success && res.data?.user) {
      const u = res.data.user;
      const isAdmin =
        u.role === "ADMIN" ||
        u.systemRole === "ADMIN" ||
        u.role === "Super Administrator" ||
        u.accessLevel === "Full Access";
      const normalizedRole = isAdmin ? "ADMIN" : (u.role || "CUSTOMER");
      const userProfile = {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone || "",
        role: normalizedRole,
        systemRole: u.systemRole || normalizedRole,
        tier: u.tier,
        points: u.points,
        joinedDate: u.joinedDate,
        avatar: u.avatar,
      };
      if (isAdmin) {
        loginAdmin(userProfile);
      } else {
        loginCustomer(userProfile);
      }
      return { success: true, user: userProfile };
    }
    return { success: false, error: res.message || "Email or password is incorrect." };
  } catch (err) {
    return { success: false, error: err.message || "Unable to reach atelier authentication service." };
  }
}
export function authenticateUser(email, password) {
  return { success: false, error: "Authentication requires server verification via authenticateUserAsync." };
}
export async function registerCustomerAsync(name, email, password, phone = "") {
  try {
    const res = await authApi.register(name, email, password, phone);
    if (res.success && res.data?.user) {
      const u = res.data.user;
      const userProfile = {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone || "",
        role: u.role,
        tier: u.tier,
        points: u.points,
        joinedDate: u.joinedDate,
        avatar: u.avatar,
      };
      loginCustomer(userProfile);
      return { success: true, user: userProfile };
    }
    return { success: false, error: res.message || "Registration failed. Please check details." };
  } catch (err) {
    return { success: false, error: err.message || "Unable to reach atelier registration service." };
  }
}
export function registerCustomer(name, email, password) {
  return { success: false, error: "Registration requires server verification via registerCustomerAsync." };
}
// ============================================================================
// 2. CART STORE
// ============================================================================
const CART_KEY = "hopo_cart_items";
const CART_COUPON_KEY = "hopo_cart_coupon";
export function getCartItems() {
  const items = getStored(CART_KEY, []);
  return items.map((i) => ({
    ...i,
    image: resolveProductImage({
      id: i.id,
      image: i.image,
      title: i.title,
      category: i.category,
      brand: i.brand,
    }),
  }));
}
export function getCartCoupon() {
  return getStored(CART_COUPON_KEY, null);
}
export function addToCart(product, size = "M", qty = 1, variant) {
  const chosenColor = variant?.colorName || product.color || "Standard";
  const chosenImage = variant?.image || product.image;
  const cleanImage = resolveProductImage({
    id: product.id,
    image: chosenImage,
    title: product.title,
    category: product.category,
    brand: product.brand,
  });
  const effectivePrice = variant?.price ?? product.price;
  const effectiveMrp = variant?.mrp ?? product.mrp;
  const sanitizedItem = {
    ...product,
    image: cleanImage,
    price: effectivePrice,
    mrp: effectiveMrp,
    size,
    qty: Math.max(1, qty),
    selectedColor: chosenColor,
    colorHex: variant?.colorHex,
    variantId: variant?.id || `${product.id}-${size}-${chosenColor}`,
    unitPrice: effectivePrice,
  };
  const current = getCartItems();
  const existingIdx = current.findIndex(
    (i) =>
      i.id === product.id &&
      i.size.toLowerCase() === size.toLowerCase() &&
      (i.selectedColor || i.color || "").toLowerCase() === chosenColor.toLowerCase(),
  );
  let updated;
  if (existingIdx > -1) {
    updated = [...current];
    updated[existingIdx].qty = updated[existingIdx].qty + qty;
  } else {
    updated = [...current, sanitizedItem];
  }
  setStored(CART_KEY, updated);
}
export function updateCartQty(id, size, delta, color) {
  const current = getCartItems();
  const updated = current
    .map((item) => {
      const match =
        item.id === id &&
        item.size.toLowerCase() === size.toLowerCase() &&
        (!color || (item.selectedColor || item.color || "").toLowerCase() === color.toLowerCase());
      if (match) {
        const next = item.qty + delta;
        return next > 0 ? { ...item, qty: next } : null;
      }
      return item;
    })
    .filter(Boolean);
  setStored(CART_KEY, updated);
}
export function removeFromCart(id, size, color) {
  const current = getCartItems();
  const updated = current.filter((i) => {
    const match =
      i.id === id &&
      i.size.toLowerCase() === size.toLowerCase() &&
      (!color || (i.selectedColor || i.color || "").toLowerCase() === color.toLowerCase());
    return !match;
  });
  setStored(CART_KEY, updated);
}
export function clearCart() {
  setStored(CART_KEY, []);
  setStored(CART_COUPON_KEY, null);
}
export function applyCartCoupon(code) {
  const clean = code.trim().toUpperCase();
  const coupon = DEFAULT_COUPONS.find((c) => c.code === clean);
  if (!coupon) {
    return { success: false, message: `Coupon "${clean}" does not exist.`, discount: 0 };
  }
  if (!coupon.enabled) {
    return { success: false, message: `Coupon "${clean}" is currently disabled.`, discount: 0 };
  }
  if (new Date(coupon.expiryDate) < new Date()) {
    return { success: false, message: `Coupon "${clean}" has expired.`, discount: 0 };
  }
  const items = getCartItems();
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  if (subtotal < coupon.minOrderAmount) {
    return {
      success: false,
      message: `Minimum order amount of ₹${coupon.minOrderAmount.toLocaleString("en-IN")} required for ${clean}.`,
      discount: 0,
    };
  }
  let discount = 0;
  if (coupon.discountType === "FLAT") {
    discount = coupon.discountValue;
  } else {
    discount = Math.round((subtotal * coupon.discountValue) / 100);
    if (coupon.maxDiscountCap) {
      discount = Math.min(discount, coupon.maxDiscountCap);
    }
  }
  setStored(CART_COUPON_KEY, clean);
  return {
    success: true,
    message: `Promo code ${clean} applied! You saved ₹${discount.toLocaleString("en-IN")}.`,
    discount,
  };
}
export function removeCartCoupon() {
  setStored(CART_COUPON_KEY, null);
}
export function getCartCalculations() {
  const items = getCartItems();
  const appliedCode = getCartCoupon();
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const mrpTotal = items.reduce((s, i) => s + (i.mrp || i.price) * i.qty, 0);
  const productDiscount = Math.max(0, mrpTotal - subtotal);
  let couponDiscount = 0;
  if (appliedCode) {
    const coupon = DEFAULT_COUPONS.find((c) => c.code === appliedCode && c.enabled);
    if (coupon && subtotal >= coupon.minOrderAmount) {
      if (coupon.discountType === "FLAT") {
        couponDiscount = coupon.discountValue;
      } else {
        couponDiscount = Math.round((subtotal * coupon.discountValue) / 100);
        if (coupon.maxDiscountCap) {
          couponDiscount = Math.min(couponDiscount, coupon.maxDiscountCap);
        }
      }
    }
  }
  const afterDiscount = Math.max(0, subtotal - couponDiscount);
  const shippingFee =
    afterDiscount >= BUSINESS_CONFIG.ecommerce.freeShippingThreshold || items.length === 0
      ? 0
      : BUSINESS_CONFIG.ecommerce.standardShippingFee;
  const gstAmount = Math.round((afterDiscount * BUSINESS_CONFIG.ecommerce.gstRatePercentage) / 100);
  const finalTotal = afterDiscount + shippingFee;
  const totalSavings = productDiscount + couponDiscount;
  const itemCount = items.reduce((s, i) => s + i.qty, 0);
  return {
    items,
    appliedCoupon: appliedCode,
    subtotal,
    mrpTotal,
    productDiscount,
    couponDiscount,
    shippingFee,
    gstAmount,
    finalTotal,
    totalSavings,
    itemCount,
  };
}
// ============================================================================
// 3. WISHLIST STORE
// ============================================================================
const WISHLIST_KEY = "hopo_wishlist_items";
export function getWishlist() {
  return getStored(WISHLIST_KEY, []);
}
export function toggleWishlist(product) {
  const current = getWishlist();
  const exists = current.some((p) => p.id === product.id);
  let updated;
  if (exists) {
    updated = current.filter((p) => p.id !== product.id);
  } else {
    updated = [...current, product];
  }
  setStored(WISHLIST_KEY, updated);
  return !exists;
}
export function isInWishlist(productId) {
  const current = getWishlist();
  return current.some((p) => p.id === productId);
}
// ============================================================================
// 4. ORDERS & TRACKING STORE
// ============================================================================
const ORDERS_KEY = "hopo_user_orders";
export function sanitizeOrderItem(item) {
  return {
    ...item,
    selectedColor: item.selectedColor || item.color || "Standard",
    unitPrice: item.unitPrice || item.price,
    image: resolveProductImage({
      id: item.id,
      image: item.image,
      title: item.title,
      category: item.category,
      brand: item.brand,
    }),
  };
}
export const DEFAULT_ORDERS = [];
export function getOrders() {
  const user = getAuthUser();
  const stored = getStored(ORDERS_KEY, null);
  const baseOrders = stored !== null ? stored : DEFAULT_ORDERS;
  // Heal existing stored orders if any image references are outdated or broken
  let mutated = false;
  const healed = baseOrders.map((order) => {
    let orderChanged = false;
    const sanitizedItems = order.items.map((item) => {
      const cleanImg = resolveProductImage({
        id: item.id,
        image: item.image,
        title: item.title,
        category: item.category,
        brand: item.brand,
      });
      if (cleanImg !== item.image) {
        orderChanged = true;
        mutated = true;
        return { ...item, image: cleanImg };
      }
      return item;
    });
    return orderChanged ? { ...order, items: sanitizedItems } : order;
  });
  if (mutated && typeof window !== "undefined") {
    setStored(ORDERS_KEY, healed);
  }
  if (!user) return [];
  if (user.role === "ADMIN") return healed;
  return healed.filter((o) => o.userId === user.id);
}
export function createOrder(payload) {
  const calc = getCartCalculations();
  const now = new Date();
  const estDate = new Date(now.getTime() + 3 * 86400000);
  const orderId = `HOPO-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
  const trackingNumber = `BLUEDART-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
  const sanitizedItems = payload.items.map((item) => sanitizeOrderItem(item));
  const newOrder = {
    id: orderId,
    userId: payload.userId,
    items: sanitizedItems,
    subtotal: calc.subtotal,
    mrpTotal: calc.mrpTotal,
    couponDiscount: calc.couponDiscount,
    appliedCoupon: calc.appliedCoupon || undefined,
    shippingFee: calc.shippingFee,
    gstAmount: calc.gstAmount,
    totalAmount: calc.finalTotal,
    paymentMethod: payload.paymentMethod,
    paymentStatus: payload.paymentMethod === "COD" ? "PENDING" : "PAID",
    orderStatus: "CONFIRMED",
    deliveryAddress: payload.deliveryAddress,
    createdAt: now.toISOString(),
    estimatedDeliveryDate: estDate.toLocaleDateString("en-IN", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    trackingNumber,
    courierPartner: "BlueDart Express Luxe",
    timeline: [
      {
        status: "CONFIRMED",
        title: "Order Placed & Confirmed",
        description: "Your luxury ensemble order has been verified by Hopo Atelier.",
        timestamp: now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        completed: true,
      },
      {
        status: "PACKED",
        title: "Quality Check & Luxury Gift Packaging",
        description: "Handcrafted garment passed rigorous 12-point quality inspection.",
        timestamp: "Estimated today",
        completed: false,
      },
      {
        status: "SHIPPED",
        title: "Handed Over to BlueDart Courier",
        description: `Waybill created: ${trackingNumber}`,
        timestamp: "Next business day",
        completed: false,
      },
      {
        status: "DELIVERED",
        title: "Delivery to Doorstep",
        description: `Expected by ${estDate.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })}`,
        timestamp: "Pending dispatch",
        completed: false,
      },
    ],
  };
  const stored = getStored(ORDERS_KEY, null);
  const allOrders = stored !== null ? stored : DEFAULT_ORDERS;
  setStored(ORDERS_KEY, [newOrder, ...allOrders]);
  clearCart();
  // Asynchronously synchronize with MySQL backend
  if (typeof window !== "undefined") {
    orderApi
      .checkout({
        items: payload.items.map((it) => ({
          productId: it.id,
          variantId: it.variantId,
          size: it.size,
          quantity: it.qty,
        })),
        deliveryAddress: payload.deliveryAddress,
        paymentMethod: payload.paymentMethod,
        appliedCoupon: calc.appliedCoupon || undefined,
      })
      .then((res) => {
        if (res.success && res.data) {
          const curOrders = getStored(ORDERS_KEY, []);
          const idx = curOrders.findIndex((o) => o.id === newOrder.id);
          if (idx !== -1) {
            curOrders[idx] = res.data;
            setStored(ORDERS_KEY, curOrders);
          }
        }
      })
      .catch((err) => {
        console.warn("Backend order sync notice:", err);
      });
  }
  return newOrder;
}
export async function createOrderAsync(payload) {
  const calc = getCartCalculations();
  try {
    const res = await orderApi.checkout({
      items: payload.items.map((it) => ({
        productId: it.id,
        variantId: it.variantId,
        size: it.size,
        quantity: it.qty,
      })),
      deliveryAddress: payload.deliveryAddress,
      paymentMethod: payload.paymentMethod,
      appliedCoupon: calc.appliedCoupon || undefined,
    });
    if (res.success && res.data) {
      const stored = getStored(ORDERS_KEY, null);
      const allOrders = stored !== null ? stored : DEFAULT_ORDERS;
      setStored(ORDERS_KEY, [res.data, ...allOrders]);
      clearCart();
      return res.data;
    }
  } catch (err) {
    console.warn("API checkout failed, fallback to local:", err);
  }
  return createOrder(payload);
}
export function getOrderById(id) {
  const orders = getOrders();
  return orders.find((o) => o.id === id);
}
// ============================================================================
// 5. NOTIFICATIONS STORE
// ============================================================================
const NOTIF_KEY = "hopo_notifications";
const NOTIF_COUNT_KEY = "hopo_notifications_unread_count";
const ADMIN_NOTIF_KEY = "hopo_admin_notifications";

export const DEFAULT_CUSTOMER_NOTIFICATIONS = [];
export const DEFAULT_ADMIN_NOTIFICATIONS = [];

export function getNotifications() {
  const stored = getStored(NOTIF_KEY, null);
  if (stored !== null) return stored;
  return DEFAULT_CUSTOMER_NOTIFICATIONS;
}
export function setNotifications(items) {
  setStored(NOTIF_KEY, items);
  const unread = items.filter((n) => !n.read && !n.isRead && !n.is_read).length;
  setUnreadNotificationCount(unread);
}
export function getAdminNotifications(category = "ALL") {
  const stored = getStored(ADMIN_NOTIF_KEY, null);
  const list = stored !== null ? stored : DEFAULT_ADMIN_NOTIFICATIONS;
  if (!category || category === "ALL") return list;
  return list.filter((n) => n.category?.toUpperCase() === category.toUpperCase());
}
export function setAdminNotificationsStore(items) {
  setStored(ADMIN_NOTIF_KEY, items);
}
export function getUnreadNotificationCount() {
  const notifs = getNotifications();
  const unread = notifs.filter((n) => !n.read && !n.isRead && !n.is_read).length;
  return getStored(NOTIF_COUNT_KEY, unread);
}
export function setUnreadNotificationCount(count) {
  const next = Math.max(0, count);
  if (getUnreadNotificationCount() !== next) {
    setStored(NOTIF_COUNT_KEY, next);
  }
}
export function markAllNotificationsRead() {
  const list = getNotifications().map((n) => ({ ...n, read: true, isRead: true, is_read: true }));
  setStored(NOTIF_KEY, list);
  setUnreadNotificationCount(0);
}
export function clearNotifications() {
  setStored(NOTIF_KEY, []);
  setUnreadNotificationCount(0);
}
export async function syncUnreadCountFromApi() {
  try {
    const user = getAuthUser();
    if (!user) {
      if (getUnreadNotificationCount() !== 0) {
        setUnreadNotificationCount(0);
      }
      return 0;
    }
    const res = await notificationApi.getUnreadCount();
    if (res && res.success && typeof res.data?.count === "number") {
      setUnreadNotificationCount(res.data.count);
      return res.data.count;
    }
  } catch {
    // Non-blocking fallback
  }
  return getUnreadNotificationCount();
}
// ============================================================================
// 6. ADMIN OFFERS STORE (FULL CRUD)
// ============================================================================
const ADMIN_OFFERS_KEY = "hopo_admin_offers";
export const INITIAL_ADMIN_OFFERS = [];
export function getAdminOffers() {
  return getStored(ADMIN_OFFERS_KEY, INITIAL_ADMIN_OFFERS);
}
export function createAdminOffer(data) {
  const current = getAdminOffers();
  const newOffer = {
    ...data,
    id: `OFF-2026-${Math.floor(100 + Math.random() * 900)}`,
    code: data.code.trim().toUpperCase(),
    createdAt: new Date().toISOString(),
  };
  setStored(ADMIN_OFFERS_KEY, [newOffer, ...current]);
  return newOffer;
}
export function updateAdminOffer(id, data) {
  const current = getAdminOffers();
  const idx = current.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  const updated = {
    ...current[idx],
    ...data,
    code: data.code ? data.code.trim().toUpperCase() : current[idx].code,
  };
  current[idx] = updated;
  setStored(ADMIN_OFFERS_KEY, [...current]);
  return updated;
}
export function deleteAdminOffer(id) {
  const current = getAdminOffers();
  const filtered = current.filter((o) => o.id !== id);
  if (filtered.length === current.length) return false;
  setStored(ADMIN_OFFERS_KEY, filtered);
  return true;
}
export function toggleAdminOfferStatus(id) {
  const current = getAdminOffers();
  const idx = current.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  current[idx] = {
    ...current[idx],
    status: current[idx].status === "ACTIVE" ? "PAUSED" : "ACTIVE",
  };
  setStored(ADMIN_OFFERS_KEY, [...current]);
  return current[idx];
}
// ============================================================================
// 7. ADMIN PRICING STORE (FULL CRUD & REAL-TIME STOREFRONT SYNC)
// ============================================================================
const PRICING_OVERRIDES_KEY = "hopo_admin_pricing_overrides";
export function getPriceOverrides() {
  return getStored(PRICING_OVERRIDES_KEY, {});
}
export function updateProductPrice(productId, price, mrp) {
  const overrides = getPriceOverrides();
  const updated = {
    productId,
    price: Math.max(0, Math.round(price)),
    mrp: Math.max(price, Math.round(mrp)),
    updatedAt: new Date().toISOString(),
  };
  overrides[productId] = updated;
  setStored(PRICING_OVERRIDES_KEY, { ...overrides });
  // Sync to MySQL backend in background
  if (typeof window !== "undefined") {
    adminApi.setPriceOverride(productId, updated.price, updated.mrp).catch(() => {});
  }
  return updated;
}
export function deletePriceOverride(productId) {
  const overrides = getPriceOverrides();
  if (!overrides[productId]) return false;
  delete overrides[productId];
  setStored(PRICING_OVERRIDES_KEY, { ...overrides });
  // Sync to MySQL backend in background
  if (typeof window !== "undefined") {
    adminApi.clearPriceOverride(productId).catch(() => {});
  }
  return true;
}
export function getEffectiveProductPrice(product) {
  const overrides = getPriceOverrides();
  const override = overrides[product.id];
  const price = override ? override.price : product.price;
  const mrp = override ? override.mrp : product.mrp || product.price;
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  return { price, mrp, discount, isOverridden: !!override };
}
